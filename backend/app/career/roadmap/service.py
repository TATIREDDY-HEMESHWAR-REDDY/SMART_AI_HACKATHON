
from app.career.roadmap.context_service import gather_student_context
from app.career.roadmap.ai_service import RoadmapAIService
from app.career.roadmap.schemas import CoachResponse, TaskCategory, TaskPriority, TaskSource, RoadmapTaskCreate
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.career.roadmap.models import CareerGoal, RoadmapTask
from app.career.roadmap.schemas import CareerGoalCreate, CareerGoalUpdate, RoadmapTaskUpdate, TaskStatus
from app.career.roadmap.rules import RoadmapRuleEngine
from app.career.readiness.models import CareerReadinessScore

class RoadmapService:
    @staticmethod
    def create_goal(db: Session, student_id: str, payload: CareerGoalCreate) -> CareerGoal:
        # Complete/Abandon existing active goals
        active_goals = db.query(CareerGoal).filter(
            CareerGoal.student_id == student_id,
            CareerGoal.status == "ACTIVE"
        ).all()
        for goal in active_goals:
            goal.status = "ABANDONED"
            goal.updated_at = datetime.utcnow()
        
        new_goal = CareerGoal(
            student_id=student_id,
            title=payload.title,
            target_role=payload.target_role,
            target_date=payload.target_date,
            status="ACTIVE"
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return new_goal

    @staticmethod
    def get_active_goal(db: Session, student_id: str) -> Optional[CareerGoal]:
        return db.query(CareerGoal).filter(
            CareerGoal.student_id == student_id,
            CareerGoal.status == "ACTIVE"
        ).order_by(desc(CareerGoal.created_at)).first()

    @staticmethod
    def update_goal(db: Session, student_id: str, goal_id: int, payload: CareerGoalUpdate) -> Optional[CareerGoal]:
        goal = db.query(CareerGoal).filter(
            CareerGoal.student_id == student_id,
            CareerGoal.id == goal_id
        ).first()
        
        if not goal:
            return None
            
        update_data = payload.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(goal, key, value)
            
        goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(goal)
        return goal


    @staticmethod
    async def chat_with_coach(db: Session, student_id: str, message: str) -> CoachResponse:
        context = gather_student_context(db, student_id)
        return await RoadmapAIService.chat_with_coach(context, message)

    @staticmethod
    async def generate_roadmap(db: Session, student_id: str) -> List[RoadmapTask]:
        generated_tasks = RoadmapRuleEngine.generate_deterministic_tasks(db, student_id)
        
        # Phase 9B: AI Enrichment
        context = gather_student_context(db, student_id)
        ai_tasks_data = await RoadmapAIService.generate_roadmap_tasks(context)
        
        for ai_task in ai_tasks_data:
            try:
                # Validate enum manually
                category = TaskCategory(ai_task.category.upper())
                priority = TaskPriority(ai_task.priority.upper())
                
                generated_tasks.append(RoadmapTaskCreate(
                    title=ai_task.title,
                    description=ai_task.description + f"\n\nReason: {ai_task.reason}",
                    category=category,
                    priority=priority,
                    source=TaskSource.AI
                ))
            except ValueError:
                # Invalid category or priority, drop it safely
                continue
                
        # Deduplication: Get existing PENDING tasks
        pending_tasks = db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id,
            RoadmapTask.status == "PENDING"
        ).all()
        
        existing_signatures = {(t.title, t.category) for t in pending_tasks}
        
        new_db_tasks = []
        for task_create in generated_tasks:
            signature = (task_create.title, task_create.category.value)
            if signature not in existing_signatures:
                db_task = RoadmapTask(
                    student_id=student_id,
                    title=task_create.title,
                    description=task_create.description,
                    category=task_create.category.value,
                    priority=task_create.priority.value,
                    source=task_create.source.value,
                    status="PENDING",
                    reference_type=task_create.reference_type,
                    reference_id=task_create.reference_id,
                    due_date=task_create.due_date
                )
                db.add(db_task)
                new_db_tasks.append(db_task)
                existing_signatures.add(signature)
        
        if new_db_tasks:
            db.commit()
            
        return db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id,
            RoadmapTask.status == "PENDING"
        ).all()
    @staticmethod
    def get_roadmap(db: Session, student_id: str) -> dict:
        goal = RoadmapService.get_active_goal(db, student_id)
        
        tasks = db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id,
            RoadmapTask.status == "PENDING"
        ).order_by(RoadmapTask.created_at).all()
        
        completed_tasks = db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id,
            RoadmapTask.status == "COMPLETED"
        ).count()
        
        readiness = db.query(CareerReadinessScore).filter(
            CareerReadinessScore.student_id == student_id
        ).order_by(desc(CareerReadinessScore.created_at)).first()
        
        readiness_dict = {}
        if readiness:
            readiness_dict = {
                "overall_score": readiness.overall_score,
                "coding_score": readiness.coding_score,
                "aptitude_score": readiness.aptitude_score,
                "technical_score": readiness.technical_score,
                "communication_score": readiness.communication_score,
                "interview_score": readiness.interview_score,
                "resume_score": readiness.resume_score,
                "projects_score": readiness.projects_score
            }
            
        high_priority = [t for t in tasks if t.priority == "HIGH"]
        
        total_tasks = len(tasks) + completed_tasks
        progress_percentage = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
        
        return {
            "goal": goal,
            "readiness": readiness_dict if readiness_dict else None,
            "tasks": tasks,
            "high_priority_tasks": high_priority,
            "completed_tasks": completed_tasks,
            "progress_percentage": progress_percentage,
            "career_gaps": [] # Can be hydrated later
        }

    @staticmethod
    def update_task(db: Session, student_id: str, task_id: int, payload: RoadmapTaskUpdate) -> Optional[RoadmapTask]:
        task = db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id,
            RoadmapTask.id == task_id
        ).first()
        
        if not task:
            return None
            
        task.status = payload.status.value
        if payload.status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()
            
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def get_tasks(db: Session, student_id: str) -> List[RoadmapTask]:
        return db.query(RoadmapTask).filter(
            RoadmapTask.student_id == student_id
        ).order_by(desc(RoadmapTask.created_at)).all()
