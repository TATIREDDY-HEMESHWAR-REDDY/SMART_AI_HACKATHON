from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schemas import CareerDashboardResponse
from .service import DashboardService
from app.students.context.service import student_context_service

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.get("/dashboard", response_model=CareerDashboardResponse)
async def get_dashboard(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return await DashboardService.get_dashboard(db, student_id)
