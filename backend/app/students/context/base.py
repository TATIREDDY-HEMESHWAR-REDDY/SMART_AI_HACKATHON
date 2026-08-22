from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class StudentContext(BaseModel):
    id: str
    name: str
    email: str
    department: Optional[Dict[str, Any]] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    cgpa: Optional[float] = None
    profile_picture: Optional[str] = None

class BaseStudentProvider(ABC):
    @abstractmethod
    async def get_student(self, student_id: str) -> Optional[StudentContext]:
        pass
    
    @abstractmethod
    async def get_current_student(self, token: str) -> Optional[StudentContext]:
        pass
