from sqlalchemy.orm import Session
from .models import CareerProfile
from .schemas import CareerProfileCreate, CareerProfileUpdate, ProfileCompletionStats

class CareerProfileService:
    @staticmethod
    def calculate_completion(profile: CareerProfile) -> ProfileCompletionStats:
        if not profile:
            return ProfileCompletionStats(completion_percentage=0, completed_sections=[], missing_sections=["all"])
            
        fields_to_check = {
            "basic_info": bool(profile.target_role and profile.career_objective),
            "links": bool(profile.github_url or profile.linkedin_url or profile.portfolio_url),
            "projects": len(profile.projects) > 0 if profile.projects else False,
            "internships": len(profile.internships) > 0 if profile.internships else False,
            "certifications": len(profile.certifications) > 0 if profile.certifications else False,
        }
        
        completed = [k for k, v in fields_to_check.items() if v]
        missing = [k for k, v in fields_to_check.items() if not v]
        
        # Simple weighted percentage
        weights = {"basic_info": 30, "links": 20, "projects": 30, "internships": 10, "certifications": 10}
        percentage = sum(weights[k] for k in completed)
        
        return ProfileCompletionStats(
            completion_percentage=percentage,
            completed_sections=completed,
            missing_sections=missing
        )

    @staticmethod
    def get_profile(db: Session, student_id: str) -> CareerProfile:
        return db.query(CareerProfile).filter(CareerProfile.student_id == student_id).first()

    @staticmethod
    def update_profile(db: Session, student_id: str, data: CareerProfileUpdate) -> CareerProfile:
        profile = db.query(CareerProfile).filter(CareerProfile.student_id == student_id).first()
        if not profile:
            profile = CareerProfile(student_id=student_id, **data.model_dump(exclude_unset=True))
            db.add(profile)
        else:
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(profile, key, value)
        db.commit()
        db.refresh(profile)
        return profile
