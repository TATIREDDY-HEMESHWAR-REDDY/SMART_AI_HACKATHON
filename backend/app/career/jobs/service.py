from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime

from app.career.jobs.models import Job, SavedJob, JobApplication, JobMatch, ApplicationActivity
from app.career.jobs.fallback_jobs import FALLBACK_JOBS
from app.career.jobs.schemas import JobApplicationCreate, JobApplicationUpdate, JobApplicationActivityCreate
from app.career.resume.service import ResumeService
from app.career.progress.models import CareerProgress

class JobService:
    @staticmethod
    def _seed_jobs_if_empty(db: Session):
        if db.query(Job).count() == 0:
            for job_data in FALLBACK_JOBS:
                job = Job(**job_data)
                db.add(job)
            db.commit()

    @staticmethod
    def list_jobs(db: Session, search: Optional[str] = None, location: Optional[str] = None, employment_type: Optional[str] = None) -> List[Job]:
        JobService._seed_jobs_if_empty(db)
        
        query = db.query(Job).filter(Job.is_active == True)
        
        if search:
            query = query.filter(or_(Job.title.ilike(f"%{search}%"), Job.company.ilike(f"%{search}%")))
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if employment_type:
            query = query.filter(Job.employment_type == employment_type)
            
        return query.order_by(Job.posted_at.desc()).all()

    @staticmethod
    def get_job(db: Session, job_id: int) -> Optional[Job]:
        return db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()

    @staticmethod
    def save_job(db: Session, student_id: str, job_id: int) -> SavedJob:
        job = JobService.get_job(db, job_id)
        if not job:
            raise ValueError("Job not found or inactive")
            
        existing = db.query(SavedJob).filter(SavedJob.student_id == student_id, SavedJob.job_id == job_id).first()
        if existing:
            raise ValueError("Job already saved")
            
        saved = SavedJob(student_id=student_id, job_id=job_id)
        db.add(saved)
        db.commit()
        db.refresh(saved)
        return saved

    @staticmethod
    def unsave_job(db: Session, student_id: str, job_id: int):
        existing = db.query(SavedJob).filter(SavedJob.student_id == student_id, SavedJob.job_id == job_id).first()
        if not existing:
            raise ValueError("Saved job not found")
            
        db.delete(existing)
        db.commit()

    @staticmethod
    def list_saved_jobs(db: Session, student_id: str) -> List[SavedJob]:
        return db.query(SavedJob).filter(SavedJob.student_id == student_id).order_by(SavedJob.saved_at.desc()).all()


class ApplicationService:
    @staticmethod
    def create_application(db: Session, student_id: str, payload: JobApplicationCreate) -> JobApplication:
        job = JobService.get_job(db, payload.job_id)
        if not job:
            raise ValueError("Job not found or inactive")
            
        resume = ResumeService.get_resume(db, student_id, payload.resume_id)
        if not resume:
            raise ValueError("Resume not found or does not belong to student")
            
        existing = db.query(JobApplication).filter(
            JobApplication.student_id == student_id, 
            JobApplication.job_id == payload.job_id,
            JobApplication.status.notin_(["REJECTED"]) # allow re-applying if previously rejected? The prompt says "prevent duplicate active application"
        ).first()
        
        if existing:
            raise ValueError("Active application already exists for this job")
            
        app = JobApplication(
            student_id=student_id,
            job_id=payload.job_id,
            resume_id=payload.resume_id,
            status="APPLIED"
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        
        activity = ApplicationActivity(
            application_id=app.id,
            activity_type="STATUS_CHANGE",
            content="Application submitted"
        )
        db.add(activity)
        db.commit()
        
        # Update progress
        progress = db.query(CareerProgress).filter(CareerProgress.student_id == student_id, CareerProgress.module == "JOBS").first()
        if not progress:
            progress = CareerProgress(student_id=student_id, module="JOBS", total_items=1)
            db.add(progress)
        progress.completed_items = (progress.completed_items or 0) + 1
        progress.status = "IN_PROGRESS"
        progress.last_activity = datetime.utcnow()
        db.commit()
        
        db.refresh(app)
        return app

    @staticmethod
    def list_applications(db: Session, student_id: str) -> List[JobApplication]:
        return db.query(JobApplication).filter(JobApplication.student_id == student_id).order_by(JobApplication.applied_at.desc()).all()

    @staticmethod
    def get_application(db: Session, student_id: str, app_id: int) -> Optional[JobApplication]:
        return db.query(JobApplication).filter(JobApplication.student_id == student_id, JobApplication.id == app_id).first()

    @staticmethod
    def update_application_status(db: Session, student_id: str, app_id: int, payload: JobApplicationUpdate) -> JobApplication:
        app = ApplicationService.get_application(db, student_id, app_id)
        if not app:
            raise ValueError("Application not found")
            
        app.status = payload.status
        activity = ApplicationActivity(
            application_id=app.id,
            activity_type="STATUS_CHANGE",
            content=f"Status updated to {payload.status}"
        )
        db.add(activity)
        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def add_activity(db: Session, student_id: str, app_id: int, payload: JobApplicationActivityCreate) -> ApplicationActivity:
        app = ApplicationService.get_application(db, student_id, app_id)
        if not app:
            raise ValueError("Application not found")
            
        activity = ApplicationActivity(
            application_id=app.id,
            activity_type=payload.activity_type,
            content=payload.content
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity


from app.career.jobs.ai_service import JobsAIService

class JobMatchService:
    @staticmethod
    def _build_response(match: JobMatch, job: Job, resume, is_stale: bool):
        # Base dict from SQLAlchemy object
        resp = {
            "id": match.id,
            "job_id": match.job_id,
            "resume_id": match.resume_id,
            "job": job,
            "resume": resume,
            "match_score": match.match_score,
            "deterministic_score": match.deterministic_score,
            "missing_skills": match.missing_skills,
            "missing_keywords": match.missing_keywords,
            "analyzed_at": match.analyzed_at,
            "is_stale": is_stale,
            
            "matched_skills": [],
            "ai_strengths": [],
            "ai_gaps": [],
            "role_alignment": None,
            "recommendations": [],
            "ai_available": False
        }
        
        job_reqs = set([req.lower() for req in (job.requirements or [])])
        resume_skills = set([s.name.lower() for s in resume.skills])
        resp["matched_skills"] = list(job_reqs.intersection(resume_skills))
        
        if match.ai_analysis:
            resp["ai_available"] = True
            resp["ai_strengths"] = match.ai_analysis.get("strengths", [])
            resp["ai_gaps"] = match.ai_analysis.get("potential_gaps", [])
            resp["role_alignment"] = match.ai_analysis.get("role_alignment")
            resp["recommendations"] = match.ai_analysis.get("recommendations", [])
            
        return resp

    @staticmethod
    async def match_job(db: Session, student_id: str, job_id: int, resume_id: int, force_refresh: bool = False):
        job = JobService.get_job(db, job_id)
        if not job:
            raise ValueError("Job not found or inactive")
            
        resume = ResumeService.get_resume(db, student_id, resume_id)
        if not resume:
            raise ValueError("Resume not found or does not belong to student")
            
        match = db.query(JobMatch).filter(
            JobMatch.student_id == student_id,
            JobMatch.job_id == job_id,
            JobMatch.resume_id == resume_id
        ).first()
        
        is_stale = False
        if match and resume.updated_at and match.analyzed_at < resume.updated_at:
            is_stale = True
            
        if match and not force_refresh:
            return JobMatchService._build_response(match, job, resume, is_stale)
            
        # 1. Deterministic match
        job_reqs = set([req.lower() for req in (job.requirements or [])])
        resume_skills = set([s.name.lower() for s in resume.skills])
        
        matched = job_reqs.intersection(resume_skills)
        missing = job_reqs.difference(resume_skills)
        
        deterministic_score = 0.0
        if job_reqs:
            deterministic_score = (len(matched) / len(job_reqs)) * 100.0
        else:
            deterministic_score = 100.0
            
        # 2. AI match
        ai_assessment = await JobsAIService.analyze_job_match(resume, job)
        
        # 3. Final score computation
        # Formula: 70% deterministic + 30% AI (if available)
        final_score = deterministic_score
        ai_analysis_dict = None
        
        if ai_assessment:
            ai_score = ai_assessment.ai_alignment_score
            final_score = (deterministic_score * 0.7) + (ai_score * 0.3)
            ai_analysis_dict = ai_assessment.model_dump()
            
        if not match:
            match = JobMatch(
                student_id=student_id,
                job_id=job_id,
                resume_id=resume_id
            )
            db.add(match)
            
        match.deterministic_score = round(deterministic_score, 2)
        match.match_score = round(final_score, 2)
        match.missing_skills = list(missing)
        match.missing_keywords = list(missing)
        match.ai_analysis = ai_analysis_dict
        match.analyzed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(match)
        
        return JobMatchService._build_response(match, job, resume, False)
