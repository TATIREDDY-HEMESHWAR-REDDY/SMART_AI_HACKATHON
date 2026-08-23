from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.career.jobs.models import Job, JobApplication, SavedJob, JobMatch, ApplicationActivity
from app.career.resume.models import Resume, ResumeSkill
import time
import random

client = TestClient(app)
db = SessionLocal()

test_student_id = f"mock_student_{random.randint(1000,9999)}"

# Mock the dependency properly
from app.career.jobs.router import get_current_student_id
async def mock_get_current_student_id():
    return test_student_id

app.dependency_overrides[get_current_student_id] = mock_get_current_student_id

print(f"Setting up test dependencies for {test_student_id}...")
resume = Resume(student_id=test_student_id, title="Test Resume", is_default=True)
db.add(resume)
db.commit()
db.refresh(resume)

skill1 = ResumeSkill(resume_id=resume.id, name="Python")
skill2 = ResumeSkill(resume_id=resume.id, name="Django")
db.add_all([skill1, skill2])
db.commit()

print("1. List jobs & 12. Fallback jobs seed")
res = client.get("/api/v1/career/jobs")
assert res.status_code == 200
jobs = res.json()
assert len(jobs) >= 10
job_id = jobs[0]["id"]
print("List jobs passed. Jobs count:", len(jobs))

print("2. Search/filter jobs")
res = client.get("/api/v1/career/jobs?search=Data")
assert len(res.json()) > 0
res = client.get("/api/v1/career/jobs?employment_type=FULL_TIME")
assert len(res.json()) > 0
print("Search passed.")

print("3. Get job")
res = client.get(f"/api/v1/career/jobs/{job_id}")
assert res.status_code == 200
assert res.json()["title"] == jobs[0]["title"]
print("Get job passed.")

print("4. Save job")
res = client.post(f"/api/v1/career/jobs/{job_id}/save")
assert res.status_code == 200
print("Save job passed.")

print("5. Prevent duplicate save")
res = client.post(f"/api/v1/career/jobs/{job_id}/save")
assert res.status_code == 400
assert "Job already saved" in res.json()["detail"]
print("Prevent duplicate save passed.")

print("6. Unsave job")
res = client.delete(f"/api/v1/career/jobs/{job_id}/save")
assert res.status_code == 200
res = client.delete(f"/api/v1/career/jobs/{job_id}/save")
assert res.status_code == 400
print("Unsave job passed.")

print("7. Create application")
res = client.post("/api/v1/career/applications", json={"job_id": job_id, "resume_id": resume.id})
assert res.status_code == 200
app_id = res.json()["id"]
print("Create application passed.")

print("8. Verify resume ownership")
res = client.post("/api/v1/career/applications", json={"job_id": jobs[1]["id"], "resume_id": 99999})
assert res.status_code == 400
assert "Resume not found" in res.json()["detail"]
print("Resume ownership passed.")

print("9. Prevent duplicate active application")
res = client.post("/api/v1/career/applications", json={"job_id": job_id, "resume_id": resume.id})
assert res.status_code == 400
assert "Active application already exists" in res.json()["detail"]
print("Prevent duplicate app passed.")

print("10. Update application status")
res = client.patch(f"/api/v1/career/applications/{app_id}", json={"status": "INTERVIEWING"})
assert res.status_code == 200
assert res.json()["status"] == "INTERVIEWING"
print("Update status passed.")

print("11. Add application activity")
res = client.post(f"/api/v1/career/applications/{app_id}/activities", json={"activity_type": "NOTE", "content": "Contacted recruiter."})
assert res.status_code == 200
assert res.json()["content"] == "Contacted recruiter."
print("Add activity passed.")

print("12. Deterministic job matching & 13. Missing skills calculation")
job = db.query(Job).filter(Job.id == job_id).first()
job.requirements = ["Python", "Django", "React"]
db.commit()

res = client.post(f"/api/v1/career/jobs/{job_id}/match?resume_id={resume.id}")
assert res.status_code == 200
match = res.json()
assert match["deterministic_score"] > 60 and match["deterministic_score"] < 70
assert "react" in match["missing_skills"]
print("Deterministic matching passed.")

print("14. Stale match detection")
time.sleep(1)
resume.title = "Updated Title"
db.commit()
res = client.post(f"/api/v1/career/jobs/{job_id}/match?resume_id={resume.id}")
assert res.status_code == 200
assert res.json()["is_stale"] == True
print("Stale match passed.")

print("All API tests passed successfully!")
db.close()
