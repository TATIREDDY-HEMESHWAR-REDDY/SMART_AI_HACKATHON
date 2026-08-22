from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.db.database import Base

class CareerReadinessScore(Base):
    __tablename__ = "career_readiness_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    
    overall_score = Column(Float, nullable=True) # None if insufficient data
    
    coding_score = Column(Float, nullable=True)
    aptitude_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    interview_score = Column(Float, nullable=True)
    resume_score = Column(Float, nullable=True)
    projects_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
