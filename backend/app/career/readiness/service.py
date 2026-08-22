from sqlalchemy.orm import Session
from .models import CareerReadinessScore
from .schemas import CareerReadinessResponse, ComponentScore

class CareerReadinessService:
    @staticmethod
    def get_latest_score(db: Session, student_id: str) -> CareerReadinessScore:
        return db.query(CareerReadinessScore).filter(CareerReadinessScore.student_id == student_id).order_by(CareerReadinessScore.created_at.desc()).first()

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
