from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.agent import run_agent
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User, Analysis
import json

router = APIRouter()


from typing import Optional

@router.post("/resume")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Agent powered resume analysis.
    Uses LangGraph agent with RAG semantic matching and Groq AI.
    Requires login - results are saved under the logged-in user.
    """
    file_bytes = None

    if file and file.filename:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        file_bytes = await file.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 10MB")
    elif current_user.resume_text:
        file_bytes = current_user.resume_text.encode("utf-8")

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Please upload a resume PDF file")

    if len(job_description.strip()) < 30:
        raise HTTPException(status_code=400, detail="Job description too short (minimum 30 characters required)")

    result = run_agent(file_bytes, job_description)

    # Save this analysis under the logged-in user
    analysis_record = Analysis(
        user_id=current_user.id,
        job_title=result.get("job", {}).get("title", "")[:200],
        overall_score=int(result.get("analysis", {}).get("overall_score", 0)),
        matched_skills=json.dumps(result.get("analysis", {}).get("matched_skills", [])),
        missing_skills=json.dumps(result.get("analysis", {}).get("missing_skills", [])),
    )
    db.add(analysis_record)
    db.commit()

    return result
