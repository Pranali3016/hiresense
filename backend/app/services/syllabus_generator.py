import json
from app.core.database import SessionLocal
from app.models.syllabus import Syllabus
from app.services.skills.docker import DOCKER
from app.services.skills.llm import LLM
from app.services.skills.pytorch import PYTORCH
from app.services.skills.aws import AWS

SYLLABUSES = {
    "docker": DOCKER,
    "llm": LLM,
    "large language model": LLM,
    "llms": LLM,
    "pytorch": PYTORCH,
    "aws": AWS,
    "amazon web services": AWS,
}

def get_syllabus_from_db(skill_lower: str):
    db = SessionLocal()
    try:
        result = db.query(Syllabus).filter(
            Syllabus.skill_name == skill_lower
        ).first()
        if result:
            return json.loads(result.content)
        return None
    finally:
        db.close()

def get_default_syllabus(skill_name: str) -> dict:
    return {
        "skill": skill_name,
        "total_duration": "2-3 weeks",
        "daily_time": "1 hour per day",
        "why": f"{skill_name} is an in-demand skill that frequently appears in AI and software engineering job descriptions.",
        "free_resources": [
            {
                "title": f"Search: {skill_name} tutorial for beginners - freeCodeCamp",
                "url": f"https://www.youtube.com/results?search_query={skill_name.replace(' ', '+')}+tutorial+beginners+freecodecamp",
                "duration": "Various",
                "covers": "Start with freeCodeCamp - always has the best free tutorials"
            },
            {
                "title": f"Search: {skill_name} full course - TechWorld with Nana",
                "url": f"https://www.youtube.com/results?search_query={skill_name.replace(' ', '+')}+full+course+techworld+nana",
                "duration": "Various",
                "covers": "TechWorld with Nana has excellent DevOps and cloud tutorials"
            }
        ],
        "sections": [
            {
                "title": "1. Fundamentals",
                "duration": "1 Week",
                "description": f"Core concepts every developer must know about {skill_name}",
                "topics": [
                    {"name": f"What is {skill_name} and what problem does it solve", "stars": 5, "interview_note": "Always asked first in interviews"},
                    {"name": "Install and set up the environment", "stars": 4, "interview_note": "Know how to set this up from scratch"},
                    {"name": "Core concepts and terminology", "stars": 5, "interview_note": "Definitions must be crystal clear"},
                    {"name": "Basic operations and commands", "stars": 5, "interview_note": "Hands-on commands asked in practical interviews"},
                    {"name": "Common patterns and best practices", "stars": 4, "interview_note": "Shows maturity beyond basics"}
                ],
                "practice": [
                    "Follow the official getting started guide",
                    "Build a hello world example",
                    "Complete 3 exercises from the official docs"
                ],
                "interview_questions": [
                    f"What is {skill_name}?",
                    f"Why would you use {skill_name}?",
                    f"What are the core concepts of {skill_name}?"
                ]
            },
            {
                "title": "2. Build a Real Project",
                "duration": "1 Week",
                "description": f"Apply {skill_name} to your existing HireSense project",
                "topics": [
                    {"name": f"Integrate {skill_name} into an existing project", "stars": 5, "interview_note": "Practical application is what employers want"},
                    {"name": "Write tests for your implementation", "stars": 4, "interview_note": "Shows professional mindset"},
                    {"name": "Document your code and push to GitHub", "stars": 4, "interview_note": "Recruiters verify GitHub"},
                    {"name": "Write README explaining how you used it", "stars": 3, "interview_note": "Communication skill"}
                ],
                "practice": [
                    f"Add {skill_name} to your HireSense backend or frontend",
                    "Push working implementation to GitHub",
                    "Write a 200 word explanation of what you built"
                ],
                "interview_questions": [
                    f"Have you used {skill_name} in a project?",
                    f"What challenges did you face with {skill_name}?",
                    f"How did you learn {skill_name}?"
                ]
            }
        ],
        "final_learning_order": [
            f"{skill_name} fundamentals",
            "Core operations",
            "Real project",
            "GitHub documentation"
        ],
        "top_interview_topics": [
            f"Definition of {skill_name}",
            "Core use cases",
            "Practical implementation"
        ],
        "projects": [
            {
                "level": "Beginner",
                "name": f"Hello World with {skill_name}",
                "description": f"Basic implementation following official documentation"
            },
            {
                "level": "Intermediate",
                "name": f"Add {skill_name} to HireSense",
                "description": f"Integrate {skill_name} into your existing portfolio project"
            }
        ]
    }

def get_syllabus(skill_name: str) -> dict:
    skill_lower = skill_name.lower().strip()
    if skill_lower in SYLLABUSES:
        return SYLLABUSES[skill_lower]
    cached = get_syllabus_from_db(skill_lower)
    if cached:
        return cached
    return get_default_syllabus(skill_name)
