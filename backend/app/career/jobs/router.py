from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.students.context.service import student_context_service
from .service import JobService, ApplicationService, JobMatchService
from .schemas import (
    JobResponse, SavedJobResponse, JobApplicationResponse,
    JobApplicationCreate, JobApplicationUpdate, JobApplicationActivityCreate,
    JobMatchResponse, ApplicationActivityResponse
)

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

# ----------------- JOBS -----------------

@router.get("/jobs", response_model=List[JobResponse])
def list_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return JobService.list_jobs(db, search=search, location=location, employment_type=employment_type)

@router.get("/jobs/saved", response_model=List[SavedJobResponse])
def list_saved_jobs(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return JobService.list_saved_jobs(db, student_id)

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/jobs/{job_id}/save", response_model=SavedJobResponse)
def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return JobService.save_job(db, student_id, job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/jobs/{job_id}/save")
def unsave_job(
    job_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        JobService.unsave_job(db, student_id, job_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/jobs/{job_id}/match", response_model=JobMatchResponse)
def match_job(
    job_id: int,
    resume_id: int = Query(..., description="ID of the resume to match against"),
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return JobMatchService.match_job(db, student_id, job_id, resume_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------- APPLICATIONS -----------------

@router.get("/applications", response_model=List[JobApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return ApplicationService.list_applications(db, student_id)

@router.post("/applications", response_model=JobApplicationResponse)
def create_application(
    payload: JobApplicationCreate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return ApplicationService.create_application(db, student_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/applications/{app_id}", response_model=JobApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    app = ApplicationService.get_application(db, student_id, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.patch("/applications/{app_id}", response_model=JobApplicationResponse)
def update_application_status(
    app_id: int,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return ApplicationService.update_application_status(db, student_id, app_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/applications/{app_id}/activities", response_model=ApplicationActivityResponse)
def add_application_activity(
    app_id: int,
    payload: JobApplicationActivityCreate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return ApplicationService.add_activity(db, student_id, app_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
