import re
with open("backend/app/career/interview/router.py", "r") as f:
    content = f.read()

# I will just write a clean script to replace 'if not student:' with 'if not student_id:'
# And anything else using `student` incorrectly in that module.
content = content.replace("if not student:", "if not student_id:")

with open("backend/app/career/interview/router.py", "w") as f:
    f.write(content)
