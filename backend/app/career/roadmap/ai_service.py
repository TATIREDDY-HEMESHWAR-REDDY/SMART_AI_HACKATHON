import json
from pydantic import BaseModel, Field
from typing import List
from app.ai.service import ai_service
from app.career.roadmap.schemas import CoachResponse, AIRoadmapTask
import traceback

class AIRoadmapTaskSchema(BaseModel):
    tasks: List[AIRoadmapTask]

class RoadmapAIService:
    @staticmethod
    async def generate_roadmap_tasks(context: dict) -> List[AIRoadmapTask]:
        prompt = f"""
You are the Career OS AI Roadmap Generator. 
Based on the student's context, generate up to 3 HIGHly targeted actionable tasks to improve their career readiness.
Do not fabricate scores or achievements. Focus on the actual skill gaps and readiness weaknesses provided below.
If there is not enough data, return an empty list of tasks.

Student Context:
{json.dumps(context, indent=2)}

Rules for tasks:
1. Category must be one of: CODING, APTITUDE, TECHNICAL, COMMUNICATION, INTERVIEW, RESUME, PROJECTS, JOBS, GENERAL
2. Priority must be HIGH, MEDIUM, or LOW
3. Include a reason explaining why the task was generated based on the context.

Output ONLY a valid JSON object exactly matching this structure:
{{
    "tasks": [
        {{
            "title": "string",
            "description": "string",
            "category": "string",
            "priority": "string",
            "reason": "string"
        }}
    ]
}}
"""
        try:
            response = await ai_service.generate(prompt)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = response[start:end]
            else:
                json_str = response
                
            data = json.loads(json_str)
            schema_data = AIRoadmapTaskSchema(**data)
            return schema_data.tasks
        except Exception as e:
            print(f"AI Roadmap Enrichment Failed: {e}")
            return []

    @staticmethod
    async def chat_with_coach(context: dict, message: str) -> CoachResponse:
        prompt = f"""
You are the Career OS Coach. You are not a generic career chatbot.
Only make recommendations grounded in the supplied Career OS context.
Never invent scores, skills, interview results, jobs, or achievements.
If the supplied context does not contain enough information to answer definitively, explicitly say so.
Prioritize the student's target role and actual skill gaps.
Explain the reasoning behind recommendations.

Student Context:
{json.dumps(context, indent=2)}

User Question:
"{message}"

Output ONLY a valid JSON object exactly matching this structure:
{{
    "answer": "string",
    "key_points": ["string"],
    "recommended_actions": ["string"],
    "referenced_gaps": ["string"],
    "confidence": 95
}}
"""
        try:
            response = await ai_service.generate(prompt)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = response[start:end]
            else:
                json_str = response
                
            data = json.loads(json_str)
            return CoachResponse(**data)
        except Exception as e:
            print(f"AI Coach Chat Failed: {e}")
            return CoachResponse(
                answer="I'm currently unable to process your request. Please try again later or focus on completing your baseline assessments.",
                key_points=["AI service is temporarily unavailable"],
                recommended_actions=["Complete pending roadmap tasks"],
                referenced_gaps=[],
                confidence=0
            )
