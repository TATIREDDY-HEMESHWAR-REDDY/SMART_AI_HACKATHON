from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudentSkillBase(BaseModel):
    name: str
    category: str
    level: str
    score: Optional[float] = None
    source: str = "MANUAL"

class StudentSkillCreate(StudentSkillBase):
    pass

class StudentSkillUpdate(BaseModel):
    level: Optional[str] = None
    score: Optional[float] = None
    source: Optional[str] = None

class StudentSkillResponse(StudentSkillBase):
    id: int
    student_id: str
    last_evaluated: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
