import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.profile.models import CareerProfile
from app.career.skills.models import StudentSkill
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress

from app.career.assessments.models import Assessment, AssessmentQuestion

def seed_career_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(CareerProfile).first():
            print("Database already seeded with career profiles.")
        else:
            print("Seeding career profiles...")
            
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

        # Check for Assessments
        if not db.query(Assessment).first():
            print("Seeding assessments...")
            assm1 = Assessment(
                title="Quantitative Fundamentals",
                description="A foundational test on percentages, ratios, and basic probability.",
                category="APTITUDE",
                topic="Quantitative",
                difficulty="MEDIUM",
                duration_minutes=20,
                total_questions=3,
                passing_score=60.0
            )
            db.add(assm1)
            db.flush()

            q1 = AssessmentQuestion(
                assessment_id=assm1.id,
                question_text="If the price of a book is increased by 20% and then decreased by 20%, what is the net change in price?",
                explanation="Let original price be 100. 20% increase = 120. 20% decrease on 120 = 120 - 24 = 96. Net change is 4% decrease.",
                topic="Percentages",
                difficulty="EASY",
                options=[
                    {"id": "A", "text": "No change"},
                    {"id": "B", "text": "4% increase"},
                    {"id": "C", "text": "4% decrease"},
                    {"id": "D", "text": "10% decrease"}
                ],
                correct_option_id="C"
            )
            
            q2 = AssessmentQuestion(
                assessment_id=assm1.id,
                question_text="A bag contains 5 red, 4 blue, and 3 green marbles. If 2 marbles are drawn at random, what is the probability that both are red?",
                explanation="Total ways = 12C2 = 66. Ways to choose 2 red = 5C2 = 10. Probability = 10/66 = 5/33.",
                topic="Probability",
                difficulty="MEDIUM",
                options=[
                    {"id": "A", "text": "5/33"},
                    {"id": "B", "text": "1/6"},
                    {"id": "C", "text": "2/11"},
                    {"id": "D", "text": "5/12"}
                ],
                correct_option_id="A"
            )

            q3 = AssessmentQuestion(
                assessment_id=assm1.id,
                question_text="If A:B = 2:3 and B:C = 4:5, what is A:B:C?",
                explanation="Make B common. Multiply first by 4 (8:12) and second by 3 (12:15). So A:B:C = 8:12:15.",
                topic="Ratios",
                difficulty="MEDIUM",
                options=[
                    {"id": "A", "text": "2:3:5"},
                    {"id": "B", "text": "8:12:15"},
                    {"id": "C", "text": "6:12:15"},
                    {"id": "D", "text": "8:15:20"}
                ],
                correct_option_id="B"
            )
            
            db.add_all([q1, q2, q3])
            
            assm2 = Assessment(
                title="Logical Reasoning Basics",
                description="Test your logical deduction and coding-decoding skills.",
                category="APTITUDE",
                topic="Logical Reasoning",
                difficulty="EASY",
                duration_minutes=15,
                total_questions=2,
                passing_score=50.0
            )
            db.add(assm2)
            db.flush()

            q4 = AssessmentQuestion(
                assessment_id=assm2.id,
                question_text="If 'APPLE' is coded as 'BQQMF', how is 'MANGO' coded?",
                explanation="Each letter is shifted by +1. M->N, A->B, N->O, G->H, O->P.",
                topic="Coding-Decoding",
                difficulty="EASY",
                options=[
                    {"id": "A", "text": "NBNHP"},
                    {"id": "B", "text": "NBOHP"},
                    {"id": "C", "text": "NBPFP"},
                    {"id": "D", "text": "OCPIO"}
                ],
                correct_option_id="B"
            )

            q5 = AssessmentQuestion(
                assessment_id=assm2.id,
                question_text="Looking at a portrait of a man, Harsh said, 'His mother is the wife of my father's son. Brothers and sisters I have none.' At whose portrait was Harsh looking?",
                explanation="Since Harsh has no siblings, 'my father's son' is Harsh himself. So the man's mother is Harsh's wife. Therefore, the man is Harsh's son.",
                topic="Blood Relations",
                difficulty="MEDIUM",
                options=[
                    {"id": "A", "text": "His son"},
                    {"id": "B", "text": "His nephew"},
                    {"id": "C", "text": "His father"},
                    {"id": "D", "text": "His cousin"}
                ],
                correct_option_id="A"
            )
            
            db.add_all([q4, q5])
            db.commit()

        print("Career seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_career_data()
