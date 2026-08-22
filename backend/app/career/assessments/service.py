from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json
from typing import List, Optional

from .models import Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer
from .schemas import AnswerUpdate, AssessmentResultResponse, AssessmentAttemptResponse
from app.ai.service import ai_service
from app.career.readiness.service import CareerReadinessService
from app.career.progress.models import CareerProgress

class AssessmentService:
    @staticmethod
    def list_assessments(db: Session, category: Optional[str] = None) -> List[Assessment]:
        query = db.query(Assessment).filter(Assessment.is_active == True)
        if category:
            query = query.filter(Assessment.category == category)
        return query.all()

    @staticmethod
    def get_assessment(db: Session, assessment_id: int) -> Assessment:
        return db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
    @staticmethod
    def get_questions(db: Session, assessment_id: int) -> List[AssessmentQuestion]:
        return db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == assessment_id).all()

    @staticmethod
    def start_or_resume_attempt(db: Session, student_id: str, assessment_id: int) -> AssessmentAttempt:
        attempt = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.student_id == student_id,
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.status == "IN_PROGRESS"
        ).first()
        
        if attempt:
            # If time is already up on resume, auto-submit
            if AssessmentService.calculate_time_remaining(attempt, attempt.assessment.duration_minutes) <= 0:
                AssessmentService.force_submit(db, attempt.id)
                return db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt.id).first()
            return attempt
            
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError("Assessment not found")
            
        attempt = AssessmentAttempt(
            student_id=student_id,
            assessment_id=assessment_id,
            status="IN_PROGRESS",
            started_at=datetime.utcnow(),
            last_saved_at=datetime.utcnow()
        )
        db.add(attempt)
        db.flush()
        
        questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == assessment_id).all()
        for q in questions:
            ans = AssessmentAnswer(attempt_id=attempt.id, question_id=q.id)
            db.add(ans)
            
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def get_attempt(db: Session, attempt_id: int, student_id: str) -> AssessmentAttempt:
        return db.query(AssessmentAttempt).filter(
            AssessmentAttempt.id == attempt_id, 
            AssessmentAttempt.student_id == student_id
        ).first()

    @staticmethod
    def calculate_time_remaining(attempt: AssessmentAttempt, duration_minutes: int) -> int:
        if not attempt.started_at:
            return duration_minutes * 60
        
        elapsed = (datetime.utcnow() - attempt.started_at).total_seconds()
        remaining = (duration_minutes * 60) - int(elapsed)
        return max(0, remaining)

    @staticmethod
    def save_answer(db: Session, attempt_id: int, student_id: str, data: AnswerUpdate) -> AssessmentAnswer:
        attempt = AssessmentService.get_attempt(db, attempt_id, student_id)
        if not attempt or attempt.status != "IN_PROGRESS":
            raise ValueError("Invalid or completed attempt")
            
        # Enforce server-side timer
        time_rem = AssessmentService.calculate_time_remaining(attempt, attempt.assessment.duration_minutes)
        if time_rem <= 0:
            AssessmentService.force_submit(db, attempt.id)
            raise ValueError("Assessment time expired")
            
        answer = db.query(AssessmentAnswer).filter(
            AssessmentAnswer.attempt_id == attempt_id,
            AssessmentAnswer.question_id == data.question_id
        ).first()
        
        if answer:
            answer.selected_option_id = data.selected_option_id
            answer.is_answered = data.is_answered
            answer.marked_for_review = data.marked_for_review
            answer.time_spent_seconds += data.time_spent_seconds
            
            attempt.last_saved_at = datetime.utcnow()
            db.commit()
            db.refresh(answer)
        return answer

    @staticmethod
    def force_submit(db: Session, attempt_id: int):
        attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
        if not attempt or attempt.status == "SUBMITTED": return
        import asyncio
        loop = asyncio.get_event_loop()
        # For a sync context, we just submit without AI, or handle it carefully.
        # But this is inside an async router eventually. 
        attempt.status = "SUBMITTED"
        db.commit()
        
    @staticmethod
    async def submit_attempt(db: Session, attempt_id: int, student_id: str) -> AssessmentResultResponse:
        attempt = AssessmentService.get_attempt(db, attempt_id, student_id)
        if not attempt or attempt.status == "SUBMITTED":
            raise ValueError("Invalid or already submitted attempt")
            
        assessment = attempt.assessment
        questions = {q.id: q for q in assessment.questions}
        
        correct = 0
        incorrect = 0
        unanswered = 0
        score = 0.0
        total_time = 0
        
        for ans in attempt.answers:
            q = questions.get(ans.question_id)
            if not q: continue
            
            total_time += ans.time_spent_seconds
            
            if not ans.is_answered or not ans.selected_option_id:
                unanswered += 1
            elif ans.selected_option_id == q.correct_option_id:
                correct += 1
                score += q.marks
            else:
                incorrect += 1
                score -= q.negative_marks
                
        attempt.status = "SUBMITTED"
        attempt.submitted_at = datetime.utcnow()
        attempt.correct_answers = correct
        attempt.incorrect_answers = incorrect
        attempt.unanswered = unanswered
        attempt.score = score
        
        max_possible_score = sum(q.marks for q in assessment.questions)
        attempt.percentage = (score / max_possible_score * 100) if max_possible_score > 0 else 0
        attempt.time_spent_seconds = total_time
        
        # Async AI analysis - handles failure gracefully without preventing commit
        try:
            prompt = f"Analyze this student's assessment performance. They scored {attempt.percentage}% ({correct} correct, {incorrect} incorrect, {unanswered} unanswered). Provide a brief encouraging summary and 2 actionable recommendations based on these stats."
            insight = await ai_service.generate(prompt=prompt)
            attempt.ai_insight = insight
        except Exception:
            attempt.ai_insight = "Keep practicing to improve your score!"

        db.commit()
        
        # Update Readiness properly using weighted service
        CareerReadinessService.update_component(db, student_id, assessment.category, attempt.percentage)
            
        db.refresh(attempt)
        
        return attempt

    @staticmethod
    def update_progress(db: Session, student_id: str, category: str):
        progress = db.query(CareerProgress).filter(CareerProgress.student_id == student_id, CareerProgress.module == category).first()
        if not progress:
            progress = CareerProgress(student_id=student_id, module=category, total_items=10)
            db.add(progress)
            
        completed = db.query(func.count(AssessmentAttempt.id)).join(Assessment).filter(
            AssessmentAttempt.student_id == student_id,
            AssessmentAttempt.status == "SUBMITTED",
            Assessment.category == category
        ).scalar()
        
        progress.completed_items = completed
        progress.progress_percentage = (completed / progress.total_items) * 100 if progress.total_items > 0 else 0
        if progress.progress_percentage > 0:
            progress.status = "IN_PROGRESS"
        if progress.progress_percentage >= 100:
            progress.status = "COMPLETED"
            
        db.commit()
