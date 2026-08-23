import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError
from app.ai.service import ai_service
from .fallback_questions import get_fallback_questions

class AIQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    expected_topics: List[str] = []

class AIQuestionList(BaseModel):
    questions: List[AIQuestion]

class AIEvaluation(BaseModel):
    score: float = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list, max_length=3)
    weaknesses: List[str] = Field(default_factory=list, max_length=3)
    feedback: str
    improvement: str

class AISummary(BaseModel):
    overall_summary: str
    strengths: List[str] = Field(default_factory=list, max_length=3)
    weaknesses: List[str] = Field(default_factory=list, max_length=3)
    critical_improvements: List[str] = Field(default_factory=list, max_length=2)
    recommended_topics: List[str] = Field(default_factory=list, max_length=3)
    recommended_practice: List[str] = Field(default_factory=list, max_length=2)

class InterviewAIService:
    @staticmethod
    async def generate_questions(context: dict, num_questions: int, interview_type: str) -> List[Dict[str, Any]]:
        prompt = f"""
        Generate {num_questions} mock interview questions for an interview of type: {interview_type}.
        Student Context:
        Target Role: {context.get('target_role', 'Unknown')}
        Top Skills: {', '.join(context.get('skills', []))}
        Projects: {', '.join(context.get('projects', []))}
        
        Return ONLY a JSON object with a single key "questions" containing an array of objects.
        Each object MUST have:
        - "question": string
        - "category": string (e.g. TECHNICAL, BEHAVIORAL, PROJECT, HR)
        - "difficulty": string (EASY, MEDIUM, HARD)
        - "expected_topics": list of strings
        """
        
        try:
            response = await ai_service.generate(prompt=prompt)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                data = json.loads(response[start:end])
                validated_data = AIQuestionList(**data)
                questions = [q.model_dump() for q in validated_data.questions]
                
                if len(questions) == num_questions:
                    return questions
                elif len(questions) > 0:
                    needed = num_questions - len(questions)
                    fallbacks = get_fallback_questions(interview_type, needed)
                    return questions + fallbacks
        except (Exception, ValidationError):
            pass
            
        return get_fallback_questions(interview_type, num_questions)

    @staticmethod
    async def evaluate_answer(question: str, category: str, expected_topics: List[str], answer: str, target_role: str) -> dict:
        prompt = f"""
        Evaluate the following interview answer for a candidate targeting {target_role}.
        Question ({category}): {question}
        Expected Topics: {', '.join(expected_topics) if expected_topics else 'N/A'}
        Candidate Answer: {answer}
        
        Return ONLY a JSON object with these exact keys:
        - "score": integer between 0 and 100
        - "strengths": list of short strings (up to 3)
        - "weaknesses": list of short strings (up to 3)
        - "feedback": detailed constructive feedback (1-2 sentences)
        - "improvement": actionable advice for improvement (1-2 sentences)
        """
        
        try:
            response = await ai_service.generate(prompt=prompt)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                data = json.loads(response[start:end])
                validated = AIEvaluation(**data)
                return validated.model_dump()
        except (Exception, ValidationError):
            pass
            
        # Fallback if evaluation fails
        return {
            "score": None,
            "strengths": ["Answer saved successfully"],
            "weaknesses": ["AI evaluation unavailable"],
            "feedback": "AI evaluation temporarily unavailable. Your answer has been saved.",
            "improvement": "N/A"
        }

    @staticmethod
    async def generate_summary(target_role: str, interview_type: str, responses_data: List[dict]) -> dict:
        if not responses_data:
            return {}
            
        prompt = f"""
        Generate a final interview summary based on the candidate's performance.
        Target Role: {target_role}
        Interview Type: {interview_type}
        
        Session Data:
        {json.dumps(responses_data)}
        
        Return ONLY a JSON object with these exact keys:
        - "overall_summary": short string summarizing performance
        - "strengths": list of top 3 strengths
        - "weaknesses": list of top 3 weaknesses
        - "critical_improvements": list of 2 actionable improvements
        - "recommended_topics": list of 3 topics to study
        - "recommended_practice": list of 2 practice suggestions
        """
        
        try:
            response = await ai_service.generate(prompt=prompt)
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != -1:
                data = json.loads(response[start:end])
                validated = AISummary(**data)
                return validated.model_dump()
        except (Exception, ValidationError):
            pass
            
        return {
            "overall_summary": "AI Summary unavailable due to generation error.",
            "strengths": ["Data saved"],
            "weaknesses": ["AI Generation Failed"],
            "critical_improvements": ["Review your answers manually."],
            "recommended_topics": [],
            "recommended_practice": []
        }
