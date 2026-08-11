from sqlalchemy.orm import Session
from app.services.resume_parser import parse_resume
from app.services.jd_parser import parse_jd
from app.services.scorer import score_resume_against_jd
from app.models.user import JobPosting, CandidateMatch
import json

MAX_RESUMES_PER_BATCH = 25


def create_job_posting(db: Session, recruiter_id: int, job_description: str) -> tuple:
    """Parse the JD once, save it as a job posting for this recruiter."""
    jd_data = parse_jd(job_description)
    posting = JobPosting(
        recruiter_id=recruiter_id,
        title=jd_data.get("job_title", "")[:200],
        job_description=job_description,
    )
    db.add(posting)
    db.commit()
    db.refresh(posting)
    return posting, jd_data


def score_and_save_candidate(db: Session, job_posting_id: int, jd_data: dict, file_bytes: bytes, filename: str) -> CandidateMatch:
    """Parse one resume, score it against the already-parsed JD, save the result."""
    resume_data = parse_resume(file_bytes)
    score_data = score_resume_against_jd(resume_data, jd_data)

    candidate = CandidateMatch(
        job_posting_id=job_posting_id,
        candidate_name=resume_data.get("name") or filename,
        resume_filename=filename,
        overall_score=int(score_data.get("overall_score", 0)),
        matched_skills=json.dumps(score_data.get("matched_skills", [])),
        missing_skills=json.dumps(score_data.get("missing_skills", [])),
        explanation=score_data.get("explanation", ""),
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def get_ranked_candidates(db: Session, job_posting_id: int) -> list:
    """Return all candidates for a job posting, sorted best match first."""
    candidates = (
        db.query(CandidateMatch)
        .filter(CandidateMatch.job_posting_id == job_posting_id)
        .order_by(CandidateMatch.overall_score.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "candidate_name": c.candidate_name,
            "resume_filename": c.resume_filename,
            "overall_score": c.overall_score,
            "matched_skills": json.loads(c.matched_skills) if c.matched_skills else [],
            "missing_skills": json.loads(c.missing_skills) if c.missing_skills else [],
            "explanation": c.explanation,
        }
        for c in candidates
    ]
