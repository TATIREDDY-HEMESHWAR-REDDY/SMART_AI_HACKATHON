from sqlalchemy.orm import Session
from .models import CareerProgress
from typing import List

class CareerProgressService:
    @staticmethod
    def get_progress(db: Session, student_id: str) -> List[CareerProgress]:
        return db.query(CareerProgress).filter(CareerProgress.student_id == student_id).all()
