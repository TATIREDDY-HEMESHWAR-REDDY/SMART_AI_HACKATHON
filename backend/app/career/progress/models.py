from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.db.database import Base

class CareerProgress(Base):
    __tablename__ = "career_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    module = Column(String, nullable=False) # e.g. CODING, APTITUDE
    progress_percentage = Column(Float, default=0.0)
    status = Column(String, default="NOT_STARTED") # NOT_STARTED, IN_PROGRESS, COMPLETED
    
    completed_items = Column(Integer, default=0)
    total_items = Column(Integer, default=0)
    
    last_activity = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
