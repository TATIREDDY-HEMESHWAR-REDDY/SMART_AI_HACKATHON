import re
import httpx
from typing import List, Dict
from .base import BaseAIProvider
from app.core.config import settings

def _clean(text: str) -> str:
    text = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = text.replace('```', '').strip()
    return text

class GroqProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "qwen/qwen3.6-27b"

    async def generate(self, prompt: str, json_mode: bool = True, **kwargs) -> str:
        if not self.api_key:
            return "Dummy generated response"

        messages = [{"role": "user", "content": prompt}]
        if json_mode:
            messages.insert(0, {"role": "system", "content": "Respond with valid JSON only. No markdown fences, no explanations. Output must start with {."})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 3000,
            "reasoning_effort": "none"
        }

        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                self.url,
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            try:
                return _clean(data["choices"][0]["message"]["content"])
            except (KeyError, IndexError):
                return "Dummy generated response"

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        if not self.api_key:
            return "Dummy chat response"

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 3000,
            "reasoning_effort": "none"
        }

        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                self.url,
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            try:
                return _clean(data["choices"][0]["message"]["content"])
            except (KeyError, IndexError):
                return "Dummy chat response"
