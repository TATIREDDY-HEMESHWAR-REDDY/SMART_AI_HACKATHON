import os
import httpx
from typing import List, Dict
from .base import BaseAIProvider
from app.core.config import settings

class GroqProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "openai/gpt-oss-120b"

    async def generate(self, prompt: str, **kwargs) -> str:
        if not self.api_key:
            return "Dummy generated response"
            
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.url,
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError):
                return "Dummy generated response"

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        if not self.api_key:
            return "Dummy chat response"
            
        payload = {
            "model": self.model,
            "messages": messages
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.url,
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError):
                return "Dummy chat response"
