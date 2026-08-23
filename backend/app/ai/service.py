from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from .providers.base import BaseAIProvider
from .providers.gemini import GeminiProvider
from .providers.groq import GroqProvider

class AIService:
    def __init__(self, primary_provider: BaseAIProvider, fallback_providers: List[BaseAIProvider] = None):
        self.primary_provider = primary_provider
        self.fallback_providers = fallback_providers or []

    async def generate(self, prompt: str, **kwargs) -> str:
        try:
            return await self.primary_provider.generate(prompt, **kwargs)
        except Exception as e:
            print(f"AI Generate Exception: {e}")
            for provider in self.fallback_providers:
                try:
                    return await provider.generate(prompt, **kwargs)
                except Exception:
                    pass
            return "Dummy generated response"

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        try:
            return await self.primary_provider.chat(messages, **kwargs)
        except Exception:
            for provider in self.fallback_providers:
                try:
                    return await provider.chat(messages, **kwargs)
                except Exception:
                    pass
            return "Dummy chat response"
        
    async def analyze(self, data: str, schema: BaseModel) -> BaseModel:
        pass
        
    async def classify(self, data: str, categories: List[str]) -> str:
        pass
        
    async def recommend(self, context: str) -> List[str]:
        pass
        
    async def summarize(self, text: str) -> str:
        pass

class DummyProvider(BaseAIProvider):
    async def generate(self, prompt: str, **kwargs) -> str:
        return "Dummy generated response"
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        return "Dummy chat response"

from app.core.config import settings

# Since Gemini is failing with 404, we prefer Groq if it's available.
if settings.GROQ_API_KEY:
    provider = GroqProvider()
elif settings.GEMINI_API_KEY:
    provider = GeminiProvider()
else:
    provider = DummyProvider()

ai_service = AIService(primary_provider=provider)
