import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.resume.models import Resume, ResumeEducation, ResumeExperience, ResumeProject, ResumeSkill, ResumeAnalysis
from app.career.readiness.service import CareerReadinessService

async def seed_resumes():
    db = SessionLocal()
    student_id = "STU10045"
    
    # Clear existing
    db.query(Resume).filter(Resume.student_id == student_id).delete()
    db.commit()

    resume = Resume(
        student_id=student_id,
        title="Software Engineering Resume",
        template="modern",
        is_default=True,
        full_name="Alex Chen",
        email="alex.chen@example.com",
        phone="(555) 123-4567",
        location="San Francisco, CA",
        linkedin="linkedin.com/in/alexchen",
        github="github.com/alexchen",
        summary="Passionate Full Stack Engineer with experience in Python, React, and cloud architecture. Proven ability to build scalable web applications and improve system performance."
    )
    db.add(resume)
    db.flush()

    edu = ResumeEducation(
        resume_id=resume.id,
        institution="University of Technology",
        degree="Bachelor of Science",
        field="Computer Science",
        start_date="Sep 2020",
        end_date="May 2024",
        gpa="3.8/4.0"
    )
    db.add(edu)

    exp1 = ResumeExperience(
        resume_id=resume.id,
        company="TechCorp Inc.",
        role="Software Engineering Intern",
        location="San Jose, CA",
        start_date="May 2023",
        end_date="Aug 2023",
        is_current=False,
        achievements=["Developed a microservice in FastAPI that reduced data processing time by 40%.", "Implemented Redis caching layer, decreasing API latency by 200ms.", "Collaborated with UX team to redesign the analytics dashboard."]
    )
    db.add(exp1)
    
    proj1 = ResumeProject(
        resume_id=resume.id,
        name="E-Commerce Analytics Platform",
        description="A real-time dashboard for merchants to track sales metrics.",
        technologies=["React", "Node.js", "PostgreSQL", "Docker"],
        start_date="Jan 2023",
        end_date="Apr 2023",
        achievements=["Built RESTful APIs supporting 10,000+ daily requests.", "Deployed application using Docker containers on AWS EC2."]
    )
    db.add(proj1)

    skills = [
        ResumeSkill(resume_id=resume.id, category="Languages", name="Python, JavaScript, TypeScript, SQL", proficiency="Advanced"),
        ResumeSkill(resume_id=resume.id, category="Frameworks", name="React, FastAPI, Node.js, Express", proficiency="Intermediate"),
        ResumeSkill(resume_id=resume.id, category="Tools", name="Git, Docker, AWS, PostgreSQL", proficiency="Intermediate")
    ]
    for s in skills: db.add(s)
    
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=88.5,
        ats_score=95.0,
        content_quality=82.0,
        skills_strength=90.0,
        experience_quality=85.0,
        project_quality=80.0,
        education_completeness=100.0,
        formatting_score=100.0,
        strengths=["Strong action verbs in experience", "Good metrics and quantifiable results", "Excellent keyword coverage"],
        weaknesses=["Summary could be more specific to a target role", "Missing certifications"],
        actionable_improvements=["Add a certifications section if applicable", "Tailor summary slightly more towards backend roles"],
        target_job_title="Backend Engineer",
        job_match_score=85.0,
        missing_skills=["Kubernetes", "GraphQL"]
    )
    db.add(analysis)

    db.commit()
    
    # Update readiness
    CareerReadinessService.update_component(db, student_id, "RESUME", 88.5)
    
    db.close()
    print("Seed complete")

if __name__ == "__main__":
    asyncio.run(seed_resumes())
