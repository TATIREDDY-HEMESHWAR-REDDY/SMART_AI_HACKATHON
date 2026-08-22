import httpx
from typing import Optional
from app.core.config import settings
from .base import BaseStudentProvider, StudentContext

class ERPStudentProvider(BaseStudentProvider):
    async def get_student(self, student_id: str) -> Optional[StudentContext]:
        # Would fetch from ERP API using service account or internal networking
        pass
        
    async def get_current_student(self, token: str) -> Optional[StudentContext]:
        # Fetches from the actual ERP using the user's token
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.ERP_API_URL}/students/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    return StudentContext(**response.json())
            except Exception:
                pass
        return None
