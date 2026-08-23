from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.db.database import Base

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    level = Column(String, nullable=False, default="BEGINNER")
    score = Column(Float, nullable=True)
    source = Column(String, nullable=False, default="MANUAL")
    
    last_evaluated = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
