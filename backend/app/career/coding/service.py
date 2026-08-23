from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from .models import CodingProblem, CodingTestCase, CodingSubmission, CodingProgress
from .schemas import RunCodeRequest, RunCodeResponse, SubmitCodeResponse
from .execution import get_execution_provider
from app.career.readiness.service import CareerReadinessService
from app.career.progress.models import CareerProgress
from app.ai.service import ai_service

class CodingService:
    @staticmethod
    def list_problems(db: Session, topic: Optional[str] = None, difficulty: Optional[str] = None) -> List[CodingProblem]:
        query = db.query(CodingProblem).filter(CodingProblem.is_active == True)
        if topic:
            query = query.filter(CodingProblem.topic == topic)
        if difficulty:
            query = query.filter(CodingProblem.difficulty == difficulty)
        return query.all()

    @staticmethod
    def get_problem_by_slug(db: Session, slug: str) -> CodingProblem:
        return db.query(CodingProblem).filter(CodingProblem.slug == slug).first()

    @staticmethod
    def get_progress(db: Session, student_id: str, problem_id: int) -> CodingProgress:
        return db.query(CodingProgress).filter(
            CodingProgress.student_id == student_id,
            CodingProgress.problem_id == problem_id
        ).first()

    @staticmethod
    def get_submissions(db: Session, student_id: str, problem_id: Optional[int] = None) -> List[CodingSubmission]:
        query = db.query(CodingSubmission).filter(CodingSubmission.student_id == student_id)
        if problem_id:
            query = query.filter(CodingSubmission.problem_id == problem_id)
        return query.order_by(CodingSubmission.submitted_at.desc()).all()

    @staticmethod
    def run_code(db: Session, slug: str, request: RunCodeRequest) -> RunCodeResponse:
        problem = CodingService.get_problem_by_slug(db, slug)
        if not problem: raise ValueError("Problem not found")

        # Run only on SAMPLE test cases
        samples = db.query(CodingTestCase).filter(
            CodingTestCase.problem_id == problem.id,
            CodingTestCase.is_sample == True
        ).all()

        tc_dicts = [{"input_data": t.input_data, "expected_output": t.expected_output, "is_hidden": False} for t in samples]

        provider = get_execution_provider()
        exec_result = provider.execute(request.language, request.source_code, tc_dicts)
        
        # Hydrate result with input/output for samples
        for idx, t in enumerate(samples):
            if idx < len(exec_result["results"]):
                exec_result["results"][idx]["input_data"] = t.input_data
                exec_result["results"][idx]["expected_output"] = t.expected_output

        return RunCodeResponse(**exec_result)

    @staticmethod
    async def submit_code(db: Session, student_id: str, slug: str, request: RunCodeRequest) -> SubmitCodeResponse:
        problem = CodingService.get_problem_by_slug(db, slug)
        if not problem: raise ValueError("Problem not found")

        # Run on ALL test cases
        all_tcs = db.query(CodingTestCase).filter(CodingTestCase.problem_id == problem.id).all()
        tc_dicts = [{"input_data": t.input_data, "expected_output": t.expected_output, "is_hidden": t.is_hidden} for t in all_tcs]

        provider = get_execution_provider()
        exec_result = provider.execute(request.language, request.source_code, tc_dicts)
        
        status = exec_result["status"]
        
        # Save Submission
        submission = CodingSubmission(
            student_id=student_id,
            problem_id=problem.id,
            language=request.language,
            source_code=request.source_code,
            status=status,
            runtime_ms=exec_result["runtime_ms"],
            memory_kb=exec_result["memory_kb"],
            test_cases_passed=exec_result["test_cases_passed"],
            total_test_cases=exec_result["total_test_cases"]
        )
        db.add(submission)
        
        # Update Problem Progress
        progress = CodingService.get_progress(db, student_id, problem.id)
        if not progress:
            progress = CodingProgress(student_id=student_id, problem_id=problem.id, status="ATTEMPTED", attempts=0)
            db.add(progress)
            
        progress.attempts = (progress.attempts or 0) + 1
        progress.last_attempted_at = datetime.utcnow()
        if status == "ACCEPTED":
            if progress.status != "SOLVED":
                progress.status = "SOLVED"
                progress.solved_at = datetime.utcnow()
            
            if not progress.best_runtime_ms or submission.runtime_ms < progress.best_runtime_ms:
                progress.best_runtime_ms = submission.runtime_ms

        db.commit()
        db.refresh(submission)

        # Update Career Progress
        CodingService._update_career_progress(db, student_id)

        ai_feedback = None
        # Generate AI hint if not accepted
        if status != "ACCEPTED":
            try:
                prompt = f"The student attempted a coding problem '{problem.title}' but got {status}. Provide a brief 1-2 sentence hint conceptually without writing code. Topic is {problem.topic}."
                ai_feedback = await ai_service.generate(prompt=prompt)
                submission.ai_feedback = ai_feedback
                db.commit()
            except Exception:
                pass
                
        return SubmitCodeResponse(
            submission_id=submission.id,
            status=status,
            test_cases_passed=submission.test_cases_passed,
            total_test_cases=submission.total_test_cases,
            runtime_ms=submission.runtime_ms,
            memory_kb=submission.memory_kb,
            ai_feedback=ai_feedback
        )

    @staticmethod
    def _update_career_progress(db: Session, student_id: str):
        total_problems = db.query(func.count(CodingProblem.id)).filter(CodingProblem.is_active == True).scalar()
        solved_problems = db.query(func.count(CodingProgress.id)).filter(
            CodingProgress.student_id == student_id,
            CodingProgress.status == "SOLVED"
        ).scalar()
        
        # Global module progress
        progress = db.query(CareerProgress).filter(CareerProgress.student_id == student_id, CareerProgress.module == "CODING").first()
        if not progress:
            progress = CareerProgress(student_id=student_id, module="CODING", total_items=total_problems)
            db.add(progress)
            
        progress.completed_items = solved_problems
        progress.total_items = max(total_problems, 1)
        progress.progress_percentage = (solved_problems / progress.total_items) * 100
        
        if progress.progress_percentage > 0: progress.status = "IN_PROGRESS"
        if progress.progress_percentage >= 100: progress.status = "COMPLETED"
        
        db.commit()

        # Update Readiness directly based on coding percentage
        CareerReadinessService.update_component(db, student_id, "CODING", progress.progress_percentage)
