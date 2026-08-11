from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, JobPosting
from app.services.recruiter_service import (
    create_job_posting,
    score_and_save_candidate,
    get_ranked_candidates,
    MAX_RESUMES_PER_BATCH
)

router = APIRouter()


def require_recruiter(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="This feature is only available to recruiter accounts")
    return current_user


@router.post("/rank-candidates")
async def rank_candidates(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")

    if len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least one resume")

    if len(files) > MAX_RESUMES_PER_BATCH:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_RESUMES_PER_BATCH} resumes per batch. You uploaded {len(files)}."
        )

    for f in files:
        if not f.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"'{f.filename}' is not a PDF. Only PDF files allowed.")

    posting, jd_data = create_job_posting(db, current_user.id, job_description)

    results = []
    errors = []
    for f in files:
        try:
            file_bytes = await f.read()
            if len(file_bytes) > 5 * 1024 * 1024:
                errors.append({"filename": f.filename, "error": "File too large (max 5MB)"})
                continue
            candidate = score_and_save_candidate(db, posting.id, jd_data, file_bytes, f.filename)
            results.append(candidate.id)
        except Exception as e:
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
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_posting_id,
        JobPosting.recruiter_id == current_user.id
    ).first()

    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")

    ranked = get_ranked_candidates(db, posting.id)
    return {
        "success": True,
        "job_posting_id": posting.id,
        "job_title": posting.title,
        "job_description": posting.job_description,
        "candidates": ranked
    }


@router.get("/jobs")
def list_my_jobs(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    postings = (
        db.query(JobPosting)
        .filter(JobPosting.recruiter_id == current_user.id)
        .order_by(JobPosting.created_at.desc())
        .all()
    )
    return {
        "success": True,
        "jobs": [
            {
                "id": p.id,
                "title": p.title,
                "candidate_count": len(p.candidates),
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in postings
        ]
    }
