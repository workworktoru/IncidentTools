import os
import pytest
import sys
import uuid
from datetime import datetime
from sqlmodel import Session, SQLModel, create_engine, select

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.models import (
    User, ConfigurationItem, Incident, Problem, Change, Release,
    IncidentStatus, ImpactLevel, UrgencyLevel, PriorityLevel, CategoryType,
    ConfigurationItemStatus, ProblemStatus, ChangeStatus, ChangeType, ReleaseStatus
)

# テスト用データベースURL (環境変数から取得、デフォルトはdocker-composeの設定に合わせる)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/incident_management")
engine = create_engine(DATABASE_URL)

@pytest.fixture(name="session")
def session_fixture():
    # テーブルの作成
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    session.close() # セッションを閉じる
    # テスト後にデータをクリーンアップ（必要に応じて）
    # SQLModel.metadata.drop_all(engine)

def test_create_user(session: Session):
    """ユーザー作成のテスト"""
    user = User(
        username="test_admin",
        email="admin@example.com",
        full_name="Test Administrator",
        is_admin=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    assert isinstance(user.id, uuid.UUID)
    assert user.username == "test_admin"
    assert user.is_active is True

def test_create_configuration_item(session: Session):
    """構成アイテム(CI)の作成とユーザーのリレーションテスト"""
    # ユーザー作成
    owner = User(username="ci_owner", email="owner@example.com")
    session.add(owner)
    session.commit()

    # CI作成
    ci = ConfigurationItem(
        name="Core Router 01",
        description="Main branch router",
        type=CategoryType.NETWORK,
        status=ConfigurationItemStatus.ACTIVE,
        owner_id=owner.id,
        last_updated_by_id=owner.id
    )
    session.add(ci)
    session.commit()
    session.refresh(ci)

    assert ci.name == "Core Router 01"
    assert ci.type == CategoryType.NETWORK
    assert ci.owner.username == "ci_owner"
    assert ci.last_updated_by.username == "ci_owner"

def test_create_incident_with_vector(session: Session):
    """インシデント作成とEmbedding(Vector)のテスト"""
    reporter = User(username="reporter", email="reporter@example.com")
    session.add(reporter)
    session.commit()

    # 768次元のダミーベクトル
    dummy_embedding = [0.1] * 768

    incident = Incident(
        title="Network connectivity lost",
        description="Cannot access the internal payroll system",
        status=IncidentStatus.NEW,
        impact=ImpactLevel.HIGH,
        urgency=UrgencyLevel.MEDIUM,
        priority=PriorityLevel.HIGH,
        reported_by_id=reporter.id,
        assigned_to_id=reporter.id, # 担当者も設定
        embedding=dummy_embedding
    )
    session.add(incident)
    session.commit()
    session.refresh(incident)

    retrieved_incident = session.get(Incident, incident.id)

    assert incident.title == "Network connectivity lost"
    assert retrieved_incident.reported_by.username == "reporter"
    assert retrieved_incident.assigned_to.username == "reporter"
    assert len(retrieved_incident.embedding) == 768
    assert retrieved_incident.embedding == pytest.approx(dummy_embedding)
    assert retrieved_incident.status == IncidentStatus.NEW
    assert retrieved_incident.impact == ImpactLevel.HIGH
    assert retrieved_incident.urgency == UrgencyLevel.MEDIUM
    assert retrieved_incident.priority == PriorityLevel.HIGH
    assert isinstance(retrieved_incident.reported_at, datetime)

def test_incident_ci_relationship(session: Session):
    """インシデントとCIの多対多リレーションシップのテスト"""
    # データの準備
    user = User(username="rel_user", email="rel_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    ci1 = ConfigurationItem(name="Web Server", type=CategoryType.SOFTWARE, owner_id=user.id)
    ci2 = ConfigurationItem(name="Database Server", type=CategoryType.DATABASE, owner_id=user.id)
    session.add(ci1)
    session.add(ci2)
    session.commit()
    session.refresh(ci1)
    session.refresh(ci2)

    incident = Incident(
        title="Server Down", 
        impact=ImpactLevel.CRITICAL, urgency=UrgencyLevel.HIGH, priority=PriorityLevel.CRITICAL,
        reported_by_id=user.id,
        assigned_to_id=user.id,
        embedding=[0.5] * 768
    )
    
    # リレーションシップの構築
    incident.configuration_items.append(ci1)
    incident.configuration_items.append(ci2)
    session.add(incident)
    session.commit()
    session.refresh(incident)
    session.refresh(ci1)
    session.refresh(ci2)

    # リレーションシップの確認
    assert len(incident.configuration_items) == 2
    assert ci1 in incident.configuration_items
    assert ci2 in incident.configuration_items

    assert len(ci1.incidents) == 1
    assert incident in ci1.incidents

def test_problem_incident_relationship(session: Session):
    """ProblemとIncidentの多対多リレーションシップのテスト"""
    user = User(username="problem_user", email="problem_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    incident1 = Incident(title="Incident A", impact=ImpactLevel.LOW, urgency=UrgencyLevel.LOW, priority=PriorityLevel.LOW, reported_by_id=user.id, embedding=[0.1]*768)
    incident2 = Incident(title="Incident B", impact=ImpactLevel.MEDIUM, urgency=UrgencyLevel.MEDIUM, priority=PriorityLevel.MEDIUM, reported_by_id=user.id, embedding=[0.2]*768)
    session.add(incident1)
    session.add(incident2)
    session.commit()
    session.refresh(incident1)
    session.refresh(incident2)

    problem = Problem(title="Root Cause X", impact=ImpactLevel.HIGH, reported_by_id=user.id)
    session.add(problem)
    session.commit()
    session.refresh(problem)

    problem.incidents.append(incident1)
    problem.incidents.append(incident2)
    session.add(problem)
    session.commit()
    session.refresh(problem)
    session.refresh(incident1)

    assert len(problem.incidents) == 2
    assert incident1 in problem.incidents
    assert incident2 in problem.incidents
    assert len(incident1.problems) == 1
    assert problem in incident1.problems

def test_change_release_relationship(session: Session):
    """ChangeとReleaseの多対多リレーションシップのテスト"""
    user = User(username="change_user", email="change_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    change1 = Change(title="Software Update", impact=ImpactLevel.MEDIUM, requested_by_id=user.id)
    change2 = Change(title="DB Schema Migration", impact=ImpactLevel.HIGH, requested_by_id=user.id)
    session.add(change1)
    session.add(change2)
    session.commit()
    session.refresh(change1)
    session.refresh(change2)

    release = Release(title="Version 1.0.0", status=ReleaseStatus.PLANNED, managed_by_id=user.id)
    session.add(release)
    session.commit()
    session.refresh(release)

    release.changes.append(change1)
    release.changes.append(change2)
    session.add(release)
    session.commit()
    session.refresh(release)
    session.refresh(change1)

    assert len(release.changes) == 2
    assert change1 in release.changes
    assert change2 in release.changes
    assert len(change1.releases) == 1
    assert release in change1.releases

def test_problem_ci_relationship(session: Session):
    """ProblemとCIの多対多リレーションシップのテスト"""
    user = User(username="problem_ci_user", email="problem_ci_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    ci1 = ConfigurationItem(name="Load Balancer", type=CategoryType.NETWORK, owner_id=user.id)
    ci2 = ConfigurationItem(name="Web Application", type=CategoryType.APPLICATION, owner_id=user.id)
    session.add(ci1)
    session.add(ci2)
    session.commit()
    session.refresh(ci1)
    session.refresh(ci2)

    problem = Problem(title="Performance Degradation", impact=ImpactLevel.HIGH, reported_by_id=user.id)
    session.add(problem)
    session.commit()
    session.refresh(problem)

    problem.configuration_items.append(ci1)
    problem.configuration_items.append(ci2)
    session.add(problem)
    session.commit()
    session.refresh(problem)
    session.refresh(ci1)

    assert len(problem.configuration_items) == 2
    assert ci1 in problem.configuration_items
    assert ci2 in problem.configuration_items
    assert len(ci1.problems) == 1
    assert problem in ci1.problems

def test_change_ci_relationship(session: Session):
    """ChangeとCIの多対多リレーションシップのテスト"""
    user = User(username="change_ci_user", email="change_ci_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    ci1 = ConfigurationItem(name="Firewall Rule", type=CategoryType.SECURITY, owner_id=user.id)
    ci2 = ConfigurationItem(name="Application Codebase", type=CategoryType.SOFTWARE, owner_id=user.id)
    session.add(ci1)
    session.add(ci2)
    session.commit()
    session.refresh(ci1)
    session.refresh(ci2)

    change = Change(title="Security Patch Deployment", impact=ImpactLevel.HIGH, requested_by_id=user.id)
    session.add(change)
    session.commit()
    session.refresh(change)

    change.configuration_items.append(ci1)
    change.configuration_items.append(ci2)
    session.add(change)
    session.commit()
    session.refresh(change)
    session.refresh(ci1)

    assert len(change.configuration_items) == 2
    assert ci1 in change.configuration_items
    assert ci2 in change.configuration_items
    assert len(ci1.changes) == 1
    assert change in ci1.changes

def test_release_ci_relationship(session: Session):
    """ReleaseとCIの多対多リレーションシップのテスト"""
    user = User(username="release_ci_user", email="release_ci_user@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    ci1 = ConfigurationItem(name="Production Environment", type=CategoryType.INFRASTRUCTURE, owner_id=user.id)
    ci2 = ConfigurationItem(name="Monitoring System", type=CategoryType.APPLICATION, owner_id=user.id)
    session.add(ci1)
    session.add(ci2)
    session.commit()
    session.refresh(ci1)
    session.refresh(ci2)

    release = Release(title="New Feature Rollout", status=ReleaseStatus.COMPLETE, managed_by_id=user.id)
    session.add(release)
    session.commit()
    session.refresh(release)

    release.configuration_items.append(ci1)
    release.configuration_items.append(ci2)
    session.add(release)
    session.commit()
    session.refresh(release)
    session.refresh(ci1)

    assert len(release.configuration_items) == 2
    assert ci1 in release.configuration_items
    assert ci2 in release.configuration_items
    assert len(ci1.releases) == 1
    assert release in ci1.releases
