import re
with open("backend/app/career/interview/service.py", "r") as f:
    content = f.read()

# Replace profile.skills with db query
replacement = """
        from app.career.skills.models import StudentSkill
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()
        
        context = {
            "target_role": setup.target_role,
            "skills": [s.name for s in skills] if skills else [],
            "projects": []
        }
"""

content = re.sub(
    r'context = \{\s*"target_role": setup\.target_role,\s*"skills": \[s\.name for s in profile\.skills\] if profile else \[\],\s*"projects": \[\]\s*\}',
    replacement,
    content
)

with open("backend/app/career/interview/service.py", "w") as f:
    f.write(content)
