from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, func
from app.db.database import Base

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # CAREER, RESUME, CODING, etc.
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    recommendations = Column(JSON, default=[])
    
    source_context_hash = Column(String, nullable=True) # Used to check if cache is stale
    model_provider = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
