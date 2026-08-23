from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from .models import AssessmentAttempt
from .schemas import AssessmentResponse, AssessmentQuestionPublic, AssessmentAttemptResponse, AnswerUpdate, AssessmentResultResponse, AssessmentQuestionWithAnswer, GenerateAssessmentRequest
from .service import AssessmentService
from app.career.deps import get_current_student_id

router = APIRouter()

@router.get("/assessments", response_model=List[AssessmentResponse])
async def list_assessments(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return AssessmentService.list_assessments(db, category)

@router.get("/assessments/{id}", response_model=AssessmentResponse)
async def get_assessment(
    id: int,
    db: Session = Depends(get_db)
):
    assessment = AssessmentService.get_assessment(db, id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.get("/assessments/{id}/questions", response_model=List[AssessmentQuestionPublic])
async def get_assessment_questions(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    # Verify attempt is in progress before returning questions without answers
    attempt = db.query(AssessmentAttempt).filter_by(assessment_id=id, student_id=student_id, status="IN_PROGRESS").first()
    if not attempt:
        raise HTTPException(status_code=403, detail="No active attempt found for this assessment")
        
    questions = AssessmentService.get_questions(db, id)
    return questions

@router.post("/assessments/{id}/attempts", response_model=AssessmentAttemptResponse)
async def start_attempt(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    try:
        attempt = AssessmentService.start_or_resume_attempt(db, student_id, id)
        response = AssessmentAttemptResponse.model_validate(attempt)
        response.time_remaining_seconds = AssessmentService.calculate_time_remaining(attempt, attempt.assessment.duration_minutes)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attempts/{id}", response_model=AssessmentAttemptResponse)
async def get_attempt(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    attempt = AssessmentService.get_attempt(db, id, student_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    response = AssessmentAttemptResponse.model_validate(attempt)
    response.time_remaining_seconds = AssessmentService.calculate_time_remaining(attempt, attempt.assessment.duration_minutes)
    return response

@router.patch("/attempts/{id}/answers")
async def save_answer(
    id: int,
    data: AnswerUpdate,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    try:
        AssessmentService.save_answer(db, id, student_id, data)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/attempts/{id}/submit", response_model=AssessmentResultResponse)
async def submit_attempt(
    id: int,
    background_tasks: BackgroundTasks,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    try:
        result = await AssessmentService.submit_attempt(db, id, student_id)
        
        # Async background update of progress
        background_tasks.add_task(AssessmentService.update_progress, db, student_id, result.assessment.category)
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attempts/{id}/result", response_model=AssessmentResultResponse)
async def get_attempt_result(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    attempt = AssessmentService.get_attempt(db, id, student_id)
    if not attempt or attempt.status != "SUBMITTED":
        raise HTTPException(status_code=404, detail="Result not available")
    return attempt

@router.get("/attempts/{id}/review", response_model=List[AssessmentQuestionWithAnswer])
async def review_attempt(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    attempt = AssessmentService.get_attempt(db, id, student_id)
    if not attempt or attempt.status != "SUBMITTED":
        raise HTTPException(status_code=403, detail="Cannot review incomplete assessment")
        
    return AssessmentService.get_questions(db, attempt.assessment_id)


@router.post("/assessments/generate", response_model=AssessmentResponse)
async def generate_assessment(
    req: GenerateAssessmentRequest,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    try:
        assessment = await AssessmentService.generate_assessment_with_ai(db, req.prompt, req.category)
        return assessment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate assessment: {str(e)}")

@router.delete("/assessments/{id}")
async def delete_assessment(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    success = AssessmentService.delete_assessment(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return {"status": "ok"}
