import json
import logging
from google import genai
from google.genai import types
from sqlalchemy.orm import Session, selectinload
from app.core.config import settings
from app.models.syllabus import Skill, Week, Module, Subtopic, Project, CapstoneProject
from app.services.video_search import search_video_for_topic
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


def get_skill_from_db(db: Session, skill_name: str):
    """Check if this skill already has a full syllabus saved. Returns None if not found."""
    skill_lower = skill_name.lower().strip()
    skill = (
        db.query(Skill)
        .options(
            selectinload(Skill.weeks).selectinload(Week.modules).selectinload(Module.subtopics),
            selectinload(Skill.weeks).selectinload(Week.projects),
            selectinload(Skill.capstone_projects),
        )
        .filter(Skill.name == skill_lower)
        .first()
    )
    if skill and len(skill.weeks) == 0:
        return None
    return skill


def skill_to_dict(skill: Skill) -> dict:
    """Convert the database rows into the nested JSON shape the frontend expects."""
    return {
        "skill": skill.name,
        "weeks_needed": skill.weeks_needed,
        "why_it_matters": skill.why_it_matters,
        "prerequisite_summary": skill.prerequisite_summary,
        "weeks": [
            {
                "week_number": w.week_number,
                "daily_hours": w.daily_hours,
                "modules": [
                    {
                        "title": m.title,
                        "video_link": m.video_link,
                        "subtopics": [
                            {"id": s.id, "text": s.text} for s in m.subtopics
                        ],
                    }
                    for m in w.modules
                ],
                "projects": [
                    {"title": p.title, "description": p.description}
                    for p in w.projects
                ],
            }
            for w in sorted(skill.weeks, key=lambda w: w.week_number)
        ],
        "capstone_projects": [
            {"title": cp.title, "description": cp.description}
            for cp in skill.capstone_projects
        ],
    }


def get_fallback_syllabus_data(skill_name: str) -> dict:
    """High-quality structured fallback syllabus when Gemini API is unavailable or quota is exceeded."""
    formatted_name = skill_name.strip().title()
    return {
        "weeks_needed": 3,
        "why_it_matters": f"{formatted_name} is an essential competency frequently required in modern software engineering and tech job descriptions.",
        "prerequisite_summary": f"Basic programming fundamentals and command line familiarity.",
        "weeks": [
            {
                "week_number": 1,
                "modules": [
                    {
                        "title": f"{formatted_name} Architecture & Core Fundamentals",
                        "subtopics": [
                            f"Core concepts, mental model, and architecture of {formatted_name}",
                            f"Environment setup, CLI tools, and configuration",
                            f"Essential syntax, data types, and primary primitives",
                            f"Handling common errors, debugging, and logging"
                        ]
                    },
                    {
                        "title": f"{formatted_name} Core Workflows & Operations",
                        "subtopics": [
                            f"Standard operational patterns in {formatted_name}",
                            f"State management, lifecycle, and component flows",
                            f"Integrating with external libraries and package management",
                            f"Writing unit tests and assertions for {formatted_name}"
                        ]
                    }
                ],
                "projects": [
                    {
                        "title": f"{formatted_name} Starter Sandbox",
                        "description": f"Build a clean end-to-end sandbox application verifying core {formatted_name} features."
                    }
                ]
            },
            {
                "week_number": 2,
                "modules": [
                    {
                        "title": f"Intermediate {formatted_name} & Data Pipelines",
                        "subtopics": [
                            f"Asynchronous workflows, concurrency, and performance tuning",
                            f"Connecting {formatted_name} to REST APIs and database layers",
                            f"Error boundaries, retry strategies, and resiliency",
                            f"Security best practices, auth headers, and environment variables"
                        ]
                    },
                    {
                        "title": f"Real-World Integration Patterns",
                        "subtopics": [
                            f"Refactoring legacy implementations to modern {formatted_name} patterns",
                            f"Modular structure and clean architecture separation",
                            f"Continuous Integration (CI) test automation",
                            f"Benchmarking throughput, latency, and resource usage"
                        ]
                    }
                ],
                "projects": [
                    {
                        "title": f"{formatted_name} Production Service Module",
                        "description": f"Develop a robust microservice or component in {formatted_name} connected to a database and API."
                    }
                ]
            },
            {
                "week_number": 3,
                "modules": [
                    {
                        "title": f"Advanced {formatted_name} Optimization & Production Deployment",
                        "subtopics": [
                            f"Containerizing {formatted_name} with Docker for cloud deployment",
                            f"Telemetry, monitoring, alerting, and distributed tracing",
                            f"Scalability, caching strategies, and load management",
                            f"Technical interview preparation and system design scenarios"
                        ]
                    }
                ],
                "projects": [
                    {
                        "title": f"{formatted_name} Production Deployment Pipeline",
                        "description": f"Containerize and deploy the project to cloud staging with health check endpoints and automated tests."
                    }
                ]
            }
        ],
        "capstone_projects": [
            {
                "title": f"Enterprise {formatted_name} Real-Time Dashboard",
                "description": f"Full-stack production platform leveraging {formatted_name} with analytics, user auth, and background worker queues."
            },
            {
                "title": f"Scalable High-Throughput {formatted_name} Service",
                "description": f"Optimized backend microservice handling thousands of requests per second with caching, rate limiting, and Docker deployment."
            },
            {
                "title": f"Open Source {formatted_name} Toolkit & Benchmark Suite",
                "description": f"Comprehensive open-source utility package with automated CI/CD pipelines, documentation, and unit test suites."
            }
        ]
    }


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type(Exception),
    reraise=True
)
def _call_gemini_api(client: genai.Client, prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return response.text.strip()


def generate_syllabus_with_gemini(skill_name: str) -> dict:
    """
    Generate syllabus using Google Gemini with retry and fallback.
    Never crashes even if Gemini is down or quota is exceeded.
    """
    if not settings.gemini_api_key or settings.gemini_api_key.startswith("your_"):
        return get_fallback_syllabus_data(skill_name)

    prompt = f"""Generate a complete, in-depth learning syllabus for the skill: "{skill_name}".

Return ONLY valid JSON in EXACTLY this structure:

{{
  "weeks_needed": <integer, total weeks to learn this at 2 hours/day>,
  "why_it_matters": "<one sentence on why this skill matters for jobs>",
  "weeks": [
    {{
      "week_number": 1,
      "modules": [
        {{
          "title": "<module name, e.g. Variables>",
          "subtopics": ["<subtopic 1>", "<subtopic 2>", "<subtopic 3>", "<subtopic 4>"]
        }}
      ],
      "projects": [
        {{"title": "<small practice project title>", "description": "<what to build using ONLY what was covered THIS week, 1-2 sentences>"}}
      ]
    }}
  ],
  "capstone_projects": [
    {{"title": "<major project name>", "description": "<a substantial, portfolio-worthy project combining multiple concepts from across the ENTIRE syllabus, 2-3 sentences>"}}
  ]
}}

Rules:
- Cover this skill from basics to job-ready level
- Each week represents 7 days at 2 hours/day (14 hours total) - make sure each week has ENOUGH content to genuinely fill that time. Use 4-6 modules per week (not 2-4), each with 4-6 subtopics
- EVERY week must end with 1-2 small practice projects using only concepts covered in THAT week specifically
- At the very end (top-level "capstone_projects"), include exactly 3 MAJOR portfolio-worthy projects that each combine concepts from across the whole syllabus
- Return ONLY the JSON object, nothing else"""

    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        raw_json = _call_gemini_api(client, prompt)
        parsed = json.loads(raw_json)
        if "weeks" in parsed and isinstance(parsed["weeks"], list) and len(parsed["weeks"]) > 0:
            return parsed
        raise ValueError("Invalid syllabus schema received from LLM")
    except Exception as e:
        logger.warning(f"Gemini syllabus generation failed ({e}), using resilient fallback for '{skill_name}'")
        return get_fallback_syllabus_data(skill_name)


def save_syllabus_to_db(db: Session, skill_name: str, data: dict) -> Skill:
    """Save generated syllabus into structured database tables."""
    skill_lower = skill_name.lower().strip()
    skill = db.query(Skill).filter(Skill.name == skill_lower).first()

    if skill:
        skill.weeks_needed = data.get("weeks_needed", 3)
        skill.why_it_matters = data.get("why_it_matters", "")
    else:
        skill = Skill(
            name=skill_lower,
            weeks_needed=data.get("weeks_needed", 3),
            why_it_matters=data.get("why_it_matters", ""),
        )
        db.add(skill)

    db.flush()

    for week_data in data.get("weeks", []):
        week = Week(
            skill_id=skill.id,
            week_number=week_data.get("week_number", 1),
            daily_hours=2,
        )
        db.add(week)
        db.flush()

        for module_data in week_data.get("modules", []):
            module = Module(
                week_id=week.id,
                title=module_data.get("title", f"Module"),
                video_link=search_video_for_topic(module_data.get("title", "")),
            )
            db.add(module)
            db.flush()

            for subtopic_text in module_data.get("subtopics", []):
                db.add(Subtopic(module_id=module.id, text=subtopic_text))

        for project_data in week_data.get("projects", []):
            db.add(Project(
                week_id=week.id,
                title=project_data.get("title", "Practice Project"),
                description=project_data.get("description", "Hands-on implementation project"),
            ))

    for cp_data in data.get("capstone_projects", []):
        db.add(CapstoneProject(
            skill_id=skill.id,
            title=cp_data.get("title", "Capstone Project"),
            description=cp_data.get("description", "Comprehensive portfolio project"),
        ))

    db.commit()
    db.refresh(skill)
    return skill


def get_or_create_syllabus(db: Session, skill_name: str) -> dict:
    """
    Main entry point: checks DB first.
    If missing, calls Gemini with retries and graceful fallback.
    Never throws uncaught 500 errors to the client.
    """
    existing = get_skill_from_db(db, skill_name)
    if existing:
        return skill_to_dict(existing)

    generated_data = generate_syllabus_with_gemini(skill_name)
    try:
        saved_skill = save_syllabus_to_db(db, skill_name, generated_data)
        return skill_to_dict(saved_skill)
    except Exception as e:
        db.rollback()
        logger.warning(f"Database save conflict for syllabus '{skill_name}': {e}")
        existing = get_skill_from_db(db, skill_name)
        if existing:
            return skill_to_dict(existing)
        # Return generated data directly if database write temporarily fails
        return {
            "skill": skill_name.lower().strip(),
            "weeks_needed": generated_data.get("weeks_needed", 3),
            "why_it_matters": generated_data.get("why_it_matters", ""),
            "prerequisite_summary": generated_data.get("prerequisite_summary", ""),
            "weeks": generated_data.get("weeks", []),
            "capstone_projects": generated_data.get("capstone_projects", [])
        }
