from typing import Optional
from .base import BaseStudentProvider, StudentContext

class MockStudentProvider(BaseStudentProvider):
    async def get_student(self, student_id: str) -> Optional[StudentContext]:
        # Return a mock student for standalone development
        return StudentContext(
            id=student_id,
            name="Sameer (Mock)",
            email="sameer@demo.com",
            department={"id": 1, "name": "Computer Science"},
            year=3,
            semester=6,
            section="A",
            cgpa=8.4
        )
        
    async def get_current_student(self, token: str) -> Optional[StudentContext]:
        # In mock mode, we might decode a dummy token or just return a default student
        return await self.get_student("STU10045")
