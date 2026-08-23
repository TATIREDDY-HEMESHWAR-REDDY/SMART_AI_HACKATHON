import asyncio
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.career.jobs.models import Job, JobMatch
from app.career.resume.models import Resume, ResumeSkill
from app.career.jobs.ai_service import AIAssessmentOutput

client = TestClient(app)
db = SessionLocal()
test_student_id = "ai_mock_student_1"

# Mock dependency
from app.career.jobs.router import get_current_student_id
async def mock_get_current_student_id():
    return test_student_id
app.dependency_overrides[get_current_student_id] = mock_get_current_student_id

def setup_db():
    resume = Resume(student_id=test_student_id, title="AI Test Resume", is_default=True)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    skill1 = ResumeSkill(resume_id=resume.id, name="Python")
    skill2 = ResumeSkill(resume_id=resume.id, name="Machine Learning")
    db.add_all([skill1, skill2])
    db.commit()
    
    # Create an active job
    job = Job(title="AI Engineer", company="AI Corp", description="Build AI", location="Remote", employment_type="FULL_TIME", requirements=["Python", "TensorFlow"])
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return resume, job

def test_ai_job_match_success():
    resume, job = setup_db()
    
    mock_ai_output = AIAssessmentOutput(
        qualitative_analysis="Great fit.",
        strengths=["Python"],
        potential_gaps=["TensorFlow"],
        recommended_skills=["TensorFlow"],
        role_alignment="Strong",
        recommendations=["Learn TF"],
        ai_alignment_score=80.0
    )
    
    with patch('app.career.jobs.ai_service.JobsAIService.analyze_job_match', new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = mock_ai_output
        
        # force refresh to ensure we trigger AI
        res = client.post(f"/api/v1/career/jobs/{job.id}/match?resume_id={resume.id}&force_refresh=true")
        assert res.status_code == 200
        
        data = res.json()
        assert data["ai_available"] == True
        assert data["ai_strengths"] == ["Python"]
        assert data["role_alignment"] == "Strong"
        
        # Deterministic: 1/2 matched = 50.0
        # AI: 80.0
        # Final: 0.7 * 50 + 0.3 * 80 = 35 + 24 = 59.0
        assert data["deterministic_score"] == 50.0
        assert data["match_score"] == 59.0

def test_ai_job_match_failure():
    # If AI fails, it should fallback safely
    resume, job = setup_db()
    
    with patch('app.career.jobs.ai_service.JobsAIService.analyze_job_match', new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = None # simulates failure
        
        res = client.post(f"/api/v1/career/jobs/{job.id}/match?resume_id={resume.id}&force_refresh=true")
        assert res.status_code == 200
        
        data = res.json()
        assert data["ai_available"] == False
        assert data["match_score"] == 50.0 # Falls back to deterministic
        assert data["deterministic_score"] == 50.0

test_ai_job_match_success()
test_ai_job_match_failure()
print("All AI match tests passed successfully!")
