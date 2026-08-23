with open("backend/app/career/assessments/router.py", "r") as f:
    content = f.read()

content = content.replace("from .schemas import", "from .models import AssessmentAttempt\nfrom .schemas import")

content = content.replace(
    "attempt = db.query(AssessmentService.get_attempt(db, 0, \"\").__class__).filter_by(assessment_id=id, student_id=student_id, status=\"IN_PROGRESS\").first()",
    "attempt = db.query(AssessmentAttempt).filter_by(assessment_id=id, student_id=student_id, status=\"IN_PROGRESS\").first()"
)

with open("backend/app/career/assessments/router.py", "w") as f:
    f.write(content)
