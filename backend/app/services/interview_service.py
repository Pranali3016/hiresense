import json
import logging
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.syllabus import Skill, InterviewQuestion
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


def get_questions_from_db(db: Session, skill_name: str):
    """Check if this skill already has interview questions saved."""
    skill_lower = skill_name.lower().strip()
    skill = db.query(Skill).filter(Skill.name == skill_lower).first()
    if not skill:
        return None
    questions = db.query(InterviewQuestion).filter(InterviewQuestion.skill_id == skill.id).all()
    if not questions:
        return None
    return questions


def questions_to_dict(questions) -> dict:
    """Split questions into theory and coding lists for the frontend."""
    theory = [
        {
            "id": q.id, "difficulty": q.difficulty, "question": q.question,
            "answer": q.answer, "frequently_asked": q.frequently_asked
        }
        for q in questions if q.type == "theory"
    ]
    coding = [
        {
            "id": q.id, "difficulty": q.difficulty, "question": q.question,
            "answer": q.answer, "frequently_asked": q.frequently_asked
        }
        for q in questions if q.type == "coding"
    ]
    return {
        "theory_questions": theory,
        "coding_questions": coding,
        "theory_count": len(theory),
        "coding_count": len(coding)
    }


def get_fallback_questions(skill_name: str) -> dict:
    """Curated technical & coding interview questions fallback for any skill."""
    formatted = skill_name.strip().title()
    theory_questions = [
        {
            "difficulty": "basic",
            "frequently_asked": True,
            "question": f"Can you explain the core concepts and primary purpose of {formatted}?",
            "answer": f"{formatted} is used extensively in modern engineering to solve key architecture, scalability, and workflow challenges. In an interview, explain what problem {formatted} solves, its main components, and how it compares to alternative tools."
        },
        {
            "difficulty": "intermediate",
            "frequently_asked": True,
            "question": f"How do you handle error boundaries, debugging, and performance optimization in {formatted}?",
            "answer": f"In production with {formatted}, robust error handling requires proactive logging, input validation, structured exception handling, and identifying bottlenecks through profiling and metrics."
        },
        {
            "difficulty": "advanced",
            "frequently_asked": True,
            "question": f"What are the best practices for scaling and securing a production system that uses {formatted}?",
            "answer": f"Key practices include least-privilege access control, caching hot paths, managing connection pooling, ensuring idempotency in API operations, and setting up automated CI/CD validation tests."
        }
    ]

    coding_questions = [
        {
            "difficulty": "basic",
            "frequently_asked": True,
            "question": f"Implement a basic practical workflow or function using {formatted}.",
            "answer": f"# Example {formatted} implementation:\n# 1. Initialize configuration and parameters\n# 2. Process incoming data with validation\n# 3. Return sanitized response\ndef handle_operation(data):\n    if not data:\n        raise ValueError('Invalid input')\n    return {{'status': 'success', 'result': data}}"
        },
        {
            "difficulty": "intermediate",
            "frequently_asked": True,
            "question": f"Write a resilient data processing function for {formatted} with retry logic.",
            "answer": f"# Resilient handler with error recovery:\ndef execute_with_fallback(task_fn, max_retries=3):\n    for attempt in range(max_retries):\n        try:\n            return task_fn()\n        except Exception as err:\n            if attempt == max_retries - 1:\n                raise err\n            continue"
        }
    ]

    return {
        "theory_questions": theory_questions,
        "coding_questions": coding_questions
    }


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type(Exception),
    reraise=True
)
def _call_gemini_api_for_questions(client: genai.Client, prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return response.text.strip()


def _call_gemini_for_questions(skill_name: str, question_type: str) -> list:
    """Ask Gemini for one category of questions with retry and fallback."""
    if not settings.gemini_api_key or settings.gemini_api_key.startswith("your_"):
        fallback = get_fallback_questions(skill_name)
        return fallback["theory_questions"] if question_type == "theory" else fallback["coding_questions"]

    if question_type == "theory":
        type_instructions = """Generate THEORY interview questions for this skill (10-25 questions).
Include realistic situational and scenario-based questions, not just definitions.
Answers must sound natural and human - like someone confidently speaking in an interview for about 2 minutes."""
        example_q = '"question": "<question text>", "answer": "<natural 2-minute spoken-style answer>"'
    else:
        type_instructions = """Generate CODING interview questions for this skill (10-25 questions).
IMPORTANT: solutions must NOT use built-in shortcut functions that solve the core problem directly. Solve manually with clear step-by-step logic and comments."""
        example_q = '"question": "<coding problem, phrased like a real interview question>", "answer": "<manual working solution with comments>"'

    prompt = f"""{type_instructions}

Skill: "{skill_name}"

Return ONLY valid JSON (no markdown, no code fences, no extra text) in EXACTLY this structure:

{{
  "questions": [
    {{
      "difficulty": "basic",
      "frequently_asked": true,
      {example_q}
    }}
  ]
}}

Rules:
- difficulty must be one of: "basic", "intermediate", "advanced"
- frequently_asked should be true for commonly asked questions
- Return ONLY the JSON object"""

    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        raw_json = _call_gemini_api_for_questions(client, prompt)
        parsed = json.loads(raw_json)
        if "questions" in parsed and isinstance(parsed["questions"], list) and len(parsed["questions"]) > 0:
            return parsed["questions"]
        raise ValueError("Invalid questions list format from Gemini")
    except Exception as e:
        logger.warning(f"Gemini {question_type} questions failed for '{skill_name}': {e}. Using fallback.")
        fallback = get_fallback_questions(skill_name)
        return fallback["theory_questions"] if question_type == "theory" else fallback["coding_questions"]


def generate_questions_with_gemini(skill_name: str) -> dict:
    theory_questions = _call_gemini_for_questions(skill_name, "theory")
    coding_questions = _call_gemini_for_questions(skill_name, "coding")
    return {
        "theory_questions": theory_questions,
        "coding_questions": coding_questions
    }


def save_questions_to_db(db: Session, skill_name: str, data: dict):
    """Save generated questions into the interview_questions table."""
    skill_lower = skill_name.lower().strip()
    skill = db.query(Skill).filter(Skill.name == skill_lower).first()

    if not skill:
        skill = Skill(name=skill_lower, weeks_needed=0, why_it_matters="")
        db.add(skill)
        db.flush()

    for q in data.get("theory_questions", []):
        db.add(InterviewQuestion(
            skill_id=skill.id,
            type="theory",
            difficulty=q.get("difficulty", "intermediate"),
            question=q.get("question", ""),
            answer=q.get("answer", ""),
            frequently_asked=q.get("frequently_asked", False),
        ))

    for q in data.get("coding_questions", []):
        db.add(InterviewQuestion(
            skill_id=skill.id,
            type="coding",
            difficulty=q.get("difficulty", "intermediate"),
            question=q.get("question", ""),
            answer=q.get("answer", ""),
            frequently_asked=q.get("frequently_asked", False),
        ))

    db.commit()
    return db.query(InterviewQuestion).filter(InterviewQuestion.skill_id == skill.id).all()


def get_or_create_questions(db: Session, skill_name: str) -> dict:
    """
    Main entry point: checks DB first.
    If missing, calls Gemini with backoff retries and reliable fallback.
    """
    existing = get_questions_from_db(db, skill_name)
    if existing:
        return questions_to_dict(existing)

    generated_data = generate_questions_with_gemini(skill_name)
    try:
        saved_questions = save_questions_to_db(db, skill_name, generated_data)
        return questions_to_dict(saved_questions)
    except Exception as e:
        db.rollback()
        logger.warning(f"Database save conflict for interview questions '{skill_name}': {e}")
        existing = get_questions_from_db(db, skill_name)
        if existing:
            return questions_to_dict(existing)
        # Return generated data directly if database write temporarily fails
        return {
            "theory_questions": generated_data.get("theory_questions", []),
            "coding_questions": generated_data.get("coding_questions", []),
            "theory_count": len(generated_data.get("theory_questions", [])),
            "coding_count": len(generated_data.get("coding_questions", []))
        }
