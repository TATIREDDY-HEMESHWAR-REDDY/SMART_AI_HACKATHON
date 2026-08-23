from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.students.context.service import student_context_service
from .service import ResumeService
from .schemas import (
    ResumeOut, ResumeCreate, ResumeUpdate, 
    ResumeAnalysisOut, JobMatchRequest
)

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.get("", response_model=List[ResumeOut])
def get_resumes(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return ResumeService.get_resumes(db, student_id)

@router.post("", response_model=ResumeOut)
def create_resume(
    resume_in: ResumeCreate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return ResumeService.create_resume(db, student_id, resume_in)

@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    resume = ResumeService.get_resume(db, student_id, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.patch("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: int,
    resume_in: ResumeUpdate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    resume = ResumeService.update_resume(db, student_id, resume_id, resume_in)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        success = ResumeService.delete_resume(db, student_id, resume_id)
        if not success:
            raise HTTPException(status_code=404, detail="Resume not found")
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{resume_id}/duplicate", response_model=ResumeOut)
def duplicate_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    resume = ResumeService.duplicate_resume(db, student_id, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisOut)
async def analyze_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    analysis = await ResumeService.analyze_resume(db, student_id, resume_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume not found")
    return analysis

@router.post("/{resume_id}/job-match", response_model=ResumeAnalysisOut)
async def job_match_resume(
    resume_id: int,
    request: JobMatchRequest,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    analysis = await ResumeService.match_job(db, student_id, resume_id, request)
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume not found")
    return analysis

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # Mock PDF extraction for demo purposes, gracefully handles upload
    resume_in = ResumeCreate(
        title=f"Uploaded: {file.filename}",
        template="modern",
        is_default=False,
        summary="Extracted summary placeholder..."
    )
    return ResumeService.create_resume(db, student_id, resume_in)
