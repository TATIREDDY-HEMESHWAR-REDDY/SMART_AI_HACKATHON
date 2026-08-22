from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class CareerProfileBase(BaseModel):
    target_role: Optional[str] = None
    target_domain: Optional[str] = None
    career_objective: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    projects: List[dict] = []
    internships: List[dict] = []
    certifications: List[dict] = []
    achievements: List[dict] = []

class CareerProfileCreate(CareerProfileBase):
    pass

class CareerProfileUpdate(CareerProfileBase):
    pass

class ProfileCompletionStats(BaseModel):
    completion_percentage: int
    completed_sections: List[str]
    missing_sections: List[str]

class CareerProfileResponse(CareerProfileBase):
    id: int
    student_id: str
    created_at: datetime
    updated_at: datetime
    completion_stats: Optional[ProfileCompletionStats] = None
    
    class Config:
        from_attributes = True
