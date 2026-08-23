from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Pydantic Models for Coding ---

class CodingTestCasePublic(BaseModel):
    id: int
    input_data: str
    expected_output: str
    is_sample: bool
    explanation: Optional[str] = None
    
    class Config:
        from_attributes = True

class CodingProblemBase(BaseModel):
    title: str
    slug: str
    description: str
    difficulty: str
    topic: str
    constraints: Optional[List[str]] = None
    hints: Optional[List[str]] = None
    starter_code: Dict[str, str]

class CodingProblemPublic(CodingProblemBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class CodingProblemDetail(CodingProblemPublic):
    sample_test_cases: List[CodingTestCasePublic]

    class Config:
        from_attributes = True

# Submissions

class RunCodeRequest(BaseModel):
    language: str
    source_code: str

class TestCaseResult(BaseModel):
    status: str # ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIME_LIMIT
    input_data: Optional[str] = None # Hidden for non-sample
    expected_output: Optional[str] = None # Hidden for non-sample
    actual_output: Optional[str] = None # Hidden for non-sample if not sample (or maybe just show limited?)
    runtime_ms: int
    is_hidden: bool = True

class RunCodeResponse(BaseModel):
    status: str # Overall: ACCEPTED, WRONG_ANSWER, etc.
    test_cases_passed: int
    total_test_cases: int
    results: List[TestCaseResult]
    runtime_ms: int
    memory_kb: int

class SubmitCodeResponse(BaseModel):
    submission_id: int
    status: str
    test_cases_passed: int
    total_test_cases: int
    runtime_ms: int
    memory_kb: int
    ai_feedback: Optional[str] = None

class SubmissionHistoryItem(BaseModel):
    id: int
    problem_id: int
    language: str
    status: str
    test_cases_passed: int
    total_test_cases: int
    runtime_ms: Optional[int]
    memory_kb: Optional[int]
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class CodingProgressResponse(BaseModel):
    status: str # NOT_STARTED, ATTEMPTED, SOLVED
    attempts: int
    best_runtime_ms: Optional[int]
    
    class Config:
        from_attributes = True
