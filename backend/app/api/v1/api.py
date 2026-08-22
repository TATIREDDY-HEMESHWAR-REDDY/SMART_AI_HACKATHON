from fastapi import APIRouter

api_router = APIRouter()

from app.career.profile.router import router as profile_router
from app.career.skills.router import router as skills_router
from app.career.profile.router import router as profile_router
from app.career.skills.router import router as skills_router
from app.career.readiness.router import router as readiness_router
from app.career.progress.router import router as progress_router
from app.career.dashboard.router import router as dashboard_router
from app.career.assessments.router import router as assessments_router

api_router.include_router(dashboard_router, prefix="/career", tags=["career-dashboard"])
api_router.include_router(profile_router, prefix="/career", tags=["career-profile"])
api_router.include_router(skills_router, prefix="/career", tags=["career-skills"])
api_router.include_router(readiness_router, prefix="/career", tags=["career-readiness"])
api_router.include_router(progress_router, prefix="/career", tags=["career-progress"])
api_router.include_router(assessments_router, prefix="/career", tags=["career-assessments"])
