from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from .schemas import CareerProgressResponse
from .service import CareerProgressService
from app.students.context.service import student_context_service

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.get("/progress", response_model=List[CareerProgressResponse])
async def get_progress(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return CareerProgressService.get_progress(db, student_id)
