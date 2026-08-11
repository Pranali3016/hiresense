from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, UserSkillProgress, UserInterviewProgress
from app.models.syllabus import Skill
import json

router = APIRouter()


class ToggleSubtopicRequest(BaseModel):
    skill_name: str
    subtopic_id: int
    completed: bool
    job_role: str | None = None


class ToggleQuestionRequest(BaseModel):
    question_id: int
    completed: bool


@router.post("/subtopic")
def toggle_subtopic(
    data: ToggleSubtopicRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.name == data.skill_name.lower().strip()).first()
    if not skill:
        return {"success": False, "detail": "Skill not found"}

    progress = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == current_user.id, UserSkillProgress.skill_id == skill.id)
        .first()
    )

    if not progress:
        progress = UserSkillProgress(
            user_id=current_user.id,
            skill_id=skill.id,
            subtopics_completed=json.dumps([]),
            job_roles_seen=json.dumps([]),
        )
        db.add(progress)
        db.flush()

    completed_ids = json.loads(progress.subtopics_completed) if progress.subtopics_completed else []
    if data.completed:
        if data.subtopic_id not in completed_ids:
            completed_ids.append(data.subtopic_id)
    else:
        if data.subtopic_id in completed_ids:
            completed_ids.remove(data.subtopic_id)
    progress.subtopics_completed = json.dumps(completed_ids)

    if data.job_role:
        roles = json.loads(progress.job_roles_seen) if progress.job_roles_seen else []
        if data.job_role not in roles:
            roles.append(data.job_role)
        progress.job_roles_seen = json.dumps(roles)

    db.commit()
    return {"success": True}


@router.get("/skill/{skill_name}")
def get_skill_progress(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.name == skill_name.lower().strip()).first()
    if not skill:
        return {"completed_subtopic_ids": []}

    progress = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == current_user.id, UserSkillProgress.skill_id == skill.id)
        .first()
    )
    if not progress or not progress.subtopics_completed:
        return {"completed_subtopic_ids": []}

    return {"completed_subtopic_ids": json.loads(progress.subtopics_completed)}


@router.post("/question")
def toggle_question(
    data: ToggleQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(UserInterviewProgress)
        .filter(
            UserInterviewProgress.user_id == current_user.id,
            UserInterviewProgress.question_id == data.question_id
        )
        .first()
    )

    if data.completed:
        if not existing:
            db.add(UserInterviewProgress(
                user_id=current_user.id,
                question_id=data.question_id,
                completed=True
            ))
    else:
        if existing:
            db.delete(existing)

    db.commit()
    return {"success": True}


@router.get("/questions/{skill_name}")
def get_question_progress(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.syllabus import InterviewQuestion

    skill = db.query(Skill).filter(Skill.name == skill_name.lower().strip()).first()
    if not skill:
        return {"completed_question_ids": []}

    question_ids = [
        q.id for q in db.query(InterviewQuestion).filter(InterviewQuestion.skill_id == skill.id).all()
    ]

    completed = (
        db.query(UserInterviewProgress)
        .filter(
            UserInterviewProgress.user_id == current_user.id,
            UserInterviewProgress.question_id.in_(question_ids),
            UserInterviewProgress.completed == True
        )
        .all()
    )

    return {"completed_question_ids": [c.question_id for c in completed]}
