import uuid
import traceback
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from sqlmodel import Session, select

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# データベース設定、モデル、AIサービスをインポート
from app.core.database import create_db_and_tables, get_session
from app.models.models import (
    Incident, ConfigurationItem, User, Team, Problem, Change, Release,
    IncidentStatus, ProblemStatus, ChangeStatus, ReleaseStatus
)
from app.services.ai_service import get_embedding


@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリケーション起動時にDBテーブルを作成
    logger.info("Creating database tables...")
    create_db_and_tables()
    logger.info("Database tables created.")
    yield
    # アプリケーション終了時の処理
    logger.info("Application shutdown.")


app = FastAPI(
    title="AI-Driven ITIL Management Tool",
    description="ITIL-compliant management with Gemini-powered vector embeddings.",
    version="1.1.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = traceback.format_exc()
    logger.error(f"Unhandled exception: {error_detail}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc), "traceback": error_detail},
    )

# CORS設定を追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to AI-driven ITIL Management Tool!"}

# --- Team Endpoints ---

@app.post("/teams/", response_model=Team)
def create_team(team: Team, session: Session = Depends(get_session)):
    logger.info(f"Creating team: {team.name}")
    try:
        session.add(team)
        session.commit()
        session.refresh(team)
        return team
    except Exception as e:
        logger.error(f"Error creating team: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/teams/", response_model=List[Team])
def read_teams(session: Session = Depends(get_session)):
    return session.exec(select(Team)).all()

# --- User Endpoints ---

@app.post("/users/", response_model=User)
def create_user(user: User, session: Session = Depends(get_session)):
    """ユーザーを作成します。既に存在する場合は既存のユーザーを返します。"""
    logger.info(f"Creating user: {user.username} with ID {user.id}")
    try:
        existing_user = session.get(User, user.id)
        if existing_user:
            logger.info(f"User {user.id} already exists.")
            return existing_user
        
        # usernameやemailの重複もチェック
        db_user = session.exec(select(User).where((User.username == user.username) | (User.email == user.email))).first()
        if db_user:
            logger.info(f"User with username {user.username} or email {user.email} already exists.")
            return db_user

        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()

# --- Incident Endpoints ---

@app.post("/incidents/", response_model=Incident)
def create_incident(incident: Incident, session: Session = Depends(get_session)):
    """
    新しいインシデントを作成します。
    作成時にタイトルと説明からベクトル埋め込みを自動生成します。
    """
    logger.info(f"Creating incident: {incident.title}")
    # インシデントの情報を元に埋め込みテキストを作成
    embedding_text = f"Title: {incident.title}\nDescription: {incident.description or ''}"
    
    try:
        # Gemini APIを使用してベクトルを生成
        logger.info(f"Generating embedding for incident: {incident.title}")
        vector = get_embedding(embedding_text)
        incident.embedding = vector
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")

    try:
        session.add(incident)
        session.commit()
        session.refresh(incident)
        return incident
    except Exception as e:
        logger.error(f"Error creating incident: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/incidents/", response_model=List[Incident])
def read_incidents(
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    session: Session = Depends(get_session)
):
    """インシデントの一覧を取得します"""
    incidents = session.exec(select(Incident).offset(offset).limit(limit)).all()
    return incidents

@app.get("/incidents/{incident_id}", response_model=Incident)
def read_incident(incident_id: uuid.UUID, session: Session = Depends(get_session)):
    """指定されたIDのインシデント詳細を取得します"""
    incident = session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.put("/incidents/{incident_id}", response_model=Incident)
def update_incident(incident_id: uuid.UUID, incident_data: dict, session: Session = Depends(get_session)):
    """既存のインシデントを更新します。部分的な更新（タイトルのみなど）を許容します。"""
    db_incident = session.get(Incident, incident_id)
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # 送信されたデータで更新
    new_title = incident_data.get("title", db_incident.title)
    new_description = incident_data.get("description", db_incident.description)

    # タイトルまたは説明が変更された場合、埋め込みを再生成
    if db_incident.title != new_title or db_incident.description != new_description:
        try:
            embedding_text = f"Title: {new_title}\nDescription: {new_description or ''}"
            db_incident.embedding = get_embedding(embedding_text)
        except Exception as e:
            logger.error(f"Failed to update embedding: {e}")

    for key, value in incident_data.items():
        if hasattr(db_incident, key) and key not in ["id", "created_at", "embedding"]:
            setattr(db_incident, key, value)
    
    db_incident.updated_at = datetime.utcnow()
    session.add(db_incident)
    session.commit()
    session.refresh(db_incident)
    return db_incident

@app.delete("/incidents/{incident_id}")
def delete_incident(incident_id: uuid.UUID, session: Session = Depends(get_session)):
    """指定されたIDのインシデントを削除します"""
    incident = session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    session.delete(incident)
    session.commit()
    return {"message": "Incident deleted successfully"}

@app.get("/incidents/search/", response_model=List[Incident])
def search_incidents(
    query: str,
    limit: int = Query(default=5, le=10),
    session: Session = Depends(get_session)
):
    """
    クエリ文字列を受け取り、ベクトル類似度検索を使用して類似したインシデントを検索します。
    """
    if not query:
        return []
    
    try:
        # クエリの埋め込みを生成
        query_vector = get_embedding(query)
        
        # pgvectorを使用して類似度検索を実行
        statement = select(Incident).order_by(Incident.embedding.cosine_distance(query_vector)).limit(limit)
        results = session.exec(statement).all()
        return results
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail="Search operation failed")

# --- Problem Endpoints ---

@app.post("/problems/", response_model=Problem)
def create_problem(problem: Problem, session: Session = Depends(get_session)):
    logger.info(f"Creating problem: {problem.title}")
    try:
        session.add(problem)
        session.commit()
        session.refresh(problem)
        return problem
    except Exception as e:
        logger.error(f"Error creating problem: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/problems/", response_model=List[Problem])
def read_problems(session: Session = Depends(get_session)):
    return session.exec(select(Problem)).all()

@app.get("/problems/{problem_id}", response_model=Problem)
def read_problem(problem_id: uuid.UUID, session: Session = Depends(get_session)):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@app.put("/problems/{problem_id}", response_model=Problem)
def update_problem(problem_id: uuid.UUID, problem_data: dict, session: Session = Depends(get_session)):
    db_problem = session.get(Problem, problem_id)
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    for key, value in problem_data.items():
        if hasattr(db_problem, key) and key not in ["id", "created_at"]:
            setattr(db_problem, key, value)
    db_problem.updated_at = datetime.utcnow()
    session.add(db_problem)
    session.commit()
    session.refresh(db_problem)
    return db_problem

# --- Change Endpoints ---

@app.post("/changes/", response_model=Change)
def create_change(change: Change, session: Session = Depends(get_session)):
    logger.info(f"POST /changes/ - Received data: {change.model_dump()}")
    try:
        # ユーザーの存在確認
        requester = session.get(User, change.requested_by_id)
        if not requester:
            new_user = User(
                id=change.requested_by_id,
                username=f"user_{str(change.requested_by_id)[:8]}",
                email=f"user_{str(change.requested_by_id)[:8]}@example.com",
                is_admin=True
            )
            session.add(new_user)
            session.commit()

        session.add(change)
        session.commit()
        session.refresh(change)
        return change
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/changes/", response_model=List[Change])
def read_changes(session: Session = Depends(get_session)):
    return session.exec(select(Change)).all()

@app.get("/changes/{change_id}", response_model=Change)
def read_change(change_id: uuid.UUID, session: Session = Depends(get_session)):
    change = session.get(Change, change_id)
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    return change

@app.put("/changes/{change_id}", response_model=Change)
def update_change(change_id: uuid.UUID, change_data: dict, session: Session = Depends(get_session)):
    db_change = session.get(Change, change_id)
    if not db_change:
        raise HTTPException(status_code=404, detail="Change not found")
    for key, value in change_data.items():
        if hasattr(db_change, key) and key not in ["id", "created_at"]:
            setattr(db_change, key, value)
    db_change.updated_at = datetime.utcnow()
    session.add(db_change)
    session.commit()
    session.refresh(db_change)
    return db_change

# --- Release Endpoints ---

@app.post("/releases/", response_model=Release)
def create_release(release: Release, session: Session = Depends(get_session)):
    logger.info(f"Creating release: version {release.version}")
    try:
        session.add(release)
        session.commit()
        session.refresh(release)
        return release
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/releases/", response_model=List[Release])
def read_releases(session: Session = Depends(get_session)):
    return session.exec(select(Release)).all()

@app.get("/releases/{release_id}", response_model=Release)
def read_release(release_id: uuid.UUID, session: Session = Depends(get_session)):
    release = session.get(Release, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    return release

@app.put("/releases/{release_id}", response_model=Release)
def update_release(release_id: uuid.UUID, release_data: dict, session: Session = Depends(get_session)):
    db_release = session.get(Release, release_id)
    if not db_release:
        raise HTTPException(status_code=404, detail="Release not found")
    for key, value in release_data.items():
        if hasattr(db_release, key) and key not in ["id", "created_at"]:
            setattr(db_release, key, value)
    db_release.updated_at = datetime.utcnow()
    session.add(db_release)
    session.commit()
    session.refresh(db_release)
    return db_release

# --- Configuration Item (CI) Endpoints ---

@app.post("/configuration-items/", response_model=ConfigurationItem)
def create_configuration_item(ci: ConfigurationItem, session: Session = Depends(get_session)):
    session.add(ci)
    session.commit()
    session.refresh(ci)
    return ci

@app.get("/configuration-items/", response_model=List[ConfigurationItem])
def read_configuration_items(
    offset: int = 0,
    limit: int = Query(default=100, le=100),
    session: Session = Depends(get_session)
):
    cis = session.exec(select(ConfigurationItem).offset(offset).limit(limit)).all()
    return cis

@app.get("/configuration-items/{ci_id}", response_model=ConfigurationItem)
def read_configuration_item(ci_id: uuid.UUID, session: Session = Depends(get_session)):
    ci = session.get(ConfigurationItem, ci_id)
    if not ci:
        raise HTTPException(status_code=404, detail="Configuration Item not found")
    return ci

# --- Static Files & SPA Routing ---

if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
             raise HTTPException(status_code=404)
        
        index_file = os.path.join("static", "index.html")
        if os.path.exists(index_file):
            from fastapi.responses import FileResponse
            return FileResponse(index_file)
        raise HTTPException(status_code=404)

# --- Health Check ---

@app.get("/health")
async def health_check(session: Session = Depends(get_session)):
    try:
        session.exec(select(User)).first()
        return {"status": "ok", "database_connection": "successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")
