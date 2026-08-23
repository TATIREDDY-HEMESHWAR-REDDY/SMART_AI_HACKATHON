from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String)
    description = Column(String)
    employment_type = Column(String) # FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    requirements = Column(JSON) # list of skills/keywords
    posted_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("JobApplication", back_populates="job")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    saved_at = Column(DateTime, default=datetime.utcnow)
    
    job = relationship("Job")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id", ondelete="RESTRICT"), index=True)
    status = Column(String, default="APPLIED") # DRAFT, APPLIED, INTERVIEWING, OFFER, REJECTED
    applied_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume")
    activities = relationship("ApplicationActivity", back_populates="application", cascade="all, delete-orphan")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id", ondelete="CASCADE"), index=True)
    
    match_score = Column(Float, nullable=True) # AI overall score
    deterministic_score = Column(Float, nullable=True) # Rule-based score
    ai_analysis = Column(JSON, nullable=True)
    missing_skills = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    job = relationship("Job")
    resume = relationship("Resume")


class ApplicationActivity(Base):
    __tablename__ = "application_activities"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id", ondelete="CASCADE"), index=True)
    activity_type = Column(String) # STATUS_CHANGE, INTERVIEW_SCHEDULED, NOTE
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("JobApplication", back_populates="activities")
