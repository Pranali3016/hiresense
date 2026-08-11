from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Skill(Base):
    """The 'book' — one row per skill (Python, Docker, ML, etc.)"""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    weeks_needed = Column(Integer, nullable=False)
    why_it_matters = Column(Text, nullable=True)
    prerequisite_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    prerequisite_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    weeks = relationship("Week", back_populates="skill", cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="skill", cascade="all, delete-orphan")
    capstone_projects = relationship("CapstoneProject", back_populates="skill", cascade="all, delete-orphan")


class Week(Base):
    """A 'chapter' — one row per week, belongs to a skill"""
    __tablename__ = "weeks"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    daily_hours = Column(Integer, default=2)

    skill = relationship("Skill", back_populates="weeks")
    modules = relationship("Module", back_populates="week", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="week", cascade="all, delete-orphan")


class Module(Base):
    """A 'section' within a week — e.g. 'Variables', 'Operators'"""
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id"), nullable=False)
    title = Column(String(200), nullable=False)
    video_link = Column(String(500), nullable=True)

    week = relationship("Week", back_populates="modules")
    subtopics = relationship("Subtopic", back_populates="module", cascade="all, delete-orphan")


class Subtopic(Base):
    """A single bullet point within a module — e.g. 'Dynamic typing'"""
    __tablename__ = "subtopics"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    text = Column(String(300), nullable=False)

    module = relationship("Module", back_populates="subtopics")


class Project(Base):
    """End-of-week practice project"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    week = relationship("Week", back_populates="projects")


class InterviewQuestion(Base):
    """Theory or coding interview question, tied to a skill"""
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    type = Column(String(20), nullable=False)  # "theory" or "coding"
    difficulty = Column(String(20), nullable=False)  # "basic", "intermediate", "advanced"
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    frequently_asked = Column(Boolean, default=False)

    skill = relationship("Skill", back_populates="interview_questions")


class CapstoneProject(Base):
    """Major portfolio-worthy project, one of 3 shown at the end of a skill's full syllabus"""
    __tablename__ = "capstone_projects"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    skill = relationship("Skill", back_populates="capstone_projects")
