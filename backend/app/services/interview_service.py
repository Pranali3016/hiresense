import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.syllabus import Skill, InterviewQuestion

client = genai.Client(api_key=settings.gemini_api_key)


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


def _call_gemini_for_questions(skill_name: str, question_type: str) -> list:
    """Ask Gemini for one category of questions (theory OR coding), letting it
    decide the right count (30-70) based on how this skill is actually tested."""

    if question_type == "theory":
        type_instructions = """Generate THEORY interview questions for this skill.

Decide the right NUMBER of questions yourself, between 30 and 70:
- If this skill is typically tested more through conceptual/theory questions in real interviews (e.g. Machine Learning, System Design), generate CLOSER TO 70
- If this skill is typically tested more hands-on with less theory (e.g. SQL, scripting tools), generate CLOSER TO 30
- Base this on how real interviews for this specific skill actually work

Include realistic situational and scenario-based questions, not just definitions.
Answers must sound natural and human - like someone confidently SPEAKING in an interview for about 2 minutes, not a textbook definition."""
        example_q = '"question": "<question text>", "answer": "<natural 2-minute spoken-style answer>"'
    else:
        type_instructions = """Generate CODING interview questions for this skill.

Decide the right NUMBER of questions yourself, between 30 and 70:
- If this skill is typically tested more through hands-on coding/query-writing in real interviews (e.g. SQL, Python, DSA), generate CLOSER TO 70
- If this skill is typically tested more conceptually with less hands-on coding (e.g. Machine Learning theory, System Design), generate CLOSER TO 30
- Base this on how real interviews for this specific skill actually work

IMPORTANT: solutions must NOT use built-in shortcut functions that solve the core problem directly (e.g. no [::-1] for reversing, no built-in sort() for sorting questions). Solve manually with clear step-by-step logic and comments, the way an interviewer expects a candidate to demonstrate understanding."""
        example_q = '"question": "<coding problem, phrased like a real interview question>", "answer": "<manual working solution with comments, no built-in shortcuts>"'

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
- frequently_asked should be true for questions that are genuinely commonly asked in real {skill_name} interviews, false otherwise
- Return ONLY the JSON object, nothing else"""

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    text = response.text.strip()
    parsed = json.loads(text)
    return parsed["questions"]


def generate_questions_with_gemini(skill_name: str) -> dict:
    """Two separate calls - one for theory, one for coding - for reliability."""
    theory_questions = _call_gemini_for_questions(skill_name, "theory")
    coding_questions = _call_gemini_for_questions(skill_name, "coding")
    return {
        "theory_questions": theory_questions,
        "coding_questions": coding_questions
    }


def save_questions_to_db(db: Session, skill_name: str, data: dict):
    """Save Gemini's generated questions into the interview_questions table."""
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
            difficulty=q["difficulty"],
            question=q["question"],
            answer=q["answer"],
            frequently_asked=q.get("frequently_asked", False),
        ))

    for q in data.get("coding_questions", []):
        db.add(InterviewQuestion(
            skill_id=skill.id,
            type="coding",
            difficulty=q["difficulty"],
            question=q["question"],
            answer=q["answer"],
            frequently_asked=q.get("frequently_asked", False),
        ))

    db.commit()

    return db.query(InterviewQuestion).filter(InterviewQuestion.skill_id == skill.id).all()


def get_or_create_questions(db: Session, skill_name: str) -> dict:
    """Main entry point: check DB first, only call Gemini if truly missing."""
    existing = get_questions_from_db(db, skill_name)
    if existing:
        return questions_to_dict(existing)

    generated_data = generate_questions_with_gemini(skill_name)
    saved_questions = save_questions_to_db(db, skill_name, generated_data)
    return questions_to_dict(saved_questions)
