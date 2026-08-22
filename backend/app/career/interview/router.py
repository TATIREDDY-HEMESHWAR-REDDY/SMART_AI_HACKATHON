from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.students.context.service import student_context_service
from .service import InterviewService
from .schemas import (
    CreateInterview, InterviewSessionResponse, 
    InterviewHistoryItem, InterviewResponseSubmit,
    InterviewResponseResult, InterviewQuestionResponse,
    InterviewReview, InterviewAnalytics
)

router = APIRouter()

@router.post("/", response_model=InterviewSessionResponse)
async def start_interview(
    setup: CreateInterview,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await InterviewService.create_session(db, student.id, setup)

@router.get("/", response_model=List[InterviewHistoryItem])
def list_interviews(
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return InterviewService.list_sessions(db, student.id)
    
@router.get("/analytics", response_model=InterviewAnalytics)
def get_analytics(
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return InterviewService.get_analytics(db, student.id)

@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview(
    session_id: int,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = InterviewService.get_session(db, student.id, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/{session_id}/questions", response_model=List[InterviewQuestionResponse])
def get_session_questions(
    session_id: int,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    questions = InterviewService.get_session_questions(db, student.id, session_id)
    return questions

@router.post("/{session_id}/answer/{question_id}", response_model=InterviewResponseResult)
async def submit_answer(
    session_id: int,
    question_id: int,
    payload: InterviewResponseSubmit,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return await InterviewService.submit_answer(db, student.id, session_id, question_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/complete", response_model=InterviewSessionResponse)
async def complete_interview(
    session_id: int,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return await InterviewService.complete_session(db, student.id, session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/review", response_model=InterviewReview)
def get_interview_review(
    session_id: int,
    db: Session = Depends(get_db),
    student: any = Depends(student_context_service.get_current_student)
):
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = InterviewService.get_session(db, student.id, session_id)
    if not session or session.status != "COMPLETED":
        raise HTTPException(status_code=404, detail="Review not found or incomplete")
    return session
