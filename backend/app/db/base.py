from app.db.database import Base

# Import all models here for Alembic
from app.career.profile.models import CareerProfile
from app.career.skills.models import StudentSkill
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress
from app.career.ai_insights.models import AIInsight
from app.career.assessments.models import Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer
from app.career.coding.models import CodingProblem, CodingTestCase, CodingSubmission, CodingProgress
from app.career.resume.models import (
    Resume, ResumeEducation, ResumeExperience, ResumeProject, 
    ResumeSkill, ResumeCertification, ResumeAchievement, 
    ResumeActivity, ResumeAnalysis
)
from app.career.interview.models import InterviewSession, InterviewQuestion, InterviewResponse
from app.career.jobs.models import Job, SavedJob, JobApplication, JobMatch, ApplicationActivity
