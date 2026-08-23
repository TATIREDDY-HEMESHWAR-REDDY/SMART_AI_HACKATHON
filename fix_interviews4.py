with open("backend/app/career/interview/router.py", "r") as f:
    content = f.read()

content = content.replace("if not student_id:\n        raise HTTPException(status_code=401, detail=\"Not authenticated\")\n    return student.id", "if not student:\n        raise HTTPException(status_code=401, detail=\"Not authenticated\")\n    return student.id")

with open("backend/app/career/interview/router.py", "w") as f:
    f.write(content)
