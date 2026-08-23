from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class InterviewSession(Base):
    __tablename__ = "career_interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    target_role = Column(String(100), nullable=True)
    interview_type = Column(String(50), nullable=False)
    mode = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=True)
    status = Column(String(50), default="NOT_STARTED")
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    overall_score = Column(Float, nullable=True)
    readiness_score = Column(Float, nullable=True)
    duration_seconds = Column(Integer, default=0)
    
    ai_summary = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.question_number")

class InterviewQuestion(Base):
    __tablename__ = "career_interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("career_interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=False)
    expected_topics = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="questions")
    response = relationship("InterviewResponse", back_populates="question", uselist=False, cascade="all, delete-orphan")

class InterviewResponse(Base):
    __tablename__ = "career_interview_responses"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("career_interview_questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    answer = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    time_spent_seconds = Column(Integer, default=0)
    
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    
    question = relationship("InterviewQuestion", back_populates="response")
