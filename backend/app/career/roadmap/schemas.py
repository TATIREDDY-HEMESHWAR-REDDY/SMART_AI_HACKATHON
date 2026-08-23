from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TaskCategory(str, Enum):
    CODING = "CODING"
    APTITUDE = "APTITUDE"
    TECHNICAL = "TECHNICAL"
    COMMUNICATION = "COMMUNICATION"
    INTERVIEW = "INTERVIEW"
    RESUME = "RESUME"
    PROJECTS = "PROJECTS"
    JOBS = "JOBS"
    GENERAL = "GENERAL"

class TaskPriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class TaskSource(str, Enum):
    DETERMINISTIC = "DETERMINISTIC"
    AI = "AI"

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"

class GoalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"

class CareerGoalCreate(BaseModel):
    title: str
    target_role: Optional[str] = None
    target_date: Optional[datetime] = None

class CareerGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[GoalStatus] = None

class CareerGoalResponse(BaseModel):
    id: int
    student_id: str
    title: str
    target_role: Optional[str]
    target_date: Optional[datetime]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoadmapTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: TaskCategory
    priority: TaskPriority
    source: TaskSource = TaskSource.DETERMINISTIC
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    due_date: Optional[datetime] = None

class RoadmapTaskUpdate(BaseModel):
    status: TaskStatus

class RoadmapTaskResponse(BaseModel):
    id: int
    student_id: str
    title: str
    description: Optional[str]
    category: str
    priority: str
    source: str
    status: str
    reference_type: Optional[str]
    reference_id: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    goal: Optional[CareerGoalResponse] = None
    readiness: Optional[dict] = None
    tasks: List[RoadmapTaskResponse] = []
    high_priority_tasks: List[RoadmapTaskResponse] = []
    completed_tasks: int = 0
    progress_percentage: int = 0
    career_gaps: List[str] = []

class CoachChatRequest(BaseModel):
    message: str

class CoachResponse(BaseModel):
    answer: str
    key_points: List[str] = []
    recommended_actions: List[str] = []
    referenced_gaps: List[str] = []
    confidence: int

class AIRoadmapTask(BaseModel):
    title: str
    description: str
    category: str
    priority: str
    reason: str
