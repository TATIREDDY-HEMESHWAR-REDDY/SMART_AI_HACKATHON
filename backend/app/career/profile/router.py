from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schemas import CareerProfileResponse, CareerProfileUpdate
from .service import CareerProfileService
from app.students.context.service import student_context_service

router = APIRouter()

# Mocking auth dependency for standalone development
async def get_current_student_id():
    # In reality this extracts JWT from request and calls student_context_service
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id

@router.get("", response_model=CareerProfileResponse)
async def get_profile(
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    profile = CareerProfileService.get_profile(db, student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    response = CareerProfileResponse.model_validate(profile)
    response.completion_stats = CareerProfileService.calculate_completion(profile)
    return response

@router.put("", response_model=CareerProfileResponse)
async def update_profile(
    data: CareerProfileUpdate,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    profile = CareerProfileService.update_profile(db, student_id, data)
    response = CareerProfileResponse.model_validate(profile)
    response.completion_stats = CareerProfileService.calculate_completion(profile)
    return response
