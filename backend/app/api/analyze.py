import json
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.agent import run_agent
from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.rate_limiter import limit_analysis_requests
from app.models.user import User, Analysis

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
MIN_JD_CHAR_LENGTH = 30
MAX_JD_CHAR_LENGTH = 20000


@router.post("/resume", dependencies=[Depends(limit_analysis_requests)])
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Agent-powered resume analysis.
    Uses LangGraph agent with RAG semantic matching, Groq AI, and skill roadmaps.
    Guarded with rate limiting, input validation, and user database isolation.
    """
    # 1. Input Validation: Job description
    clean_jd = job_description.strip()
    if len(clean_jd) < MIN_JD_CHAR_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Job description too short ({len(clean_jd)} chars). Please provide at least {MIN_JD_CHAR_LENGTH} characters."
        )
    if len(clean_jd) > MAX_JD_CHAR_LENGTH:
        clean_jd = clean_jd[:MAX_JD_CHAR_LENGTH]

    # 2. Input Validation: Resume PDF or profile resume
    file_bytes = None

    if file and file.filename:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"Invalid file format for '{file.filename}'. Only PDF resumes are supported.")
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded PDF file is empty.")
        if len(file_bytes) > MAX_PDF_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large. Maximum allowed resume size is 10MB.")
    elif current_user.resume_text:
        file_bytes = current_user.resume_text.encode("utf-8")

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Please upload a resume PDF or save a resume in your profile vault.")

    # 3. Execution: Run agent pipeline
    try:
        result = run_agent(file_bytes, clean_jd)
    except Exception as e:
        logger.exception(f"Resume analysis agent failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during resume analysis. Please try again.")

    # 4. Database persistence under current_user.id
    try:
        analysis_record = Analysis(
            user_id=current_user.id,
            job_title=result.get("job", {}).get("title", "Target Role")[:200],
            overall_score=int(result.get("analysis", {}).get("overall_score", 0)),
            matched_skills=json.dumps(result.get("analysis", {}).get("matched_skills", [])),
            missing_skills=json.dumps(result.get("analysis", {}).get("missing_skills", [])),
        )
        db.add(analysis_record)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Failed to persist analysis record for user {current_user.id}: {e}")

    return result
