import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional, Any
import os

from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import UserDefinedType, JSON
from sqlalchemy import create_engine

# --- pgvector support ---

class Vector(UserDefinedType):
    def __init__(self, dim):
        self.dim = dim

    def get_col_spec(self, **kw):
        return f"VECTOR({self.dim})"

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(self)
        else:
            return dialect.type_descriptor(JSON)

    def bind_processor(self, dialect):
        return None

    def result_processor(self, dialect, coltype):
        return None

# --- Enums ---
class IncidentStatus(str, Enum):
    NEW = "New"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class ProblemStatus(str, Enum):
    OPEN = "Open"
    IDENTIFIED = "Identified"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class ChangeStatus(str, Enum):
    REQUESTED = "Requested"
    PLANNING = "Planning"
    APPROVED = "Approved"
    IMPLEMENTING = "Implementing"
    COMPLETED = "Completed"
    CLOSED = "Closed"
    CANCELED = "Canceled"

class ChangeType(str, Enum):
    NORMAL = "Normal"
    STANDARD = "Standard"
    EMERGENCY = "Emergency"

class ReleaseStatus(str, Enum):
    PLANNED = "Planned"
    BUILDING = "Building"
    TESTING = "Testing"
    DEPLOYED = "Deployed"
    CLOSED = "Closed"

# --- Link Models (Mapping Tables) ---

class IncidentProblemMap(SQLModel, table=True):
    __tablename__ = "incident_problem_map"
    incident_id: uuid.UUID = Field(foreign_key="incidents.id", primary_key=True)
    problem_id: uuid.UUID = Field(foreign_key="problems.id", primary_key=True)

class ProblemChangeMap(SQLModel, table=True):
    __tablename__ = "problem_change_map"
    problem_id: uuid.UUID = Field(foreign_key="problems.id", primary_key=True)
    change_id: uuid.UUID = Field(foreign_key="changes.id", primary_key=True)

class ChangeReleaseMap(SQLModel, table=True):
    __tablename__ = "change_release_map"
    change_id: uuid.UUID = Field(foreign_key="changes.id", primary_key=True)
    release_id: uuid.UUID = Field(foreign_key="releases.id", primary_key=True)

# Legacy link table support
class IncidentConfigurationItemLink(SQLModel, table=True):
    __tablename__ = "incidentconfigurationitemlink"
    incident_id: uuid.UUID = Field(foreign_key="incidents.id", primary_key=True)
    ci_id: uuid.UUID = Field(foreign_key="configuration_items.id", primary_key=True)

# --- Base Model ---
class ITILBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

# --- Core Models ---

class Team(ITILBase, table=True):
    __tablename__ = "teams"
    name: str = Field()
    email: Optional[str] = None
    users: List["User"] = Relationship(back_populates="team")

class User(ITILBase, table=True):
    __tablename__ = "users"
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None
    is_admin: bool = False
    team_id: Optional[uuid.UUID] = Field(default=None, foreign_key="teams.id")
    team: Optional[Team] = Relationship(back_populates="users")

class ConfigurationItem(ITILBase, table=True):
    __tablename__ = "configuration_items"
    name: str = Field(index=True)
    description: Optional[str] = None
    type: str = Field() # Maps to ci_type
    status: str = Field(default="Active")
    environment: Optional[str] = None
    owner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    last_updated_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")

class Incident(ITILBase, table=True):
    __tablename__ = "incidents"
    title: str = Field(index=True)
    description: Optional[str] = None
    status: str = Field(default="New")
    priority: str = Field()
    reported_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    category: Optional[str] = None
    
    requester_id: uuid.UUID = Field(foreign_key="users.id")
    assignee_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    ci_id: Optional[uuid.UUID] = Field(default=None, foreign_key="configuration_items.id")

    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(768), nullable=True))

    problems: List["Problem"] = Relationship(link_model=IncidentProblemMap, back_populates="incidents")

class Problem(ITILBase, table=True):
    __tablename__ = "problems"
    title: str = Field(index=True)
    description: Optional[str] = None
    root_cause: Optional[str] = None
    workaround: Optional[str] = None
    status: str = Field(default="Open")
    identified_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    incidents: List["Incident"] = Relationship(link_model=IncidentProblemMap, back_populates="problems")
    changes: List["Change"] = Relationship(link_model=ProblemChangeMap, back_populates="problems")

class Change(ITILBase, table=True):
    __tablename__ = "changes"
    title: str = Field(index=True)
    description: Optional[str] = None
    status: str = Field(default="Requested")
    change_type: str = Field(default="Normal")
    impact_analysis: Optional[str] = None
    backout_plan: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    requested_by_id: uuid.UUID = Field(foreign_key="users.id")
    assignee_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")

    problems: List["Problem"] = Relationship(link_model=ProblemChangeMap, back_populates="changes")
    releases: List["Release"] = Relationship(link_model=ChangeReleaseMap, back_populates="changes")

class Release(ITILBase, table=True):
    __tablename__ = "releases"
    version: str = Field()
    release_note: Optional[str] = None
    status: str = Field(default="Planned")
    actual_date: Optional[datetime] = None
    planned_at: datetime = Field(default_factory=datetime.utcnow)
    
    managed_by_id: uuid.UUID = Field(foreign_key="users.id")

    changes: List["Change"] = Relationship(link_model=ChangeReleaseMap, back_populates="releases")
