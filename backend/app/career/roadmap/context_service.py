from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.career.profile.models import CareerProfile
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress
from app.career.jobs.models import JobMatch, SavedJob
from app.career.interview.models import InterviewSession
from app.career.roadmap.models import CareerGoal, RoadmapTask
from collections import Counter

def gather_student_context(db: Session, student_id: str) -> dict:
    context = {}
    
    # 1. Profile & Target Role
    profile = db.query(CareerProfile).filter(CareerProfile.student_id == student_id).first()
    goal = db.query(CareerGoal).filter(CareerGoal.student_id == student_id, CareerGoal.status == "ACTIVE").order_by(desc(CareerGoal.created_at)).first()
    
    context["target_role"] = goal.target_role if goal and goal.target_role else (profile.target_role if profile else "Unknown")
    context["career_objective"] = profile.career_objective if profile else "Unknown"
    
    # 2. Readiness
    readiness = db.query(CareerReadinessScore).filter(CareerReadinessScore.student_id == student_id).order_by(desc(CareerReadinessScore.created_at)).first()
    if readiness:
        context["readiness"] = {
            "overall_score": readiness.overall_score,
            "coding_score": readiness.coding_score,
            "aptitude_score": readiness.aptitude_score,
            "technical_score": readiness.technical_score,
            "communication_score": readiness.communication_score,
            "interview_score": readiness.interview_score,
            "resume_score": readiness.resume_score,
            "projects_score": readiness.projects_score
        }
    else:
        context["readiness"] = "No readiness assessments completed yet."

    # 3. Progress
    progress_records = db.query(CareerProgress).filter(CareerProgress.student_id == student_id).all()
    if progress_records:
        context["progress"] = [
            {"module": p.module, "completed_items": p.completed_items, "status": p.status}
            for p in progress_records
        ]
    else:
        context["progress"] = "No progress records."

    # 4. Jobs & Missing Skills
    saved_jobs = db.query(SavedJob).filter(SavedJob.student_id == student_id).all()
    if saved_jobs:
        job_ids = [sj.job_id for sj in saved_jobs]
        matches = db.query(JobMatch).filter(JobMatch.student_id == student_id, JobMatch.job_id.in_(job_ids)).all()
        all_missing_skills = []
        for m in matches:
            if m.missing_skills:
                all_missing_skills.extend(m.missing_skills)
        if all_missing_skills:
            counts = Counter(all_missing_skills)
            # Top 5 missing skills
            context["repeated_job_skill_gaps"] = [skill for skill, count in counts.most_common(5)]
        else:
            context["repeated_job_skill_gaps"] = []
    else:
        context["repeated_job_skill_gaps"] = "No saved jobs to analyze."

    # 5. Interview
    last_interview = db.query(InterviewSession).filter(
        InterviewSession.student_id == student_id,
        InterviewSession.status == "COMPLETED"
    ).order_by(desc(InterviewSession.completed_at)).first()
    
    if last_interview:
        context["recent_interview"] = {
            "score": last_interview.overall_score,
            "weaknesses": last_interview.ai_summary.get("weaknesses", []) if last_interview.ai_summary else [],
            "strengths": last_interview.ai_summary.get("strengths", []) if last_interview.ai_summary else []
        }
    else:
        context["recent_interview"] = "No completed interviews."

    # 6. Roadmap Tasks
    pending_tasks = db.query(RoadmapTask).filter(
        RoadmapTask.student_id == student_id, RoadmapTask.status == "PENDING"
    ).order_by(desc(RoadmapTask.priority)).limit(5).all()
    
    completed_tasks = db.query(RoadmapTask).filter(
        RoadmapTask.student_id == student_id, RoadmapTask.status == "COMPLETED"
    ).order_by(desc(RoadmapTask.completed_at)).limit(3).all()

    context["roadmap"] = {
        "pending_high_priority_tasks": [
            {"title": t.title, "category": t.category, "priority": t.priority} 
            for t in pending_tasks
        ],
        "recently_completed_tasks": [
            {"title": t.title, "category": t.category} 
            for t in completed_tasks
        ]
    }

    return context
