from sqlalchemy.orm import Session
from .models import StudentSkill
from .schemas import StudentSkillCreate, StudentSkillUpdate
from typing import List

class SkillService:
    @staticmethod
    def get_skills(db: Session, student_id: str) -> List[StudentSkill]:
        return db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()

    @staticmethod
    def create_skill(db: Session, student_id: str, data: StudentSkillCreate) -> StudentSkill:
        # Avoid duplicate name+category
        existing = db.query(StudentSkill).filter(
            StudentSkill.student_id == student_id,
            StudentSkill.name == data.name,
            StudentSkill.category == data.category
        ).first()
        if existing:
            return existing
            
        skill = StudentSkill(student_id=student_id, **data.model_dump())
        db.add(skill)
        db.commit()
        db.refresh(skill)
        return skill

    @staticmethod
    def update_skill(db: Session, student_id: str, skill_id: int, data: StudentSkillUpdate) -> StudentSkill:
        skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.student_id == student_id).first()
        if skill:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(skill, key, value)
            db.commit()
            db.refresh(skill)
        return skill
        
    @staticmethod
    def delete_skill(db: Session, student_id: str, skill_id: int) -> bool:
        skill = db.query(StudentSkill).filter(StudentSkill.id == skill_id, StudentSkill.student_id == student_id).first()
        if skill:
            db.delete(skill)
            db.commit()
            return True
        return False
