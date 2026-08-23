from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.students.context.service import student_context_service
from app.career.roadmap.schemas import CoachChatRequest, CoachResponse
from app.career.roadmap.service import RoadmapService
from fastapi import HTTPException

router = APIRouter()

async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.post("/chat", response_model=CoachResponse)
async def chat_with_coach(
    payload: CoachChatRequest,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return await RoadmapService.chat_with_coach(db, student_id, payload.message)
