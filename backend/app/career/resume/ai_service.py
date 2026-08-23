import json
from app.ai.service import ai_service
from app.career.resume.models import Resume

class ResumeAnalysisService:
    @staticmethod
    async def analyze_resume(resume: Resume) -> dict:
        # Construct a safe text representation of the resume
        resume_text = f"Name: {resume.full_name}\n"
        resume_text += f"Summary: {resume.summary}\n\n"
        
        resume_text += "Education:\n"
        for edu in resume.educations:
            resume_text += f"- {edu.degree} at {edu.institution}\n"
            
        resume_text += "\nExperience:\n"
        for exp in resume.experiences:
            resume_text += f"- {exp.role} at {exp.company}\n"
            if exp.description: resume_text += f"  {exp.description}\n"
            
        resume_text += "\nProjects:\n"
        for proj in resume.projects:
            resume_text += f"- {proj.name}\n"
            if proj.description: resume_text += f"  {proj.description}\n"
            
        resume_text += "\nSkills: " + ", ".join([s.name for s in resume.skills])
        
        prompt = f"""
        Analyze this resume data. Return ONLY a JSON object with these exact keys:
        - "strengths": list of 3 short strings
        - "weaknesses": list of 3 short strings
        - "missing_information": list of 2 short strings identifying what's missing
        - "actionable_improvements": list of 3 actionable advice strings
        
        Resume Data:
        {resume_text}
        """
        
        try:
            ai_response = await ai_service.generate(prompt=prompt)
            # Find the JSON part
            start = ai_response.find('{')
            end = ai_response.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(ai_response[start:end])
        except Exception:
            pass
            
        return {
            "strengths": ["AI Analysis unavailable"],
            "weaknesses": ["AI Analysis unavailable"],
            "missing_information": ["AI Analysis unavailable"],
            "actionable_improvements": ["Please try again later"]
        }

    @staticmethod
    async def match_job(resume: Resume, job_description: str) -> dict:
        resume_text = f"Skills: {', '.join([s.name for s in resume.skills])}\n"
        
        prompt = f"""
        Compare the resume skills with the job description.
        Return ONLY a JSON object with these exact keys:
        - "job_match_score": float between 0 and 100
        - "missing_skills": list of up to 5 strings
        - "missing_keywords": list of up to 5 strings
        
        Resume Skills: {resume_text}
        
        Job Description:
        {job_description}
        """
        
        try:
            ai_response = await ai_service.generate(prompt=prompt)
            start = ai_response.find('{')
            end = ai_response.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(ai_response[start:end])
        except Exception:
            pass
            
        return {
            "job_match_score": 0.0,
            "missing_skills": ["Analysis failed"],
            "missing_keywords": ["Analysis failed"]
        }
