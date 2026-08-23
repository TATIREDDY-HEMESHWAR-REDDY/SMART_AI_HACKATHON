import re
with open("backend/app/ai/service.py", "r") as f:
    content = f.read()

content = content.replace("except Exception:", "except Exception as e:\n            print(f\"AI Generate Exception: {e}\")")

with open("backend/app/ai/service.py", "w") as f:
    f.write(content)
