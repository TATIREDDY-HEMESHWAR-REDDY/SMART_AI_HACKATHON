from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CareerProgressBase(BaseModel):
    module: str
    progress_percentage: float = 0.0
    status: str = "NOT_STARTED"
    completed_items: int = 0
    total_items: int = 0

class CareerProgressResponse(CareerProgressBase):
    id: int
    student_id: str
    last_activity: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
