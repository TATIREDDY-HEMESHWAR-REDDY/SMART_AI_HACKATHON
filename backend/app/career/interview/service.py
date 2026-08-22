from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .models import InterviewSession, InterviewQuestion, InterviewResponse
from .schemas import CreateInterview, InterviewResponseSubmit
from .fallback_questions import get_fallback_questions

class InterviewService:
    
    @staticmethod
    def create_session(db: Session, student_id: str, setup: CreateInterview) -> InterviewSession:
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
        
        # In Phase 7A we ONLY use fallback questions
        generated = get_fallback_questions(setup.interview_type, setup.num_questions)
        
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
    def submit_answer(db: Session, student_id: str, session_id: int, question_id: int, payload: InterviewResponseSubmit) -> InterviewResponse:
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
        
        # Phase 7A: No AI evaluation yet, so score and feedback remain NULL
        
        return response_obj

    @staticmethod
    def complete_session(db: Session, student_id: str, session_id: int) -> InterviewSession:
        session = InterviewService.get_session(db, student_id, session_id)
        if not session or session.status != "IN_PROGRESS":
            raise ValueError("Session not found or not active")
            
        session.status = "COMPLETED"
        session.completed_at = datetime.utcnow()
        
        duration = 0
        for q in session.questions:
            if q.response:
                duration += q.response.time_spent_seconds
                
        session.duration_seconds = duration
        
        db.commit()
        db.refresh(session)
        
        return session
