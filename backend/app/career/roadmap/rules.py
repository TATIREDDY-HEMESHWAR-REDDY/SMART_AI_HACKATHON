from sqlalchemy.orm import Session
from sqlalchemy import desc
from collections import Counter
from app.career.roadmap.schemas import RoadmapTaskCreate, TaskCategory, TaskPriority, TaskSource
from app.career.readiness.models import CareerReadinessScore
from app.career.jobs.models import JobMatch, SavedJob
from app.career.interview.models import InterviewSession

class RoadmapRuleEngine:
    @staticmethod
    def generate_deterministic_tasks(db: Session, student_id: str) -> list[RoadmapTaskCreate]:
        tasks = []

        # 1. Readiness Rules
        readiness = db.query(CareerReadinessScore).filter(
            CareerReadinessScore.student_id == student_id
        ).order_by(desc(CareerReadinessScore.created_at)).first()

        if not readiness or readiness.overall_score is None:
            tasks.append(RoadmapTaskCreate(
                title="Assess your current skills",
                description="Take your first assessment to establish a baseline readiness score.",
                category=TaskCategory.GENERAL,
                priority=TaskPriority.HIGH,
                source=TaskSource.DETERMINISTIC
            ))
        else:
            if readiness.coding_score is None:
                tasks.append(RoadmapTaskCreate(
                    title="Complete a Coding Assessment",
                    description="You haven't completed any coding assessments yet.",
                    category=TaskCategory.CODING,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))
            elif readiness.coding_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Strengthen DSA fundamentals",
                    description="Complete 5 coding problems this week to improve your coding readiness.",
                    category=TaskCategory.CODING,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))
            elif readiness.coding_score < 70:
                tasks.append(RoadmapTaskCreate(
                    title="Practice advanced data structures",
                    description="Complete 3 medium-level coding problems.",
                    category=TaskCategory.CODING,
                    priority=TaskPriority.MEDIUM,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.aptitude_score is None:
                pass
            elif readiness.aptitude_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Practice quantitative aptitude",
                    description="Your aptitude score needs improvement. Take a mock aptitude test.",
                    category=TaskCategory.APTITUDE,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.technical_score is None:
                pass
            elif readiness.technical_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Strengthen core technical fundamentals",
                    description="Review computer science core subjects and take a technical assessment.",
                    category=TaskCategory.TECHNICAL,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.communication_score is None:
                pass
            elif readiness.communication_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Complete a communication assessment",
                    description="Practice your verbal and written communication skills.",
                    category=TaskCategory.COMMUNICATION,
                    priority=TaskPriority.MEDIUM,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.interview_score is None:
                tasks.append(RoadmapTaskCreate(
                    title="Take your first mock interview",
                    description="Get familiar with the interview format by taking an AI mock interview.",
                    category=TaskCategory.INTERVIEW,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))
            elif readiness.interview_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Complete a mock interview",
                    description="Your interview readiness is low. Practice with the AI Career Coach.",
                    category=TaskCategory.INTERVIEW,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.resume_score is None:
                tasks.append(RoadmapTaskCreate(
                    title="Build your Resume",
                    description="Create your first resume to unlock job matching.",
                    category=TaskCategory.RESUME,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))
            elif readiness.resume_score < 60:
                tasks.append(RoadmapTaskCreate(
                    title="Improve your resume ATS score",
                    description="Update your resume to fix missing keywords and formatting issues.",
                    category=TaskCategory.RESUME,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))

            if readiness.projects_score is None or readiness.projects_score < 50:
                tasks.append(RoadmapTaskCreate(
                    title="Strengthen project portfolio",
                    description="Add impactful projects to your profile to stand out to recruiters.",
                    category=TaskCategory.PROJECTS,
                    priority=TaskPriority.MEDIUM,
                    source=TaskSource.DETERMINISTIC
                ))

        # 2. Job Gap Analysis
        saved_jobs = db.query(SavedJob).filter(SavedJob.student_id == student_id).all()
        if not saved_jobs:
            tasks.append(RoadmapTaskCreate(
                title="Discover and save jobs",
                description="Save at least 3 jobs you're interested in to get personalized skill gap analysis.",
                category=TaskCategory.JOBS,
                priority=TaskPriority.MEDIUM,
                source=TaskSource.DETERMINISTIC
            ))
        else:
            saved_job_ids = [sj.job_id for sj in saved_jobs]
            matches = db.query(JobMatch).filter(
                JobMatch.student_id == student_id,
                JobMatch.job_id.in_(saved_job_ids)
            ).all()

            all_missing_skills = []
            for match in matches:
                if match.missing_skills:
                    all_missing_skills.extend(match.missing_skills)
            
            if all_missing_skills:
                skill_counts = Counter(all_missing_skills)
                top_skills = [skill for skill, count in skill_counts.items() if count >= 2]
                
                # Create a task for the most common missing skills
                for skill in top_skills[:3]:
                    tasks.append(RoadmapTaskCreate(
                        title=f"Develop {skill}",
                        description=f"This skill appears frequently as a gap across your saved jobs. Learning it will improve your match score.",
                        category=TaskCategory.JOBS,
                        priority=TaskPriority.HIGH,
                        source=TaskSource.DETERMINISTIC
                    ))

        # 3. Interview Gap Analysis
        last_interview = db.query(InterviewSession).filter(
            InterviewSession.student_id == student_id,
            InterviewSession.status == "COMPLETED"
        ).order_by(desc(InterviewSession.completed_at)).first()

        if last_interview and last_interview.ai_summary and "weaknesses" in last_interview.ai_summary:
            weaknesses = last_interview.ai_summary["weaknesses"]
            if isinstance(weaknesses, list) and weaknesses:
                # Add task for the top weakness
                top_weakness = weaknesses[0]
                tasks.append(RoadmapTaskCreate(
                    title=f"Practice {top_weakness} for interviews",
                    description="This was identified as a key area for improvement in your last mock interview.",
                    category=TaskCategory.INTERVIEW,
                    priority=TaskPriority.HIGH,
                    source=TaskSource.DETERMINISTIC
                ))

        return tasks
