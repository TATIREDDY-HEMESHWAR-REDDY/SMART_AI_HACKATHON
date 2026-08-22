from app.core.config import settings
from .base import BaseStudentProvider
from .mock import MockStudentProvider
from .erp import ERPStudentProvider

def get_student_provider() -> BaseStudentProvider:
    if settings.STUDENT_CONTEXT_MODE.lower() == "erp":
        return ERPStudentProvider()
    return MockStudentProvider()

student_context_service = get_student_provider()
