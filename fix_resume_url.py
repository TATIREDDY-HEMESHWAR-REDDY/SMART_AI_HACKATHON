with open("frontend/src/services/resumeService.ts", "r") as f:
    content = f.read()

content = content.replace("const API_URL = '/career/resumes';", "const API_URL = '/career/resume';")

with open("frontend/src/services/resumeService.ts", "w") as f:
    f.write(content)
