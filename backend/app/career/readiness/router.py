from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schemas import CareerReadinessResponse
from .service import CareerReadinessService
from app.students.context.service import student_context_service

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.get("/readiness", response_model=CareerReadinessResponse)
async def get_readiness(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return CareerReadinessService.calculate(db, student_id)
