import json
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rate_limiter import limit_analysis_requests
from app.models.user import User, JobPosting, CandidateMatch
from app.services.recruiter_service import (
    create_job_posting,
    score_and_save_candidate,
    get_ranked_candidates,
    get_recruiter_dashboard_stats,
    delete_job_posting,
    MAX_RESUMES_PER_BATCH
)
from app.services.recruiter_llm import (
    generate_smart_jd,
    generate_gap_targeted_questions,
    chat_candidate_pool_rag,
    generate_outreach_email,
    generate_candidate_pitch,
    generate_interview_scorecard_rubric
)

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024  # 5MB per resume in batch


class UpdateCandidateWorkflowRequest(BaseModel):
    status: Optional[str] = None  # 'under_review' | 'shortlisted' | 'interview_scheduled' | 'rejected'
    notes: Optional[str] = None
    star_rating: Optional[int] = None


def require_recruiter(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="This feature is only available to recruiter accounts")
    return current_user


# --- Request Models ---
class GenerateJDRequest(BaseModel):
    job_title: str = Field(..., min_length=2, max_length=150)
    experience_level: Optional[str] = "Mid-Level"
    industry: Optional[str] = "Technology"
    raw_notes: Optional[str] = ""


class ChatPoolRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    chat_history: Optional[List[dict]] = None


class OutreachEmailRequest(BaseModel):
    email_type: str = "invitation"  # 'invitation' | 'rejection_feedback'
    company_name: Optional[str] = "HireSense Talent"


# --- Endpoints ---

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Fetch complete recruitment analytics and campaign history for recruiter dashboard."""
    stats = get_recruiter_dashboard_stats(db, current_user.id)
    return {
        "success": True,
        "recruiter_name": current_user.name or current_user.email,
        **stats
    }


@router.post("/generate-jd")
def generate_jd_endpoint(
    req: GenerateJDRequest,
    current_user: User = Depends(require_recruiter)
):
    """AI Smart Job Description Builder & Optimizer."""
    try:
        jd_result = generate_smart_jd(
            job_title=req.job_title,
            experience_level=req.experience_level or "Mid-Level",
            industry=req.industry or "Technology",
            raw_notes=req.raw_notes or ""
        )
        return {
            "success": True,
            "data": jd_result
        }
    except Exception as e:
        logger.exception(f"Smart JD generation failed: {e}")
        raise HTTPException(status_code=500, detail="Could not generate job description. Please try again.")


@router.post("/rank-candidates", dependencies=[Depends(limit_analysis_requests)])
async def rank_candidates(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    skills_weight: float = Form(0.5),
    exp_weight: float = Form(0.3),
    domain_weight: float = Form(0.2),
    strict_must_haves: bool = Form(False),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Screen, score, and rank a batch of candidate resumes against a Job Description."""
    clean_jd = job_description.strip()
    if len(clean_jd) < 30:
        raise HTTPException(
            status_code=400,
            detail=f"Job description too short ({len(clean_jd)} chars). Please provide at least 30 characters."
        )

    if len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least one candidate resume.")

    if len(files) > MAX_RESUMES_PER_BATCH:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_RESUMES_PER_BATCH} resumes allowed per batch. You provided {len(files)}."
        )

    for f in files:
        if not f.filename or not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"'{f.filename}' is not a valid PDF file. Only PDF resumes are accepted.")

    try:
        posting, jd_data = create_job_posting(db, current_user.id, clean_jd)
    except Exception as e:
        logger.exception(f"Failed to create job posting: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize job posting. Please try again.")

    results = []
    errors = []
    for f in files:
        try:
            file_bytes = await f.read()
            if len(file_bytes) == 0:
                errors.append({"filename": f.filename, "error": "File is empty"})
                continue
            if len(file_bytes) > MAX_PDF_SIZE_BYTES:
                errors.append({"filename": f.filename, "error": "File exceeds maximum size (5MB)"})
                continue
            candidate = score_and_save_candidate(
                db=db,
                job_posting_id=posting.id,
                jd_data=jd_data,
                file_bytes=file_bytes,
                filename=f.filename,
                skills_weight=skills_weight,
                exp_weight=exp_weight,
                domain_weight=domain_weight,
                strict_must_haves=strict_must_haves
            )
            results.append(candidate.id)
        except Exception as e:
            logger.warning(f"Failed to process resume '{f.filename}' for posting {posting.id}: {e}")
            errors.append({"filename": f.filename, "error": "Could not process this file"})

    ranked = get_ranked_candidates(db, posting.id)

    return {
        "success": True,
        "job_posting_id": posting.id,
        "job_title": posting.title,
        "candidates": ranked,
        "errors": errors
    }


@router.get("/job/{job_posting_id}")
def get_job_results(
    job_posting_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Retrieve full ranked candidate matrix and metadata for a specific job posting."""
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_posting_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not posting:
        raise HTTPException(status_code=404, detail="Job campaign not found")

    ranked = get_ranked_candidates(db, posting.id)
    return {
        "success": True,
        "job_posting_id": posting.id,
        "job_title": posting.title,
        "job_description": posting.job_description,
        "created_at": posting.created_at.isoformat() if posting.created_at else None,
        "candidates": ranked
    }


@router.post("/job/{job_posting_id}/chat")
def chat_over_candidate_pool_endpoint(
    job_posting_id: int,
    req: ChatPoolRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Candidate Pool RAG Chat: Ask questions across all resumes in this screening batch."""
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_posting_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not posting:
        raise HTTPException(status_code=404, detail="Job campaign not found")

    ranked = get_ranked_candidates(db, posting.id)
    if not ranked:
        return {
            "success": True,
            "answer": "No candidates have been uploaded to this campaign yet. Please upload candidate resumes to start querying the pool.",
            "cited_candidate_ids": [],
            "top_recommendation": "None"
        }

    rag_response = chat_candidate_pool_rag(
        query=req.query,
        job_title=posting.title or "Job Opening",
        job_description=posting.job_description,
        candidates=ranked,
        chat_history=req.chat_history
    )

    return {
        "success": True,
        **rag_response
    }


@router.get("/candidate/{candidate_id}/gap-questions")
def get_candidate_gap_questions(
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Generate gap-targeted technical and architectural interview questions for a specific candidate."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    posting = candidate.job_posting
    matched = json.loads(candidate.matched_skills) if candidate.matched_skills else []
    missing = json.loads(candidate.missing_skills) if candidate.missing_skills else []

    questions_data = generate_gap_targeted_questions(
        candidate_name=candidate.candidate_name or "Candidate",
        matched_skills=matched,
        missing_skills=missing,
        job_title=posting.title or "Software Role",
        job_description=posting.job_description
    )

    return {
        "success": True,
        "candidate_id": candidate.id,
        "overall_score": candidate.overall_score,
        **questions_data
    }


@router.post("/candidate/{candidate_id}/outreach-email")
def generate_candidate_outreach_email(
    candidate_id: int,
    req: OutreachEmailRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Generate 1-click personalized outreach or feedback email for a candidate."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    posting = candidate.job_posting
    company = current_user.company_name or req.company_name or "HireSense"
    recruiter_name = current_user.name or "Talent Acquisition Lead"
    matched = json.loads(candidate.matched_skills) if candidate.matched_skills else []
    missing = json.loads(candidate.missing_skills) if candidate.missing_skills else []

    email_data = generate_outreach_email(
        candidate_name=candidate.candidate_name or "Candidate",
        job_title=posting.title or "Software Role",
        email_type=req.email_type,
        matched_skills=matched,
        missing_skills=missing,
        company_name=company
    )

    return {
        "success": True,
        "candidate_id": candidate.id,
        "email_type": req.email_type,
        "company_name": company,
        "recruiter_name": recruiter_name,
        "recruiter_title": current_user.recruiter_title,
        **email_data
    }


@router.delete("/job/{job_posting_id}")
def delete_job_campaign(
    job_posting_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Delete a job posting campaign and all associated candidate matches."""
    success = delete_job_posting(db, current_user.id, job_posting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job campaign not found")
    return {"success": True, "message": "Campaign successfully deleted"}


@router.patch("/candidate/{candidate_id}/status")
def update_candidate_workflow_status(
    candidate_id: int,
    req: UpdateCandidateWorkflowRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Update candidate pipeline stage ('shortlisted', 'rejected', etc.), notes, and star rating."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    if req.status is not None:
        candidate.status = req.status
    if req.notes is not None:
        candidate.notes = req.notes
    if req.star_rating is not None:
        candidate.star_rating = max(0, min(5, req.star_rating))

    db.commit()
    db.refresh(candidate)

    return {
        "success": True,
        "candidate_id": candidate.id,
        "status": candidate.status,
        "notes": candidate.notes,
        "star_rating": candidate.star_rating
    }


@router.get("/candidate/{candidate_id}/pitch")
def get_candidate_elevator_pitch(
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Generate or retrieve the AI 30-Second Candidate Elevator Pitch."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    # If already generated and cached, return it
    if candidate.summary_pitch:
        try:
            pitch_json = json.loads(candidate.summary_pitch)
            return {"success": True, "candidate_id": candidate.id, **pitch_json}
        except Exception:
            pass

    posting = candidate.job_posting
    matched = json.loads(candidate.matched_skills) if candidate.matched_skills else []
    missing = json.loads(candidate.missing_skills) if candidate.missing_skills else []

    pitch_data = generate_candidate_pitch(
        candidate_name=candidate.candidate_name or "Candidate",
        resume_text=candidate.resume_text or "",
        job_title=posting.title or "Software Role",
        matched_skills=matched,
        missing_skills=missing
    )

    # Cache result
    candidate.summary_pitch = json.dumps(pitch_data)
    db.commit()

    return {
        "success": True,
        "candidate_id": candidate.id,
        **pitch_data
    }


@router.get("/candidate/{candidate_id}/scorecard")
def get_candidate_interview_scorecard(
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Generate a standardized 1-page technical and behavioral Interview Scorecard & Rubric."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    posting = candidate.job_posting
    matched = json.loads(candidate.matched_skills) if candidate.matched_skills else []
    missing = json.loads(candidate.missing_skills) if candidate.missing_skills else []

    scorecard_data = generate_interview_scorecard_rubric(
        candidate_name=candidate.candidate_name or "Candidate",
        job_title=posting.title or "Software Role",
        matched_skills=matched,
        missing_skills=missing,
        job_description=posting.job_description or ""
    )

    return {
        "success": True,
        "candidate_id": candidate.id,
        "overall_score": candidate.overall_score,
        "seniority_level": candidate.seniority_level,
        **scorecard_data
    }


@router.get("/candidate/{candidate_id}/pdf")
def get_candidate_resume_pdf(
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Stream the candidate's original PDF resume directly from the database for the in-app PDF viewer."""
    candidate = db.query(CandidateMatch).join(JobPosting).filter(
        CandidateMatch.id == candidate_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")

    if not candidate.resume_pdf_data:
        raise HTTPException(status_code=404, detail="Original PDF data not stored for this candidate record.")

    filename = candidate.resume_filename or f"candidate_{candidate.id}_resume.pdf"
    safe_filename = filename.replace('"', '')

    return Response(
        content=candidate.resume_pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{safe_filename}"',
            "Cache-Control": "public, max-age=3600"
        }
    )
