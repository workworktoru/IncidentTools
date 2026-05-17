from __future__ import annotations
import uuid
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, create_engine, Session

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(unique=True)
    
    # Forward reference to Incident
    incidents: List["Incident"] = Relationship(back_populates="reporter")

class Incident(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    reporter_id: uuid.UUID = Field(foreign_key="user.id")
    
    reporter: User = Relationship(back_populates="incidents")

engine = create_engine("sqlite:///:memory:")
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    u = User(username="test")
    session.add(u)
    session.commit()
    session.refresh(u)
    
    i = Incident(title="bug", reporter_id=u.id)
    session.add(i)
    session.commit()
    session.refresh(i)
    
    print(f"User: {u.username}, Incident count: {len(u.incidents)}")
