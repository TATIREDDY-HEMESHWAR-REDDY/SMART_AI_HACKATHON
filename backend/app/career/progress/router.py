from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from .schemas import CareerProgressResponse
from .service import CareerProgressService
from app.career.deps import get_current_student_id

router = APIRouter()

@router.get("/progress", response_model=List[CareerProgressResponse])
async def get_progress(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return CareerProgressService.get_progress(db, student_id)
