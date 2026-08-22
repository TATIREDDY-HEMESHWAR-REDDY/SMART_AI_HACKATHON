from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class CodingProblem(Base):
    __tablename__ = "career_coding_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(50), nullable=False) # EASY, MEDIUM, HARD
    topic = Column(String(100), nullable=False)
    constraints = Column(JSON, nullable=True) # Array of strings
    hints = Column(JSON, nullable=True) # Array of strings
    starter_code = Column(JSON, nullable=False) # {"python": "def solve():...", "javascript": "function solve() {...}"}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_cases = relationship("CodingTestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="problem")
    progress = relationship("CodingProgress", back_populates="problem")


class CodingTestCase(Base):
    __tablename__ = "career_coding_testcases"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("career_coding_problems.id"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=True)
    explanation = Column(Text, nullable=True)

    problem = relationship("CodingProblem", back_populates="test_cases")


class CodingSubmission(Base):
    __tablename__ = "career_coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    problem_id = Column(Integer, ForeignKey("career_coding_problems.id"), nullable=False)
    language = Column(String(50), nullable=False)
    source_code = Column(Text, nullable=False)
    
    status = Column(String(50), nullable=False) # ACCEPTED, WRONG_ANSWER, TIME_LIMIT, ERROR
    runtime_ms = Column(Integer, nullable=True)
    memory_kb = Column(Integer, nullable=True)
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    
    ai_feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("CodingProblem", back_populates="submissions")


class CodingProgress(Base):
    __tablename__ = "career_coding_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    problem_id = Column(Integer, ForeignKey("career_coding_problems.id"), nullable=False)
    
    status = Column(String(50), default="ATTEMPTED") # ATTEMPTED, SOLVED
    attempts = Column(Integer, default=1)
    best_runtime_ms = Column(Integer, nullable=True)
    time_spent_seconds = Column(Integer, default=0)
    
    first_attempted_at = Column(DateTime, default=datetime.utcnow)
    last_attempted_at = Column(DateTime, default=datetime.utcnow)
    solved_at = Column(DateTime, nullable=True)

    problem = relationship("CodingProblem", back_populates="progress")
