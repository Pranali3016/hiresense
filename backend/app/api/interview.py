from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.interview_service import get_or_create_questions

router = APIRouter()


@router.get("/{skill_name}")
def get_skill_interview_questions(skill_name: str, db: Session = Depends(get_db)):
    questions = get_or_create_questions(db, skill_name)
    return {
        "success": True,
        "skill": skill_name,
        **questions
    }
