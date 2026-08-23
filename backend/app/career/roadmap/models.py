from sqlalchemy import Column, Integer, String, DateTime, func, Text
from app.db.database import Base
from datetime import datetime

class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    target_role = Column(String, nullable=True)
    target_date = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, COMPLETED, ABANDONED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False) # CODING, APTITUDE, TECHNICAL, COMMUNICATION, INTERVIEW, RESUME, PROJECTS, JOBS, GENERAL
    priority = Column(String, nullable=False) # HIGH, MEDIUM, LOW
    source = Column(String, nullable=False) # DETERMINISTIC, AI
    status = Column(String, default="PENDING") # PENDING, COMPLETED, SKIPPED
    reference_type = Column(String, nullable=True)
    reference_id = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
