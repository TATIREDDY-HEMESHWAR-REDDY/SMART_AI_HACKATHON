import requests

base_url = "http://localhost:8000"
endpoints = [
    "/api/v1/career/profile",
    "/api/v1/career/dashboard",
    "/api/v1/career/assessments?category=APTITUDE",
    "/api/v1/career/assessments?category=TECHNICAL",
    "/api/v1/career/assessments?category=COMMUNICATION",
    "/api/v1/career/coding/problems",
    "/api/v1/career/resume",
    "/api/v1/career/interviews/",
    "/api/v1/career/jobs",
    "/api/v1/career/roadmap",
]

for ep in endpoints:
    url = f"{base_url}{ep}"
    try:
        res = requests.get(url, headers={"Authorization": "Bearer mock_token"})
        print(f"[{res.status_code}] {ep}")
    except Exception as e:
        print(f"[ERROR] {ep}: {e}")
