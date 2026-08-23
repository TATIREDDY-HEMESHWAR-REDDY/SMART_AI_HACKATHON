from fastapi import APIRouter

api_router = APIRouter()

from app.career.profile.router import router as profile_router
from app.career.skills.router import router as skills_router
from app.career.readiness.router import router as readiness_router
from app.career.progress.router import router as progress_router
from app.career.dashboard.router import router as dashboard_router
from app.career.assessments.router import router as assessments_router
from app.career.coding.router import router as coding_router
from app.career.resume.router import router as resume_router
from app.career.interview.router import router as interview_router

api_router.include_router(dashboard_router, prefix="/career", tags=["Career Dashboard"])
api_router.include_router(profile_router, prefix="/career/profile", tags=["Career Profile"])
api_router.include_router(skills_router, prefix="/career/skills", tags=["Career Skills"])
api_router.include_router(readiness_router, prefix="/career/readiness", tags=["Career Readiness"])
api_router.include_router(progress_router, prefix="/career/progress", tags=["Career Progress"])
api_router.include_router(assessments_router, prefix="/career", tags=["Career Assessments"])
api_router.include_router(coding_router, prefix="/career/coding", tags=["Career Coding"])
api_router.include_router(resume_router, prefix="/career/resume", tags=["Career Resume"])
api_router.include_router(interview_router, prefix="/career/interviews", tags=["Career Interviews"])

from app.career.roadmap.router import router as roadmap_router
from app.career.jobs.router import router as jobs_router
api_router.include_router(roadmap_router, prefix="/career/roadmap", tags=["Career Roadmap"])
api_router.include_router(jobs_router, prefix="/career", tags=["Career Jobs & Applications"])
