from sqlalchemy.orm import Session
from .models import CareerReadinessScore
from .schemas import CareerReadinessResponse, ComponentScore

WEIGHTS = {
    "CODING": 0.25,
    "APTITUDE": 0.15,
    "TECHNICAL": 0.15,
    "COMMUNICATION": 0.10,
    "INTERVIEW": 0.15,
    "RESUME": 0.10,
    "PROJECTS": 0.10
}

class CareerReadinessService:
    @staticmethod
    def get_latest_score(db: Session, student_id: str) -> CareerReadinessScore:
        return db.query(CareerReadinessScore).filter(CareerReadinessScore.student_id == student_id).order_by(CareerReadinessScore.created_at.desc()).first()

    @staticmethod
    def update_component(db: Session, student_id: str, component: str, percentage: float):
        latest = CareerReadinessService.get_latest_score(db, student_id)
        
        # We always create a new historical record instead of mutating
        new_record = CareerReadinessScore(
            student_id=student_id,
            coding_score=latest.coding_score if latest else None,
            aptitude_score=latest.aptitude_score if latest else None,
            technical_score=latest.technical_score if latest else None,
            communication_score=latest.communication_score if latest else None,
            interview_score=latest.interview_score if latest else None,
            resume_score=latest.resume_score if latest else None,
            projects_score=latest.projects_score if latest else None,
            overall_score=latest.overall_score if latest else 0.0
        )
        
        comp_upper = component.upper()
        if comp_upper == "CODING": new_record.coding_score = percentage
        elif comp_upper == "APTITUDE": new_record.aptitude_score = percentage
        elif comp_upper == "TECHNICAL": new_record.technical_score = percentage
        elif comp_upper == "COMMUNICATION": new_record.communication_score = percentage
        elif comp_upper == "INTERVIEW": new_record.interview_score = percentage
        elif comp_upper == "RESUME": new_record.resume_score = percentage
        elif comp_upper == "PROJECTS": new_record.projects_score = percentage

        # Calculate weighted overall score
        total_weight = 0.0
        weighted_sum = 0.0
        
        if new_record.coding_score is not None:
            total_weight += WEIGHTS["CODING"]
            weighted_sum += new_record.coding_score * WEIGHTS["CODING"]
        if new_record.aptitude_score is not None:
            total_weight += WEIGHTS["APTITUDE"]
            weighted_sum += new_record.aptitude_score * WEIGHTS["APTITUDE"]
        if new_record.technical_score is not None:
            total_weight += WEIGHTS["TECHNICAL"]
            weighted_sum += new_record.technical_score * WEIGHTS["TECHNICAL"]
        if new_record.communication_score is not None:
            total_weight += WEIGHTS["COMMUNICATION"]
            weighted_sum += new_record.communication_score * WEIGHTS["COMMUNICATION"]
        if new_record.interview_score is not None:
            total_weight += WEIGHTS["INTERVIEW"]
            weighted_sum += new_record.interview_score * WEIGHTS["INTERVIEW"]
        if new_record.resume_score is not None:
            total_weight += WEIGHTS["RESUME"]
            weighted_sum += new_record.resume_score * WEIGHTS["RESUME"]
        if new_record.projects_score is not None:
            total_weight += WEIGHTS["PROJECTS"]
            weighted_sum += new_record.projects_score * WEIGHTS["PROJECTS"]

        if total_weight > 0:
            new_record.overall_score = weighted_sum / total_weight
        else:
            new_record.overall_score = 0.0

        db.add(new_record)
        db.commit()

    @staticmethod
    def calculate(db: Session, student_id: str) -> CareerReadinessResponse:
        # In a real scenario, this aggregates from Aptitude, Coding, Interview modules
        # For Phase 2, we fetch the latest recorded score, or create an empty default
        
        score = CareerReadinessService.get_latest_score(db, student_id)
        if not score:
            # Return empty/unassessed state
            return CareerReadinessResponse(
                id=None,
                student_id=student_id,
                overall_score=None,
                components=[
                    ComponentScore(name="Coding", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Aptitude", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Technical", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Communication", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Interview", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Resume", score=None, status="NOT_ASSESSED"),
                    ComponentScore(name="Projects", score=None, status="NOT_ASSESSED"),
                ],
                strengths=[],
                weaknesses=[],
                created_at=None
            )
            
        components = [
            ComponentScore(name="Coding", score=score.coding_score, status="ASSESSED" if score.coding_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Aptitude", score=score.aptitude_score, status="ASSESSED" if score.aptitude_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Technical", score=score.technical_score, status="ASSESSED" if score.technical_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Communication", score=score.communication_score, status="ASSESSED" if score.communication_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Interview", score=score.interview_score, status="ASSESSED" if score.interview_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Resume", score=score.resume_score, status="ASSESSED" if score.resume_score is not None else "NOT_ASSESSED"),
            ComponentScore(name="Projects", score=score.projects_score, status="ASSESSED" if score.projects_score is not None else "NOT_ASSESSED"),
        ]
        
        # Calculate strengths and weaknesses based on non-null scores
        assessed_comps = [c for c in components if c.status == "ASSESSED"]
        strengths = []
        weaknesses = []
        if assessed_comps:
            sorted_comps = sorted(assessed_comps, key=lambda x: x.score, reverse=True)
            if len(sorted_comps) > 0:
                strengths.append(sorted_comps[0].name)
            if len(sorted_comps) > 1:
                weaknesses.append(sorted_comps[-1].name)
                
        return CareerReadinessResponse(
            id=score.id,
            student_id=score.student_id,
            overall_score=score.overall_score,
            components=components,
            strengths=strengths,
            weaknesses=weaknesses,
            created_at=score.created_at
        )
