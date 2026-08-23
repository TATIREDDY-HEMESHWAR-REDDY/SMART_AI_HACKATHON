with open("backend/app/ai/service.py", "r") as f:
    content = f.read()

content = content.replace("import os\nif os.getenv(\"GEMINI_API_KEY\"):", "from app.core.config import settings\nif settings.GEMINI_API_KEY:")

with open("backend/app/ai/service.py", "w") as f:
    f.write(content)
