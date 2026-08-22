import asyncio
from app.db.database import SessionLocal
from app.career.resume.service import ResumeService
from app.career.resume.schemas import ResumeCreate, ResumeEducationCreate
from app.career.readiness.service import CareerReadinessService

async def test():
    db = SessionLocal()
    student_id = "STU10045"
    
    resume_in = ResumeCreate(
        title="My SWE Resume",
        template="modern",
        is_default=True,
        full_name="Alice Smith",
        email="alice@example.com",
        phone="555-0100",
        summary="Passionate software engineer with 2 years of experience.",
        educations=[ResumeEducationCreate(institution="State Univ", degree="BS", field="CS")]
    )
    
    resume = ResumeService.create_resume(db, student_id, resume_in)
    print(f"Created Resume ID: {resume.id}, Title: {resume.title}")
    
    # Run deterministic scoring
    scores = ResumeService.get_resume(db, student_id, resume.id)
    analysis = await ResumeService.analyze_resume(db, student_id, resume.id)
    print(f"Overall Score: {analysis.overall_score}")
    print(f"ATS Score: {analysis.ats_score}")
    
    readiness = CareerReadinessService.get_latest_score(db, student_id)
    # Check if RESUME component was updated
    resume_comp = next((c for c in readiness.components if c.name == "RESUME"), None)
    if resume_comp:
        print(f"Resume Component Score: {resume_comp.score}, Status: {resume_comp.status}")
    else:
        print("Resume Component Not Found")

    db.close()

if __name__ == "__main__":
    asyncio.run(test())
