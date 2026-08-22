from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Resume Education
class ResumeEducationBase(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    description: Optional[str] = None

class ResumeEducationCreate(ResumeEducationBase):
    pass

class ResumeEducationOut(ResumeEducationBase):
    id: int
    class Config:
        from_attributes = True

# Resume Experience
class ResumeExperienceBase(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[List[str]] = None

class ResumeExperienceCreate(ResumeExperienceBase):
    pass

class ResumeExperienceOut(ResumeExperienceBase):
    id: int
    class Config:
        from_attributes = True

# Resume Project
class ResumeProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    achievements: Optional[List[str]] = None

class ResumeProjectCreate(ResumeProjectBase):
    pass

class ResumeProjectOut(ResumeProjectBase):
    id: int
    class Config:
        from_attributes = True

# Resume Skill
class ResumeSkillBase(BaseModel):
    category: Optional[str] = None
    name: str
    proficiency: Optional[str] = None

class ResumeSkillCreate(ResumeSkillBase):
    pass

class ResumeSkillOut(ResumeSkillBase):
    id: int
    class Config:
        from_attributes = True

# Resume Certification
class ResumeCertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class ResumeCertificationCreate(ResumeCertificationBase):
    pass

class ResumeCertificationOut(ResumeCertificationBase):
    id: int
    class Config:
        from_attributes = True

# Resume Achievement
class ResumeAchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class ResumeAchievementCreate(ResumeAchievementBase):
    pass

class ResumeAchievementOut(ResumeAchievementBase):
    id: int
    class Config:
        from_attributes = True

# Resume Activity
class ResumeActivityBase(BaseModel):
    organization: str
    role: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ResumeActivityCreate(ResumeActivityBase):
    pass

class ResumeActivityOut(ResumeActivityBase):
    id: int
    class Config:
        from_attributes = True

# Resume Analysis
class ResumeAnalysisBase(BaseModel):
    overall_score: float = 0.0
    ats_score: float = 0.0
    content_quality: float = 0.0
    skills_strength: float = 0.0
    experience_quality: float = 0.0
    project_quality: float = 0.0
    education_completeness: float = 0.0
    formatting_score: float = 0.0
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missing_information: Optional[List[str]] = None
    actionable_improvements: Optional[List[str]] = None
    target_job_title: Optional[str] = None
    job_match_score: Optional[float] = None
    missing_skills: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None

class ResumeAnalysisOut(ResumeAnalysisBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Resume
class ResumeBase(BaseModel):
    title: str
    template: str = "modern"
    is_default: bool = False
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    summary: Optional[str] = None

class ResumeCreate(ResumeBase):
    educations: Optional[List[ResumeEducationCreate]] = []
    experiences: Optional[List[ResumeExperienceCreate]] = []
    projects: Optional[List[ResumeProjectCreate]] = []
    skills: Optional[List[ResumeSkillCreate]] = []
    certifications: Optional[List[ResumeCertificationCreate]] = []
    achievements: Optional[List[ResumeAchievementCreate]] = []
    activities: Optional[List[ResumeActivityCreate]] = []

class ResumeUpdate(ResumeBase):
    title: Optional[str] = None
    educations: Optional[List[ResumeEducationCreate]] = []
    experiences: Optional[List[ResumeExperienceCreate]] = []
    projects: Optional[List[ResumeProjectCreate]] = []
    skills: Optional[List[ResumeSkillCreate]] = []
    certifications: Optional[List[ResumeCertificationCreate]] = []
    achievements: Optional[List[ResumeAchievementCreate]] = []
    activities: Optional[List[ResumeActivityCreate]] = []

class ResumeOut(ResumeBase):
    id: int
    student_id: str
    created_at: datetime
    updated_at: datetime
    educations: List[ResumeEducationOut] = []
    experiences: List[ResumeExperienceOut] = []
    projects: List[ResumeProjectOut] = []
    skills: List[ResumeSkillOut] = []
    certifications: List[ResumeCertificationOut] = []
    achievements: List[ResumeAchievementOut] = []
    activities: List[ResumeActivityOut] = []
    analyses: List[ResumeAnalysisOut] = []
    class Config:
        from_attributes = True

class JobMatchRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = None
