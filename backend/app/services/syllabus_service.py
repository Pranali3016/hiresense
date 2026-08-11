import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session, selectinload
from app.core.config import settings
from app.models.syllabus import Skill, Week, Module, Subtopic, Project, CapstoneProject
from app.services.video_search import search_video_for_topic

client = genai.Client(api_key=settings.gemini_api_key)


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


def generate_syllabus_with_gemini(skill_name: str) -> dict:
    """Ask Gemini to build a full syllabus in our exact expected JSON format."""

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
- At the very end (top-level "capstone_projects"), include exactly 3 MAJOR portfolio-worthy projects that each combine concepts from across the whole syllabus - these are bigger and more substantial than the weekly practice projects
- Base the number of weeks on realistic learning time at 2 hours/day, given the increased depth per week
- Return ONLY the JSON object, nothing else"""

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    text = response.text.strip()
    return json.loads(text)


def save_syllabus_to_db(db: Session, skill_name: str, data: dict) -> Skill:
    """Save Gemini's generated syllabus into our structured tables."""
    skill_lower = skill_name.lower().strip()
    skill = db.query(Skill).filter(Skill.name == skill_lower).first()

    if skill:
        skill.weeks_needed = data["weeks_needed"]
        skill.why_it_matters = data.get("why_it_matters", "")
    else:
        skill = Skill(
            name=skill_lower,
            weeks_needed=data["weeks_needed"],
            why_it_matters=data.get("why_it_matters", ""),
        )
        db.add(skill)

    db.flush()

    for week_data in data["weeks"]:
        week = Week(
            skill_id=skill.id,
            week_number=week_data["week_number"],
            daily_hours=2,
        )
        db.add(week)
        db.flush()

        for module_data in week_data.get("modules", []):
            module = Module(
                week_id=week.id,
                title=module_data["title"],
                video_link=search_video_for_topic(module_data["title"]),
            )
            db.add(module)
            db.flush()

            for subtopic_text in module_data.get("subtopics", []):
                db.add(Subtopic(module_id=module.id, text=subtopic_text))

        for project_data in week_data.get("projects", []):
            db.add(Project(
                week_id=week.id,
                title=project_data["title"],
                description=project_data["description"],
            ))

    for cp_data in data.get("capstone_projects", []):
        db.add(CapstoneProject(
            skill_id=skill.id,
            title=cp_data["title"],
            description=cp_data["description"],
        ))

    db.commit()
    db.refresh(skill)
    return skill


def get_or_create_syllabus(db: Session, skill_name: str) -> dict:
    """Main entry point: check DB first, only call Gemini if truly missing."""
    existing = get_skill_from_db(db, skill_name)
    if existing:
        return skill_to_dict(existing)

    generated_data = generate_syllabus_with_gemini(skill_name)
    try:
        saved_skill = save_syllabus_to_db(db, skill_name, generated_data)
        return skill_to_dict(saved_skill)
    except Exception:
        # Another simultaneous request likely created this skill first - use that instead
        db.rollback()
        existing = get_skill_from_db(db, skill_name)
        if existing:
            return skill_to_dict(existing)
        raise
