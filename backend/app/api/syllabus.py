from fastapi import APIRouter
from app.services.syllabus_generator import get_syllabus

router = APIRouter()

@router.get("/{skill_name}")
def get_skill_syllabus(skill_name: str):
    syllabus = get_syllabus(skill_name)
    return {
        "success": True,
        "skill": skill_name,
        "syllabus": syllabus
    }
