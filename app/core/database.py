import os
from typing import Generator

from sqlmodel import create_engine, Session

# .env ファイルからDATABASE_URLを読み込む
# `db` は docker-compose.yml で定義したPostgreSQLサービス名です。
# 環境変数に設定されていない場合はデフォルト値を使用します。
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/incident_management")

# SQLAlchemyエンジンを作成
# `echo=True` はSQLクエリをログに出力します (デバッグ用)。
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """
    SQLModelで定義されたすべてのテーブルを作成します。
    これはアプリケーション起動時に一度だけ実行されるべきです。
    """
    # ここでモデルがインポートされていることを確認してください。
    # (例: from app.models.models import Hero)
    # モデルをインポートしないとmetadataが空になりテーブルが作成されません。
    from app.models.models import SQLModel
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """リクエストごとに新しいSQLModelセッションを提供します。"""
    with Session(engine) as session:
        yield session