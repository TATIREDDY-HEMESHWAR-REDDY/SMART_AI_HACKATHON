import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.profile.models import CareerProfile
from app.career.skills.models import StudentSkill
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress

def seed_career_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(CareerProfile).first():
            print("Database already seeded with career profiles.")
            return

        print("Seeding career data...")
        
        # Primary Demo Student
        profile1 = CareerProfile(
            student_id="STU10045",
            target_role="Software Engineer",
            target_domain="Full Stack Development",
            career_objective="To build scalable AI-powered products.",
            github_url="https://github.com/sameer",
            projects=[{"name": "Campus OS", "description": "Unified platform"}],
            internships=[]
        )
        db.add(profile1)
        
        # Skills for Primary Demo Student
        skills1 = [
            StudentSkill(student_id="STU10045", name="Python", category="Programming", level="ADVANCED", score=85),
            StudentSkill(student_id="STU10045", name="React", category="Web Development", level="INTERMEDIATE", score=72),
            StudentSkill(student_id="STU10045", name="SQL", category="Databases", level="ADVANCED", score=88),
            StudentSkill(student_id="STU10045", name="DSA", category="DSA", level="INTERMEDIATE", score=65),
            StudentSkill(student_id="STU10045", name="Communication", category="Soft Skills", level="ADVANCED", score=90),
        ]
        db.add_all(skills1)
        
        # Progress
        progress1 = [
            CareerProgress(student_id="STU10045", module="CODING", progress_percentage=45.0, status="IN_PROGRESS", completed_items=45, total_items=100),
            CareerProgress(student_id="STU10045", module="APTITUDE", progress_percentage=20.0, status="IN_PROGRESS", completed_items=5, total_items=25),
        ]
        db.add_all(progress1)
        
        # Readiness Score (Partially Assessed)
        readiness1 = CareerReadinessScore(
            student_id="STU10045",
            overall_score=76.5,
            coding_score=82.0,
            aptitude_score=70.0,
            technical_score=75.0,
            communication_score=85.0,
            interview_score=None, # Not assessed
            resume_score=70.0,
            projects_score=80.0
        )
        db.add(readiness1)
        
        
        # Second Demo Student (Empty/New)
        profile2 = CareerProfile(
            student_id="STU20000",
            target_role="Data Scientist"
        )
        db.add(profile2)
        
        db.commit()
        print("Career seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_career_data()
