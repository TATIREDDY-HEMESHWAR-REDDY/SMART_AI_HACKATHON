from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schemas import CareerDashboardResponse
from .service import DashboardService
from app.career.deps import get_current_student_id

router = APIRouter()

@router.get("/dashboard", response_model=CareerDashboardResponse)
async def get_dashboard(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return await DashboardService.get_dashboard(db, student_id)
