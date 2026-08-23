import re

for filename in ["frontend/src/services/codingService.ts", "frontend/src/services/resumeService.ts"]:
    with open(filename, "r") as f:
        content = f.read()

    # Replace import axios from 'axios' with import { api } from './api'
    content = content.replace("import axios from 'axios';", "import { api as axios } from './api';")

    # Replace /api/v1/career/... with /career/... since the interceptor adds baseURL
    content = content.replace("'/api/v1/career/coding'", "'/career/coding'")
    content = content.replace("'/api/v1/career/resumes'", "'/career/resumes'")

    with open(filename, "w") as f:
        f.write(content)
