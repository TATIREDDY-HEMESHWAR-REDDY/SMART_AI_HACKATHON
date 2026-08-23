from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.database import get_db
from app.career.deps import get_current_student_id
from app.career.roadmap.schemas import (
    CareerGoalCreate, CareerGoalUpdate, CareerGoalResponse,
    RoadmapTaskUpdate, RoadmapTaskResponse, RoadmapResponse,

)
from app.career.roadmap.service import RoadmapService

router = APIRouter()

@router.get("", response_model=RoadmapResponse)
def get_roadmap(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return RoadmapService.get_roadmap(db, student_id)

@router.post("/generate", response_model=List[RoadmapTaskResponse])
async def generate_roadmap(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return await RoadmapService.generate_roadmap(db, student_id)

@router.get("/goals", response_model=CareerGoalResponse)
def get_active_goal(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    goal = RoadmapService.get_active_goal(db, student_id)
    if not goal:
        raise HTTPException(status_code=404, detail="No active career goal found")
    return goal

@router.post("/goals", response_model=CareerGoalResponse)
def create_goal(
    payload: CareerGoalCreate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return RoadmapService.create_goal(db, student_id, payload)

@router.patch("/goals/{goal_id}", response_model=CareerGoalResponse)
def update_goal(
    goal_id: int,
    payload: CareerGoalUpdate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    goal = RoadmapService.update_goal(db, student_id, goal_id, payload)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.get("/tasks", response_model=List[RoadmapTaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    return RoadmapService.get_tasks(db, student_id)

@router.patch("/tasks/{task_id}", response_model=RoadmapTaskResponse)
def update_task(
    task_id: int,
    payload: RoadmapTaskUpdate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id)
):
    task = RoadmapService.update_task(db, student_id, task_id, payload)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
