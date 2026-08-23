with open("backend/app/career/interview/router.py", "r") as f:
    content = f.read()

content = content.replace("return student_id", "return student.id")

with open("backend/app/career/interview/router.py", "w") as f:
    f.write(content)
