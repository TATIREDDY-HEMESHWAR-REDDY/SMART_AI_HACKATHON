from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Assessment(Base):
    __tablename__ = "career_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, index=True) # APTITUDE, TECHNICAL, COMMUNICATION, COMPANY
    topic = Column(String, index=True, nullable=True)
    difficulty = Column(String) # EASY, MEDIUM, HARD
    duration_minutes = Column(Integer)
    total_questions = Column(Integer)
    passing_score = Column(Float, default=60.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "career_assessment_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("career_assessments.id"))
    question_text = Column(Text)
    explanation = Column(Text, nullable=True)
    topic = Column(String, index=True)
    difficulty = Column(String)
    marks = Column(Float, default=1.0)
    negative_marks = Column(Float, default=0.0)
    
    # Store options as a list of dicts: [{"id": "A", "text": "Option A"}, ...]
    options = Column(JSON)
    correct_option_id = Column(String)
    
    assessment = relationship("Assessment", back_populates="questions")

class AssessmentAttempt(Base):
    __tablename__ = "career_assessment_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    assessment_id = Column(Integer, ForeignKey("career_assessments.id"))
    status = Column(String, default="NOT_STARTED") # NOT_STARTED, IN_PROGRESS, SUBMITTED, ABANDONED
    current_question_index = Column(Integer, default=0)
    
    started_at = Column(DateTime, nullable=True)
    last_saved_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    
    score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    correct_answers = Column(Integer, default=0)
    incorrect_answers = Column(Integer, default=0)
    unanswered = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, default=0)
    
    ai_insight = Column(Text, nullable=True)
    
    assessment = relationship("Assessment", back_populates="attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AssessmentAnswer(Base):
    __tablename__ = "career_assessment_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("career_assessment_attempts.id"))
    question_id = Column(Integer, ForeignKey("career_assessment_questions.id"))
    selected_option_id = Column(String, nullable=True)
    is_answered = Column(Boolean, default=False)
    marked_for_review = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("AssessmentQuestion")
