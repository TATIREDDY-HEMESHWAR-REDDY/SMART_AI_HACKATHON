from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .models import InterviewSession, InterviewQuestion, InterviewResponse
from .schemas import CreateInterview, InterviewResponseSubmit
from .ai_service import InterviewAIService
from app.career.profile.service import CareerProfileService
from app.career.resume.service import ResumeService
from app.career.readiness.service import CareerReadinessService
from app.career.progress.models import CareerProgress

class InterviewService:
    
    @staticmethod
    async def create_session(db: Session, student_id: str, setup: CreateInterview) -> InterviewSession:
        session = InterviewSession(
            student_id=student_id,
            target_role=setup.target_role,
            interview_type=setup.interview_type,
            mode=setup.mode,
            difficulty=setup.difficulty,
            status="NOT_STARTED"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Gather context
        profile = CareerProfileService.get_profile(db, student_id)
        resumes = ResumeService.get_resumes(db, student_id)
        
        
        from app.career.skills.models import StudentSkill
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()
        
        context = {
            "target_role": setup.target_role,
            "skills": [s.name for s in skills] if skills else [],
            "projects": []
        }

        if resumes:
            best_resume = resumes[0]
            context["projects"] = [p.name for p in best_resume.projects]
            
        # Generate Questions using AI (falls back if AI fails)
        generated = await InterviewAIService.generate_questions(context, setup.num_questions, setup.interview_type)
        
        for i, q_data in enumerate(generated, 1):
            question = InterviewQuestion(
                session_id=session.id,
                question_number=i,
                question=q_data.get("question", "Question placeholder"),
                category=q_data.get("category", "TECHNICAL"),
                difficulty=q_data.get("difficulty", "MEDIUM"),
                expected_topics=q_data.get("expected_topics", [])
            )
            db.add(question)
            
        session.status = "IN_PROGRESS"
        db.commit()
        db.refresh(session)
        
        return session

    @staticmethod
    def list_sessions(db: Session, student_id: str) -> List[InterviewSession]:
        return db.query(InterviewSession).filter(InterviewSession.student_id == student_id).order_by(InterviewSession.started_at.desc()).all()

    @staticmethod
    def get_session(db: Session, student_id: str, session_id: int) -> Optional[InterviewSession]:
        return db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.student_id == student_id).first()

    @staticmethod
    def get_session_questions(db: Session, student_id: str, session_id: int) -> List[InterviewQuestion]:
        session = InterviewService.get_session(db, student_id, session_id)
        if not session:
            return []
        return session.questions

    @staticmethod
    async def submit_answer(db: Session, student_id: str, session_id: int, question_id: int, payload: InterviewResponseSubmit) -> InterviewResponse:
        session = InterviewService.get_session(db, student_id, session_id)
        if not session or session.status != "IN_PROGRESS":
            raise ValueError("Session not found or not active")
            
        question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id, InterviewQuestion.session_id == session_id).first()
        if not question:
            raise ValueError("Question not found in this session")
            
        existing = db.query(InterviewResponse).filter(InterviewResponse.question_id == question_id).first()
        if existing:
            raise ValueError("Question already answered")
            
        response_obj = InterviewResponse(
            question_id=question_id,
            answer=payload.answer,
            time_spent_seconds=payload.time_spent_seconds
        )
        db.add(response_obj)
        db.commit()
        db.refresh(response_obj)
        
        # Async AI evaluation
        evaluation = await InterviewAIService.evaluate_answer(
            question=question.question,
            category=question.category,
            expected_topics=question.expected_topics or [],
            answer=payload.answer,
            target_role=session.target_role or "General"
        )
        
        response_obj.score = evaluation.get("score")
        response_obj.feedback = evaluation.get("feedback")
        response_obj.strengths = evaluation.get("strengths")
        response_obj.weaknesses = evaluation.get("weaknesses")
        
        db.commit()
        db.refresh(response_obj)
        return response_obj

    @staticmethod
    async def complete_session(db: Session, student_id: str, session_id: int) -> InterviewSession:
        session = InterviewService.get_session(db, student_id, session_id)
        if not session or session.status != "IN_PROGRESS":
            raise ValueError("Session not found or not active")
            
        session.status = "COMPLETED"
        session.completed_at = datetime.utcnow()
        
        total_score = 0
        valid_responses = 0
        duration = 0
        responses_data = []
        
        for q in session.questions:
            if q.response:
                duration += q.response.time_spent_seconds
                if q.response.score is not None:
                    total_score += q.response.score
                    valid_responses += 1
                responses_data.append({
                    "question": q.question,
                    "answer": q.response.answer,
                    "score": q.response.score,
                    "feedback": q.response.feedback
                })
                
        session.duration_seconds = duration
        if valid_responses > 0:
            session.overall_score = total_score / valid_responses
        else:
            session.overall_score = None
            
        db.commit()
        
        if valid_responses > 0:
            summary = await InterviewAIService.generate_summary(session.target_role or "General", session.interview_type, responses_data)
            session.ai_summary = summary
            db.commit()
            db.refresh(session)
            
            # Update Readiness and Progress
            InterviewService.update_readiness(db, student_id)
            progress = db.query(CareerProgress).filter(CareerProgress.student_id == student_id, CareerProgress.module == "INTERVIEW").first()
            if not progress:
                progress = CareerProgress(student_id=student_id, module="INTERVIEW", total_items=1)
                db.add(progress)
            progress.completed_items = (progress.completed_items or 0) + 1
            progress.status = "COMPLETED"
            progress.last_activity = datetime.utcnow()
            db.commit()
        
        return session

    @staticmethod
    def get_analytics(db: Session, student_id: str) -> dict:
        sessions = db.query(InterviewSession).filter(
            InterviewSession.student_id == student_id, 
            InterviewSession.status == "COMPLETED"
        ).order_by(InterviewSession.started_at.asc()).all()
        
        total = len(sessions)
        if total == 0:
            return {
                "total_interviews": 0,
                "history": []
            }
            
        scores = [s.overall_score for s in sessions if s.overall_score is not None]
        avg_score = sum(scores) / len(scores) if scores else None
        best_score = max(scores) if scores else None
        
        category_scores = {
            "TECHNICAL": [],
            "COMMUNICATION": [],
            "BEHAVIORAL": [],
            "PROJECT": []
        }
        
        for s in sessions:
            for q in s.questions:
                if q.response and q.response.score is not None:
                    cat = q.category.upper()
                    if cat in category_scores:
                        category_scores[cat].append(q.response.score)
                        
        def get_avg(cat: str):
            scores_list = category_scores.get(cat, [])
            if not scores_list:
                return None
            return sum(scores_list) / len(scores_list)
        
        history = [
            {
                "id": s.id,
                "target_role": s.target_role,
                "interview_type": s.interview_type,
                "mode": s.mode,
                "status": s.status,
                "started_at": s.started_at,
                "completed_at": s.completed_at,
                "overall_score": s.overall_score,
                "duration_seconds": s.duration_seconds
            }
            for s in sessions
        ]
        
        return {
            "total_interviews": total,
            "average_score": avg_score,
            "best_score": best_score,
            "technical_average": get_avg("TECHNICAL"),
            "communication_average": get_avg("COMMUNICATION"),
            "behavioral_average": get_avg("BEHAVIORAL"),
            "project_average": get_avg("PROJECT"),
            "history": history
        }

    @staticmethod
    def update_readiness(db: Session, student_id: str):
        sessions = db.query(InterviewSession).filter(
            InterviewSession.student_id == student_id, 
            InterviewSession.status == "COMPLETED"
        ).all()
        
        scores = [s.overall_score for s in sessions if s.overall_score is not None]
        if scores:
            best_score = max(scores)
            CareerReadinessService.update_component(db, student_id, "INTERVIEW", best_score)
