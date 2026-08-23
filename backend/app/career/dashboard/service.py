from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
from app.career.profile.service import CareerProfileService
from app.career.readiness.service import CareerReadinessService
from app.career.progress.service import CareerProgressService
from app.career.skills.models import StudentSkill
from app.career.ai_insights.models import AIInsight
from .schemas import CareerDashboardResponse, DashboardAIInsight
from app.ai.service import ai_service
from app.students.context.service import student_context_service

class DashboardService:
    @staticmethod
    async def get_dashboard(db: Session, student_id: str) -> CareerDashboardResponse:
        # Fetch profile
        profile = CareerProfileService.get_profile(db, student_id)
        
        # Fetch readiness
        readiness = CareerReadinessService.calculate(db, student_id)
        
        # Fetch progress
        progress = CareerProgressService.get_progress(db, student_id)
        
        # Fetch top skills
        top_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).order_by(StudentSkill.score.desc()).limit(5).all()
        
        # Determine if we need a new AI Insight (cached for 24 hours)
        insight_model = db.query(AIInsight).filter(
            AIInsight.student_id == student_id,
            AIInsight.type == "CAREER",
            AIInsight.is_active == True,
            (AIInsight.expires_at > datetime.utcnow()) | (AIInsight.expires_at.is_(None))
        ).order_by(AIInsight.created_at.desc()).first()
        
        insight_res = None
        if insight_model:
            insight_res = DashboardAIInsight(
                content=insight_model.content,
                recommendations=insight_model.recommendations or []
            )
        else:
            # Generate a new one
            # Construct context
            context_str = f"Target Role: {profile.target_role if profile else 'Unknown'}, " \
                          f"Completion: {CareerProfileService.calculate_completion(profile).completion_percentage if profile else 0}%, " \
                          f"Top Skills: {[s.name for s in top_skills]}, " \
                          f"Readiness: {readiness.overall_score if readiness.overall_score else 'Not assessed'}"
                          
            ai_response = await ai_service.generate(
                prompt=f"You are a career coach. Given this student context: {context_str}. Provide a short 2 sentence insight and exactly 3 actionable recommendations.",
                json_mode=False
            )
            
            # Simple mock parsing for Phase 2 since we use a dummy AI provider currently
            # In a real implementation we would use structured output (e.g. instructor)
            new_insight = AIInsight(
                student_id=student_id,
                type="CAREER",
                title="Weekly Career Insight",
                content=ai_response,
                recommendations=["Improve DSA", "Update Resume", "Practice Interviews"],
                expires_at=datetime.utcnow() + timedelta(days=1)
            )
            db.add(new_insight)
            db.commit()
            db.refresh(new_insight)
            
            insight_res = DashboardAIInsight(
                content=new_insight.content,
                recommendations=new_insight.recommendations
            )
            
        from app.career.profile.schemas import CareerProfileResponse
        profile_res = None
        if profile:
            profile_res = CareerProfileResponse.model_validate(profile)
            profile_res.completion_stats = CareerProfileService.calculate_completion(profile)
            
        return CareerDashboardResponse(
            profile=profile_res,
            readiness=readiness,
            progress=progress,
            top_skills=top_skills,
            ai_insight=insight_res
        )
