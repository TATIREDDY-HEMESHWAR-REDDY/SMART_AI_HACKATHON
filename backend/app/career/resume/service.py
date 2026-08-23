from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Any
from datetime import datetime

from .models import (
    Resume, ResumeEducation, ResumeExperience, ResumeProject, 
    ResumeSkill, ResumeCertification, ResumeAchievement, 
    ResumeActivity, ResumeAnalysis
)
from .schemas import ResumeCreate, ResumeUpdate, JobMatchRequest
from .scoring_service import ResumeScoringService
from .ai_service import ResumeAnalysisService
from app.career.readiness.service import CareerReadinessService

class ResumeService:
    @staticmethod
    def get_resumes(db: Session, student_id: str) -> List[Resume]:
        return db.query(Resume).filter(Resume.student_id == student_id).all()

    @staticmethod
    def get_resume(db: Session, student_id: str, resume_id: int) -> Optional[Resume]:
        return db.query(Resume).filter(Resume.id == resume_id, Resume.student_id == student_id).first()

    @staticmethod
    def create_resume(db: Session, student_id: str, resume_in: ResumeCreate) -> Resume:
        # Check if first resume
        existing_count = db.query(func.count(Resume.id)).filter(Resume.student_id == student_id).scalar()
        is_default = True if existing_count == 0 else resume_in.is_default
        
        # Build core
        db_resume = Resume(
            student_id=student_id,
            title=resume_in.title,
            template=resume_in.template,
            is_default=is_default,
            full_name=resume_in.full_name,
            email=resume_in.email,
            phone=resume_in.phone,
            location=resume_in.location,
            linkedin=resume_in.linkedin,
            github=resume_in.github,
            portfolio=resume_in.portfolio,
            summary=resume_in.summary
        )
        db.add(db_resume)
        db.flush()
        
        ResumeService._sync_relations(db, db_resume, resume_in)
        db.commit()
        db.refresh(db_resume)
        
        # Initialize basic scoring
        ResumeService.update_readiness(db, student_id)
        return db_resume

    @staticmethod
    def update_resume(db: Session, student_id: str, resume_id: int, resume_in: ResumeUpdate) -> Optional[Resume]:
        db_resume = ResumeService.get_resume(db, student_id, resume_id)
        if not db_resume:
            return None
            
        update_data = resume_in.model_dump(exclude_unset=True, exclude={"educations", "experiences", "projects", "skills", "certifications", "achievements", "activities"})
        for key, value in update_data.items():
            setattr(db_resume, key, value)
            
        ResumeService._sync_relations(db, db_resume, resume_in)
        db.commit()
        db.refresh(db_resume)
        
        ResumeService.update_readiness(db, student_id)
        return db_resume
        
    @staticmethod
    def delete_resume(db: Session, student_id: str, resume_id: int) -> bool:
        db_resume = ResumeService.get_resume(db, student_id, resume_id)
        if not db_resume:
            return False
            
        # Don't delete if it's the last one
        count = db.query(func.count(Resume.id)).filter(Resume.student_id == student_id).scalar()
        if count <= 1:
            raise ValueError("Cannot delete the only resume.")
            
        db.delete(db_resume)
        db.commit()
        ResumeService.update_readiness(db, student_id)
        return True
        
    @staticmethod
    def duplicate_resume(db: Session, student_id: str, resume_id: int) -> Optional[Resume]:
        db_resume = ResumeService.get_resume(db, student_id, resume_id)
        if not db_resume:
            return None
            
        new_resume = Resume(
            student_id=student_id,
            title=f"{db_resume.title} (Copy)",
            template=db_resume.template,
            is_default=False,
            full_name=db_resume.full_name,
            email=db_resume.email,
            phone=db_resume.phone,
            location=db_resume.location,
            linkedin=db_resume.linkedin,
            github=db_resume.github,
            portfolio=db_resume.portfolio,
            summary=db_resume.summary
        )
        db.add(new_resume)
        db.flush()
        
        # Copy relations
        for edu in db_resume.educations: db.add(ResumeEducation(resume_id=new_resume.id, institution=edu.institution, degree=edu.degree, field=edu.field, start_date=edu.start_date, end_date=edu.end_date, gpa=edu.gpa, description=edu.description))
        for exp in db_resume.experiences: db.add(ResumeExperience(resume_id=new_resume.id, company=exp.company, role=exp.role, location=exp.location, start_date=exp.start_date, end_date=exp.end_date, is_current=exp.is_current, description=exp.description, achievements=exp.achievements))
        for proj in db_resume.projects: db.add(ResumeProject(resume_id=new_resume.id, name=proj.name, description=proj.description, technologies=proj.technologies, github_url=proj.github_url, live_url=proj.live_url, start_date=proj.start_date, end_date=proj.end_date, achievements=proj.achievements))
        for skill in db_resume.skills: db.add(ResumeSkill(resume_id=new_resume.id, category=skill.category, name=skill.name, proficiency=skill.proficiency))
        for cert in db_resume.certifications: db.add(ResumeCertification(resume_id=new_resume.id, name=cert.name, issuer=cert.issuer, issue_date=cert.issue_date, credential_id=cert.credential_id, credential_url=cert.credential_url))
        for ach in db_resume.achievements: db.add(ResumeAchievement(resume_id=new_resume.id, title=ach.title, description=ach.description, date=ach.date))
        for act in db_resume.activities: db.add(ResumeActivity(resume_id=new_resume.id, organization=act.organization, role=act.role, description=act.description, start_date=act.start_date, end_date=act.end_date))
        
        db.commit()
        db.refresh(new_resume)
        return new_resume

    @staticmethod
    async def analyze_resume(db: Session, student_id: str, resume_id: int) -> Optional[ResumeAnalysis]:
        resume = ResumeService.get_resume(db, student_id, resume_id)
        if not resume: return None
        
        # 1. Deterministic Score
        scores = ResumeScoringService.calculate_score(resume)
        
        # 2. AI Qualitative Feedback
        ai_data = await ResumeAnalysisService.analyze_resume(resume)
        
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            **scores,
            **ai_data
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        ResumeService.update_readiness(db, student_id)
        return analysis

    @staticmethod
    async def match_job(db: Session, student_id: str, resume_id: int, request: JobMatchRequest) -> Optional[ResumeAnalysis]:
        resume = ResumeService.get_resume(db, student_id, resume_id)
        if not resume: return None
        
        match_data = await ResumeAnalysisService.match_job(resume, request.job_description)
        
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            target_job_title=request.target_role,
            **match_data
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def _sync_relations(db: Session, db_resume: Resume, resume_in: Any):
        # Clear existing
        db.query(ResumeEducation).filter(ResumeEducation.resume_id == db_resume.id).delete()
        db.query(ResumeExperience).filter(ResumeExperience.resume_id == db_resume.id).delete()
        db.query(ResumeProject).filter(ResumeProject.resume_id == db_resume.id).delete()
        db.query(ResumeSkill).filter(ResumeSkill.resume_id == db_resume.id).delete()
        db.query(ResumeCertification).filter(ResumeCertification.resume_id == db_resume.id).delete()
        db.query(ResumeAchievement).filter(ResumeAchievement.resume_id == db_resume.id).delete()
        db.query(ResumeActivity).filter(ResumeActivity.resume_id == db_resume.id).delete()
        
        db.flush()
        
        # Add new
        if hasattr(resume_in, 'educations') and resume_in.educations is not None:
            for item in resume_in.educations: db.add(ResumeEducation(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'experiences') and resume_in.experiences is not None:
            for item in resume_in.experiences: db.add(ResumeExperience(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'projects') and resume_in.projects is not None:
            for item in resume_in.projects: db.add(ResumeProject(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'skills') and resume_in.skills is not None:
            for item in resume_in.skills: db.add(ResumeSkill(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'certifications') and resume_in.certifications is not None:
            for item in resume_in.certifications: db.add(ResumeCertification(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'achievements') and resume_in.achievements is not None:
            for item in resume_in.achievements: db.add(ResumeAchievement(resume_id=db_resume.id, **item.model_dump()))
        if hasattr(resume_in, 'activities') and resume_in.activities is not None:
            for item in resume_in.activities: db.add(ResumeActivity(resume_id=db_resume.id, **item.model_dump()))
            
    @staticmethod
    def update_readiness(db: Session, student_id: str):
        # Find best resume overall_score
        resumes = db.query(Resume).filter(Resume.student_id == student_id).all()
        best_score = 0.0
        
        for resume in resumes:
            # Deterministic base
            det_score = ResumeScoringService.calculate_score(resume)["overall_score"]
            best_score = max(best_score, det_score)
            
        CareerReadinessService.update_component(db, student_id, "RESUME", best_score)
