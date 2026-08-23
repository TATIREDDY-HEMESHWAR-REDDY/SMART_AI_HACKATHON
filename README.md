# SMART AI Hackathon — Unified Campus OS

This repo contains two integrated systems:

| Directory | App | Stack |
|---|---|---|
| `campusos/` | **CampusOS ERP** — academics, attendance, fees, safety, wellbeing | Next.js |
| `frontend/` | **Career OS** — placement prep, assessments, coding, resume, AI coach | React + Vite |
| `backend/` | **Career OS API** | Python FastAPI |

## Getting started

### 1 · CampusOS ERP
```bash
cd campusos
npm install
npm run dev          # runs on http://localhost:3001
```

### 2 · Career OS API
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3 · Career OS Frontend
```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

## Integration

From the CampusOS ERP student dashboard, click **Career Portal** in the sidebar.  
The ERP passes the logged-in student's name and section as URL parameters to the Career OS,  
which picks them up automatically — no second login required.
