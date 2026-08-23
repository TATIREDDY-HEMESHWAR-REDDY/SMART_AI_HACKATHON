"""
Seed Career OS database with all students from the CampusOS ERP.
Run from the backend/ directory: python seed_erp_students.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.career.profile.models import CareerProfile
from app.career.skills.models import StudentSkill
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress
from app.career.assessments.models import Assessment, AssessmentQuestion

Base.metadata.create_all(bind=engine)

# ERP students (id → name, section, cgpa from campusos.db)
ERP_STUDENTS = [
    {"id": 6,  "name": "Aarav Sharma",   "section": "A1", "cgpa": 8.6},
    {"id": 7,  "name": "Riya Kapoor",    "section": "A1", "cgpa": 8.1},
    {"id": 8,  "name": "Dev Patel",      "section": "A1", "cgpa": 7.4},
    {"id": 9,  "name": "Ananya Gupta",   "section": "A1", "cgpa": 9.0},
    {"id": 10, "name": "Kunal Sen",      "section": "A1", "cgpa": 7.8},
    {"id": 11, "name": "Ishaan Verma",   "section": "B1", "cgpa": 8.3},
    {"id": 12, "name": "Meera Joshi",    "section": "B1", "cgpa": 8.7},
    {"id": 13, "name": "Rohan Das",      "section": "B1", "cgpa": 7.2},
    {"id": 14, "name": "Sneha Reddy",    "section": "B1", "cgpa": 8.9},
    {"id": 15, "name": "Varun Mehta",    "section": "B1", "cgpa": 7.5},
    {"id": 16, "name": "Zoya Khan",      "section": "C1", "cgpa": 8.4},
    {"id": 17, "name": "Aditya Singh",   "section": "C1", "cgpa": 7.9},
    {"id": 18, "name": "Neha Nair",      "section": "C1", "cgpa": 8.2},
    {"id": 19, "name": "Vikram Rao",     "section": "C1", "cgpa": 7.6},
    {"id": 20, "name": "Kriti Sharma",   "section": "C1", "cgpa": 8.8},
]

# Per-student skill sets (realistic variation)
SKILL_TEMPLATES = {
    6:  [("Python","Programming","ADVANCED",85),("React","Web Dev","INTERMEDIATE",72),("SQL","Databases","ADVANCED",88),("DSA","DSA","INTERMEDIATE",65),("Communication","Soft Skills","ADVANCED",90)],
    7:  [("Java","Programming","INTERMEDIATE",74),("HTML/CSS","Web Dev","ADVANCED",82),("MySQL","Databases","INTERMEDIATE",70),("DSA","DSA","BEGINNER",50),("Communication","Soft Skills","ADVANCED",88)],
    8:  [("C++","Programming","ADVANCED",80),("Machine Learning","AI/ML","INTERMEDIATE",68),("PostgreSQL","Databases","INTERMEDIATE",72),("DSA","DSA","ADVANCED",78),("Leadership","Soft Skills","INTERMEDIATE",65)],
    9:  [("Python","Programming","ADVANCED",92),("TensorFlow","AI/ML","ADVANCED",85),("MongoDB","Databases","INTERMEDIATE",75),("DSA","DSA","ADVANCED",80),("Communication","Soft Skills","ADVANCED",95)],
    10: [("JavaScript","Programming","INTERMEDIATE",70),("Node.js","Backend","BEGINNER",55),("MySQL","Databases","INTERMEDIATE",68),("DSA","DSA","BEGINNER",48),("Teamwork","Soft Skills","INTERMEDIATE",72)],
    11: [("Python","Programming","INTERMEDIATE",75),("Django","Backend","INTERMEDIATE",70),("PostgreSQL","Databases","INTERMEDIATE",73),("DSA","DSA","INTERMEDIATE",60),("Presentation","Soft Skills","INTERMEDIATE",68)],
    12: [("Java","Programming","ADVANCED",83),("Spring Boot","Backend","INTERMEDIATE",76),("Oracle DB","Databases","ADVANCED",81),("DSA","DSA","INTERMEDIATE",67),("Communication","Soft Skills","ADVANCED",90)],
    13: [("C","Programming","INTERMEDIATE",65),("React","Web Dev","BEGINNER",52),("MySQL","Databases","BEGINNER",58),("DSA","DSA","BEGINNER",44),("Teamwork","Soft Skills","INTERMEDIATE",70)],
    14: [("Python","Programming","ADVANCED",90),("Data Analysis","AI/ML","ADVANCED",88),("SQL","Databases","ADVANCED",86),("DSA","DSA","ADVANCED",75),("Communication","Soft Skills","ADVANCED",92)],
    15: [("JavaScript","Programming","INTERMEDIATE",72),("Vue.js","Web Dev","INTERMEDIATE",68),("MongoDB","Databases","INTERMEDIATE",65),("DSA","DSA","INTERMEDIATE",58),("Leadership","Soft Skills","INTERMEDIATE",62)],
    16: [("Python","Programming","ADVANCED",87),("Flask","Backend","INTERMEDIATE",74),("MySQL","Databases","ADVANCED",82),("DSA","DSA","INTERMEDIATE",64),("Communication","Soft Skills","ADVANCED",89)],
    17: [("Java","Programming","INTERMEDIATE",76),("Android Dev","Mobile","INTERMEDIATE",71),("SQLite","Databases","INTERMEDIATE",69),("DSA","DSA","INTERMEDIATE",62),("Presentation","Soft Skills","INTERMEDIATE",66)],
    18: [("Python","Programming","ADVANCED",88),("React","Web Dev","ADVANCED",80),("PostgreSQL","Databases","INTERMEDIATE",74),("DSA","DSA","INTERMEDIATE",66),("Communication","Soft Skills","ADVANCED",91)],
    19: [("C++","Programming","INTERMEDIATE",73),("OpenCV","AI/ML","BEGINNER",55),("MySQL","Databases","INTERMEDIATE",67),("DSA","DSA","INTERMEDIATE",60),("Teamwork","Soft Skills","INTERMEDIATE",68)],
    20: [("Python","Programming","ADVANCED",89),("Scikit-learn","AI/ML","ADVANCED",83),("PostgreSQL","Databases","INTERMEDIATE",77),("DSA","DSA","ADVANCED",72),("Leadership","Soft Skills","ADVANCED",85)],
}

TARGET_ROLES = {
    6:"Software Engineer", 7:"Frontend Developer", 8:"ML Engineer",
    9:"Data Scientist", 10:"Backend Developer", 11:"Full Stack Developer",
    12:"Java Developer", 13:"Software Engineer", 14:"Data Analyst",
    15:"Frontend Developer", 16:"Backend Developer", 17:"Android Developer",
    18:"Full Stack Developer", 19:"Computer Vision Engineer", 20:"Data Scientist",
}

GITHUB_URLS = {s["id"]: f"https://github.com/{s['name'].lower().replace(' ','')}" for s in ERP_STUDENTS}

def student_id(erp_id: int) -> str:
    return f"STU{erp_id:05d}"

def readiness_score(cgpa: float, skills) -> float:
    avg_skill = sum(s[3] for s in skills) / len(skills)
    return round(min(100, (cgpa / 10) * 40 + avg_skill * 0.6), 1)

def seed():
    db = SessionLocal()
    try:
        existing = {p.student_id for p in db.query(CareerProfile).all()}

        for s in ERP_STUDENTS:
            sid = student_id(s["id"])
            skills = SKILL_TEMPLATES[s["id"]]
            role = TARGET_ROLES[s["id"]]

            if sid not in existing:
                db.add(CareerProfile(
                    student_id=sid,
                    target_role=role,
                    target_domain="Technology",
                    career_objective=f"Aspiring {role} building impactful products.",
                    github_url=GITHUB_URLS[s["id"]],
                    projects=[{"name": "CampusOS", "description": "AI-powered campus ERP"}],
                    internships=[],
                ))

            existing_skills = {sk.name for sk in db.query(StudentSkill).filter_by(student_id=sid).all()}
            for name, cat, level, score in skills:
                if name not in existing_skills:
                    db.add(StudentSkill(student_id=sid, name=name, category=cat, level=level, score=score))

            if not db.query(CareerReadinessScore).filter_by(student_id=sid).first():
                rs = readiness_score(s["cgpa"], skills)
                db.add(CareerReadinessScore(
                    student_id=sid,
                    overall_score=rs,
                    coding_score=round(sum(sk[3] for sk in skills if sk[1] in ("Programming","DSA")) / 2, 1),
                    aptitude_score=round(rs * 0.85, 1),
                    technical_score=round(rs * 0.9, 1),
                    communication_score=next((sk[3] for sk in skills if sk[1] == "Soft Skills"), 70),
                    resume_score=round(rs * 0.8, 1),
                    projects_score=round(rs * 0.88, 1),
                ))

            existing_mods = {p.module for p in db.query(CareerProgress).filter_by(student_id=sid).all()}
            for mod, pct, done, total in [
                ("CODING", 45, 45, 100), ("APTITUDE", 20, 5, 25),
                ("RESUME", 60, 3, 5),    ("INTERVIEW", 10, 1, 10),
            ]:
                if mod not in existing_mods:
                    db.add(CareerProgress(student_id=sid, module=mod,
                        progress_percentage=pct, status="IN_PROGRESS",
                        completed_items=done, total_items=total))

        db.commit()
        print(f"Seeded {len(ERP_STUDENTS)} students OK.")

        # Seed assessments if missing
        from app.seed.career_seed import seed_career_data
        seed_career_data()

    except Exception as e:
        print(f"Error: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
