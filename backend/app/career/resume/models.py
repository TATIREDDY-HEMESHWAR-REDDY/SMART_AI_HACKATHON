from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Resume(Base):
    __tablename__ = "career_resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    template = Column(String(50), default="modern")
    is_default = Column(Boolean, default=False)
    
    # Personal Info
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    portfolio = Column(String(255), nullable=True)
    
    summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    educations = relationship("ResumeEducation", back_populates="resume", cascade="all, delete-orphan")
    experiences = relationship("ResumeExperience", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("ResumeProject", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")
    certifications = relationship("ResumeCertification", back_populates="resume", cascade="all, delete-orphan")
    achievements = relationship("ResumeAchievement", back_populates="resume", cascade="all, delete-orphan")
    activities = relationship("ResumeActivity", back_populates="resume", cascade="all, delete-orphan")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")


class ResumeEducation(Base):
    __tablename__ = "career_resume_educations"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    gpa = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    resume = relationship("Resume", back_populates="educations")


class ResumeExperience(Base):
    __tablename__ = "career_resume_experiences"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    achievements = Column(JSON, nullable=True) # list of strings

    resume = relationship("Resume", back_populates="experiences")


class ResumeProject(Base):
    __tablename__ = "career_resume_projects"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, nullable=True) # list of strings
    github_url = Column(String(255), nullable=True)
    live_url = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    achievements = Column(JSON, nullable=True) # list of strings

    resume = relationship("Resume", back_populates="projects")


class ResumeSkill(Base):
    __tablename__ = "career_resume_skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    category = Column(String(100), nullable=True) # Programming Languages, Frameworks, etc.
    name = Column(String(100), nullable=False)
    proficiency = Column(String(50), nullable=True)

    resume = relationship("Resume", back_populates="skills")


class ResumeCertification(Base):
    __tablename__ = "career_resume_certifications"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_id = Column(String(255), nullable=True)
    credential_url = Column(String(255), nullable=True)

    resume = relationship("Resume", back_populates="certifications")


class ResumeAchievement(Base):
    __tablename__ = "career_resume_achievements"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(50), nullable=True)

    resume = relationship("Resume", back_populates="achievements")


class ResumeActivity(Base):
    __tablename__ = "career_resume_activities"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    organization = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)

    resume = relationship("Resume", back_populates="activities")


class ResumeAnalysis(Base):
    __tablename__ = "career_resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("career_resumes.id"), nullable=False)
    overall_score = Column(Float, default=0.0)
    ats_score = Column(Float, default=0.0)
    
    # Sub-scores
    content_quality = Column(Float, default=0.0)
    skills_strength = Column(Float, default=0.0)
    experience_quality = Column(Float, default=0.0)
    project_quality = Column(Float, default=0.0)
    education_completeness = Column(Float, default=0.0)
    formatting_score = Column(Float, default=0.0)
    
    strengths = Column(JSON, nullable=True) # list of strings
    weaknesses = Column(JSON, nullable=True) # list of strings
    missing_information = Column(JSON, nullable=True) # list of strings
    actionable_improvements = Column(JSON, nullable=True) # list of strings
    
    # For job match
    target_job_title = Column(String(255), nullable=True)
    job_match_score = Column(Float, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
