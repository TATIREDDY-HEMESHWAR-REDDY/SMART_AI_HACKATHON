from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schemas import CareerReadinessResponse
from .service import CareerReadinessService
from app.career.deps import get_current_student_id

router = APIRouter()

@router.get("/readiness", response_model=CareerReadinessResponse)
async def get_readiness(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return CareerReadinessService.calculate(db, student_id)
