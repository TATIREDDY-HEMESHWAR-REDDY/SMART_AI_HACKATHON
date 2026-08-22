from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ComponentScore(BaseModel):
    name: str
    score: Optional[float]
    status: str # "ASSESSED", "NOT_ASSESSED"

class CareerReadinessResponse(BaseModel):
    id: Optional[int]
    student_id: str
    overall_score: Optional[float]
    components: List[ComponentScore]
    strengths: List[str] = []
    weaknesses: List[str] = []
    created_at: Optional[datetime]
    
    class Config:
        from_attributes = True
