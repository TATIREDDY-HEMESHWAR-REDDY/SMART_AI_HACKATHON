from pydantic import BaseModel
from typing import Optional, List
from app.career.profile.schemas import CareerProfileResponse
from app.career.readiness.schemas import CareerReadinessResponse
from app.career.progress.schemas import CareerProgressResponse
from app.career.skills.schemas import StudentSkillResponse

class DashboardAIInsight(BaseModel):
    content: str
    recommendations: List[str]

class CareerDashboardResponse(BaseModel):
    profile: Optional[CareerProfileResponse]
    readiness: CareerReadinessResponse
    progress: List[CareerProgressResponse]
    top_skills: List[StudentSkillResponse]
    ai_insight: Optional[DashboardAIInsight]
