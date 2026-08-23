from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.career.deps import get_current_student_id
from .service import CodingService
from .schemas import (
    CodingProblemPublic,
    CodingProblemDetail,
    RunCodeRequest,
    RunCodeResponse,
    SubmitCodeResponse,
    SubmissionHistoryItem,
    CodingProgressResponse
)

router = APIRouter()

@router.get("/problems", response_model=List[CodingProblemPublic])
def list_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return CodingService.list_problems(db, topic, difficulty)

@router.get("/problems/{slug}", response_model=CodingProblemDetail)
def get_problem(slug: str, db: Session = Depends(get_db)):
    problem = CodingService.get_problem_by_slug(db, slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # sample test cases attached directly to model properties via relationship,
    # but we filter out hidden ones for the detail payload
    problem.sample_test_cases = [tc for tc in problem.test_cases if tc.is_sample]
    return problem

@router.get("/problems/{slug}/progress", response_model=CodingProgressResponse)
def get_problem_progress(
    slug: str,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    problem = CodingService.get_problem_by_slug(db, slug)
    if not problem: raise HTTPException(status_code=404)
    
    progress = CodingService.get_progress(db, student_id, problem.id)
    if not progress:
        return {"status": "NOT_STARTED", "attempts": 0, "best_runtime_ms": None}
    return progress

@router.post("/problems/{slug}/run", response_model=RunCodeResponse)
def run_code(
    slug: str,
    request: RunCodeRequest,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    # Does not save submission, purely runs on sample testcases
    try:
        return CodingService.run_code(db, slug, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/problems/{slug}/submit", response_model=SubmitCodeResponse)
async def submit_code(
    slug: str,
    request: RunCodeRequest,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    try:
        return await CodingService.submit_code(db, student_id, slug, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/submissions", response_model=List[SubmissionHistoryItem])
def get_submissions(
    problem_id: Optional[int] = None,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return CodingService.get_submissions(db, student_id, problem_id)
