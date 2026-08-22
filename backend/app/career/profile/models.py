from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, func
from app.db.database import Base

class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    target_role = Column(String, nullable=True)
    target_domain = Column(String, nullable=True)
    career_objective = Column(String, nullable=True)
    
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    # Store JSON arrays for simplicity in SQLite for these fields
    projects = Column(JSON, default=[])
    internships = Column(JSON, default=[])
    certifications = Column(JSON, default=[])
    achievements = Column(JSON, default=[])
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
