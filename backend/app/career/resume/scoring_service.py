import json
from app.career.resume.models import Resume

class ResumeScoringService:
    @staticmethod
    def calculate_score(resume: Resume) -> dict:
        score = {
            "overall_score": 0.0,
            "ats_score": 0.0,
            "content_quality": 0.0,
            "skills_strength": 0.0,
            "experience_quality": 0.0,
            "project_quality": 0.0,
            "education_completeness": 0.0,
            "formatting_score": 100.0 # Assumed 100 since we use a structured builder
        }

        # ATS Base Score (Contact info & Summary)
        ats_points = 0
        if resume.full_name: ats_points += 20
        if resume.email: ats_points += 20
        if resume.phone: ats_points += 20
        if resume.linkedin or resume.github: ats_points += 20
        if resume.summary and len(resume.summary) > 50: ats_points += 20
        score["ats_score"] = min(100.0, ats_points)
        
        # Education
        edu_points = 0
        if resume.educations:
            edu_points += 40
            for edu in resume.educations:
                if edu.institution and edu.degree: edu_points += 30
        score["education_completeness"] = min(100.0, edu_points)
        
        # Experience
        exp_points = 0
        if resume.experiences:
            exp_points += 30
            for exp in resume.experiences:
                if exp.company and exp.role: exp_points += 20
                if exp.description and len(exp.description) > 30: exp_points += 30
                if exp.achievements and len(exp.achievements) > 0: exp_points += 20
        score["experience_quality"] = min(100.0, exp_points)
        
        # Projects
        proj_points = 0
        if resume.projects:
            proj_points += 40
            for proj in resume.projects:
                if proj.name and proj.description: proj_points += 30
                if proj.technologies and len(proj.technologies) > 0: proj_points += 30
        score["project_quality"] = min(100.0, proj_points)
        
        # Skills
        skill_points = 0
        if resume.skills:
            if len(resume.skills) > 5: skill_points += 50
            if len(resume.skills) > 10: skill_points += 50
        score["skills_strength"] = min(100.0, skill_points)
        
        # Content Quality Average
        score["content_quality"] = (score["education_completeness"] + score["experience_quality"] + score["project_quality"] + score["skills_strength"]) / 4.0
        
        # Overall
        score["overall_score"] = (score["ats_score"] * 0.3) + (score["content_quality"] * 0.7)
        
        return score
