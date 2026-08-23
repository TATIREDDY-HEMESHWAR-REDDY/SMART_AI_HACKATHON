import re

with open("backend/app/career/interview/router.py", "r") as f:
    content = f.read()

shim = """
async def get_current_student_id():
    student = await student_context_service.get_current_student("mock_token")
    if not student:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return student.id
"""

if "def get_current_student_id" not in content:
    content = content.replace("router = APIRouter()\n", f"router = APIRouter()\n{shim}")

content = re.sub(
    r"student: any = Depends\(student_context_service.get_current_student\)",
    r"student_id: str = Depends(get_current_student_id)",
    content
)

# Replace student.id with student_id
content = re.sub(r"student\.id", r"student_id", content)

with open("backend/app/career/interview/router.py", "w") as f:
    f.write(content)

