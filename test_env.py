import os
from dotenv import load_dotenv
print("os.getenv without dotenv:", os.getenv("GEMINI_API_KEY"))
load_dotenv("backend/.env")
print("os.getenv with dotenv:", os.getenv("GEMINI_API_KEY"))
