from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """A candidate account"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    oauth_provider = Column(String(50), nullable=True)
    name = Column(String(200), nullable=True)
    target_role = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    resume_text = Column(Text, nullable=True)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    role = Column(String(20), default="candidate", nullable=False)
    company_name = Column(String(255), nullable=True)
    company_website = Column(String(255), nullable=True)
    recruiter_title = Column(String(150), nullable=True)
    company_size = Column(String(50), nullable=True)
    hiring_domain = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    """One resume-vs-JD analysis result, tied to the user who ran it"""
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String(200), nullable=True)
    overall_score = Column(Integer, nullable=True)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="analyses")


class UserSkillProgress(Base):
    """Tracks a user's checklist progress for one skill, shared across all their analyses.
    subtopics_completed stores a JSON list of completed subtopic IDs."""
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    subtopics_completed = Column(Text, nullable=True)
    job_roles_seen = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="skill_progress")


class UserInterviewProgress(Base):
    """Tracks which interview questions a user has marked as completed, per skill"""
    __tablename__ = "user_interview_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False)
    completed = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class JobPosting(Base):
    """A recruiter's job posting, used as the basis for ranking uploaded candidates"""
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=True)
    job_description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidates = relationship("CandidateMatch", back_populates="job_posting", cascade="all, delete-orphan")


class CandidateMatch(Base):
    """One uploaded candidate resume, scored against a job posting"""
    __tablename__ = "candidate_matches"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)
    candidate_name = Column(String(200), nullable=True)
    resume_filename = Column(String(300), nullable=True)
    resume_text = Column(Text, nullable=True)
    overall_score = Column(Integer, nullable=True)
    years_of_experience = Column(Integer, default=0, nullable=True)
    seniority_level = Column(String(50), default="Junior", nullable=True)
    estimated_salary_range = Column(String(100), nullable=True)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    status = Column(String(50), default="under_review", nullable=True)
    notes = Column(Text, nullable=True)
    star_rating = Column(Integer, default=0, nullable=True)
    summary_pitch = Column(Text, nullable=True)
    resume_pdf_data = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_posting = relationship("JobPosting", back_populates="candidates")

