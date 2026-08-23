with open("backend/app/career/resume/router.py", "r") as f:
    content = f.read()

content = content.replace('@router.get("/",', '@router.get("",')
content = content.replace('@router.post("/",', '@router.post("",')

with open("backend/app/career/resume/router.py", "w") as f:
    f.write(content)
