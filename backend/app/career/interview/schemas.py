from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CreateInterview(BaseModel):
    target_role: Optional[str] = None
    interview_type: str
    mode: str
    difficulty: Optional[str] = "MEDIUM"
    num_questions: int

class InterviewResponseSubmit(BaseModel):
    answer: str
    time_spent_seconds: int

class InterviewResponseResult(BaseModel):
    id: int
    question_id: int
    answer: str
    submitted_at: datetime
    time_spent_seconds: int
    score: Optional[float] = None
    feedback: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class InterviewQuestionResponse(BaseModel):
    id: int
    session_id: int
    question_number: int
    question: str
    category: str
    difficulty: str
    expected_topics: Optional[List[str]] = None
    response: Optional[InterviewResponseResult] = None
    
    class Config:
        from_attributes = True

class InterviewSessionResponse(BaseModel):
    id: int
    student_id: str
    target_role: Optional[str] = None
    interview_type: str
    mode: str
    difficulty: Optional[str] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None
    readiness_score: Optional[float] = None
    duration_seconds: int
    ai_summary: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class InterviewReview(InterviewSessionResponse):
    questions: List[InterviewQuestionResponse] = []

class InterviewHistoryItem(BaseModel):
    id: int
    target_role: Optional[str] = None
    interview_type: str
    mode: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None
    duration_seconds: int
    
    class Config:
        from_attributes = True

class InterviewAnalytics(BaseModel):
    total_interviews: int
    average_score: Optional[float] = None
    best_score: Optional[float] = None
    technical_average: Optional[float] = None
    communication_average: Optional[float] = None
    behavioral_average: Optional[float] = None
    project_average: Optional[float] = None
    history: List[InterviewHistoryItem] = []
