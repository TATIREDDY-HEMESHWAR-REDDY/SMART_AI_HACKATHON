from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class AssessmentQuestionOption(BaseModel):
    id: str
    text: str

class AssessmentQuestionPublic(BaseModel):
    id: int
    question_text: str
    topic: str
    difficulty: str
    marks: float
    negative_marks: float
    options: List[AssessmentQuestionOption]
    
    model_config = ConfigDict(from_attributes=True)

class AssessmentQuestionWithAnswer(AssessmentQuestionPublic):
    explanation: Optional[str] = None
    correct_option_id: str

class AssessmentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: str
    topic: Optional[str]
    difficulty: str
    duration_minutes: int
    total_questions: int
    passing_score: float
    
    model_config = ConfigDict(from_attributes=True)

class AssessmentAttemptAnswerResponse(BaseModel):
    question_id: int
    selected_option_id: Optional[str]
    is_answered: bool
    marked_for_review: bool
    
    model_config = ConfigDict(from_attributes=True)

class AssessmentAttemptResponse(BaseModel):
    id: int
    assessment_id: int
    status: str
    current_question_index: int
    started_at: Optional[datetime]
    time_remaining_seconds: Optional[int] = None
    
    answers: List[AssessmentAttemptAnswerResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class AssessmentResultResponse(BaseModel):
    id: int
    assessment_id: int
    status: str
    score: Optional[float]
    percentage: Optional[float]
    correct_answers: int
    incorrect_answers: int
    unanswered: int
    time_spent_seconds: int
    ai_insight: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)

class AnswerUpdate(BaseModel):
    question_id: int
    selected_option_id: Optional[str]
    is_answered: bool
    marked_for_review: bool
    time_spent_seconds: int = 0
