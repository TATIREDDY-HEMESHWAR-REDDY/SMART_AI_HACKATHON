from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    description: str
    employment_type: str
    requirements: List[str] = []
    is_active: bool = True

class JobResponse(JobBase):
    id: int
    posted_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    saved_at: datetime
    job: JobResponse
    
    class Config:
        from_attributes = True

class ApplicationActivityResponse(BaseModel):
    id: int
    activity_type: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    job_id: int
    resume_id: int

class JobApplicationUpdate(BaseModel):
    status: str

class JobApplicationActivityCreate(BaseModel):
    activity_type: str
    content: str

class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    status: str
    applied_at: datetime
    created_at: datetime
    updated_at: datetime
    
    job: JobResponse
    activities: List[ApplicationActivityResponse] = []
    
    class Config:
        from_attributes = True

from app.career.resume.schemas import ResumeOut

class JobMatchResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    
    job: Optional[JobResponse] = None
    resume: Optional[ResumeOut] = None
    
    match_score: Optional[float] = None
    deterministic_score: Optional[float] = None
    
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    missing_keywords: List[str] = []
    
    ai_strengths: List[str] = []
    ai_gaps: List[str] = []
    role_alignment: Optional[str] = None
    recommendations: List[str] = []
    ai_available: bool = False
    
    analyzed_at: datetime
    is_stale: bool = False
    
    class Config:
        from_attributes = True
