from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from .schemas import StudentSkillResponse, StudentSkillCreate, StudentSkillUpdate
from .service import SkillService
from app.career.deps import get_current_student_id

router = APIRouter()

@router.get("", response_model=List[StudentSkillResponse])
async def get_skills(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return SkillService.get_skills(db, student_id)

@router.post("", response_model=StudentSkillResponse)
async def create_skill(
    data: StudentSkillCreate,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    return SkillService.create_skill(db, student_id, data)

@router.patch("/{skill_id}", response_model=StudentSkillResponse)
async def update_skill(
    skill_id: int,
    data: StudentSkillUpdate,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    skill = SkillService.update_skill(db, student_id, skill_id, data)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    success = SkillService.delete_skill(db, student_id, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"status": "ok"}
