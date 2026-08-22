# Career OS - Campus OS Module

AI-Powered Student Career & Placement Platform.

## Quick Start

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env`
6. `alembic upgrade head`
7. `uvicorn app.main:app --reload`
Backend API runs at `http://localhost:8000/api/docs`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
Frontend runs at `http://localhost:5173`
