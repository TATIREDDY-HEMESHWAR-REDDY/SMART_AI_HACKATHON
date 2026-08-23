from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.career.deps import get_current_student_id
from app.career.roadmap.schemas import CoachChatRequest, CoachResponse
from app.career.roadmap.service import RoadmapService

router = APIRouter()

@router.post("/chat", response_model=CoachResponse)
async def chat_with_coach(
    payload: CoachChatRequest,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return await RoadmapService.chat_with_coach(db, student_id, payload.message)
