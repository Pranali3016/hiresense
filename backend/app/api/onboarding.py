from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.resume_parser import parse_resume

router = APIRouter()


@router.post("/complete")
async def complete_onboarding(
    target_role: str = Form(...),
    location: str = Form(...),
    resume: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """One-time step shown right after first login: target role, location, resume."""
    current_user.target_role = target_role.strip()[:200]
    current_user.location = location.strip()[:200]

    if resume is not None and resume.filename:
        if not resume.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        file_bytes = await resume.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
        parsed = parse_resume(file_bytes)
        current_user.resume_text = parsed.get("raw_text", "")[:20000]

    current_user.onboarding_completed = True
    db.commit()

    return {"success": True, "onboarding_completed": True}


@router.get("/status")
def onboarding_status(current_user: User = Depends(get_current_user)):
    return {
        "onboarding_completed": current_user.onboarding_completed,
        "target_role": current_user.target_role,
        "location": current_user.location,
    }
