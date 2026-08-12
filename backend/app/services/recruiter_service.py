import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.resume_parser import parse_resume
from app.services.jd_parser import parse_jd
from app.services.scorer import score_resume_against_jd
from app.models.user import JobPosting, CandidateMatch

logger = logging.getLogger(__name__)

MAX_RESUMES_PER_BATCH = 25


def _determine_seniority(yoe: int) -> tuple[str, str]:
    """Return (seniority_level, estimated_salary_range) based on years of experience."""
    if yoe <= 1:
        return "Fresher / Entry-Level", "₹4 - ₹8 LPA"
    elif yoe <= 4:
        return "Junior / Associate", "₹8 - ₹15 LPA"
    elif yoe <= 8:
        return "Mid-Senior", "₹16 - ₹28 LPA"
    elif yoe <= 12:
        return "Senior Specialist", "₹28 - ₹45 LPA"
    else:
        return "Lead / Principal Architect", "₹45 - ₹75+ LPA"


def create_job_posting(db: Session, recruiter_id: int, job_description: str) -> tuple:
    """Parse the JD once, save it as a job posting for this recruiter."""
    jd_data = parse_jd(job_description)
    posting = JobPosting(
        recruiter_id=recruiter_id,
        title=jd_data.get("job_title", "")[:200] or "Software Role",
        job_description=job_description,
    )
    db.add(posting)
    db.commit()
    db.refresh(posting)
    return posting, jd_data


def score_and_save_candidate(
    db: Session,
    job_posting_id: int,
    jd_data: dict,
    file_bytes: bytes,
    filename: str,
    skills_weight: float = 0.5,
    exp_weight: float = 0.3,
    domain_weight: float = 0.2,
    strict_must_haves: bool = False
) -> CandidateMatch:
    """Parse one resume, score it against JD with custom recruiter weights, save the result."""
    resume_data = parse_resume(file_bytes, filename=filename)
    score_data = score_resume_against_jd(resume_data, jd_data)

    raw_score = int(score_data.get("overall_score", 0))
    yoe = int(resume_data.get("experience_years", 0) or 0)
    req_yoe = int(jd_data.get("required_experience_years", 0) or 0)

    # Custom weight recalculation
    # Skills match ratio
    matched_skills = score_data.get("matched_skills", [])
    missing_skills = score_data.get("missing_skills", [])
    total_skills = len(matched_skills) + len(missing_skills)
    skill_ratio = (len(matched_skills) / total_skills) if total_skills > 0 else 0.5

    # Experience match ratio
    if req_yoe > 0:
        exp_ratio = min(1.0, yoe / req_yoe)
    else:
        exp_ratio = 1.0 if yoe >= 1 else 0.7

    # Weighted custom score
    weighted_score = int(round((skill_ratio * skills_weight * 100) + (exp_ratio * exp_weight * 100) + ((raw_score / 100) * domain_weight * 100)))
    final_score = max(5, min(99, weighted_score if (skills_weight != 0.5 or exp_weight != 0.3) else raw_score))

    # Strict Must-Have Skills Gate
    if strict_must_haves and len(missing_skills) > len(matched_skills):
        final_score = int(final_score * 0.75)  # Strict gate penalty for missing critical core skills

    seniority, salary_est = _determine_seniority(yoe)

    candidate = CandidateMatch(
        job_posting_id=job_posting_id,
        candidate_name=resume_data.get("name") or filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title(),
        resume_filename=filename,
        resume_text=resume_data.get("raw_text", "")[:6000],
        overall_score=final_score,
        years_of_experience=yoe,
        seniority_level=seniority,
        estimated_salary_range=salary_est,
        matched_skills=json.dumps(matched_skills),
        missing_skills=json.dumps(missing_skills),
        explanation=score_data.get("explanation", ""),
        status="under_review",
        star_rating=0,
        notes="",
        summary_pitch=None,
        resume_pdf_data=file_bytes
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
            "years_of_experience": c.years_of_experience or 0,
            "seniority_level": c.seniority_level or "Mid-Level",
            "estimated_salary_range": c.estimated_salary_range or "₹12 - ₹24 LPA",
            "matched_skills": json.loads(c.matched_skills) if c.matched_skills else [],
            "missing_skills": json.loads(c.missing_skills) if c.missing_skills else [],
            "explanation": c.explanation or "",
            "resume_text": c.resume_text or "",
            "has_pdf": bool(c.resume_pdf_data is not None),
            "status": c.status or "under_review",
            "notes": c.notes or "",
            "star_rating": c.star_rating or 0,
            "summary_pitch": json.loads(c.summary_pitch) if c.summary_pitch and c.summary_pitch.startswith('{') else c.summary_pitch or None
        }
        for c in candidates
    ]


def get_recruiter_dashboard_stats(db: Session, recruiter_id: int) -> dict:
    """Aggregate high-level recruitment metrics, pipeline funnel, score tiers, and talent spotlight."""
    postings = (
        db.query(JobPosting)
        .filter(JobPosting.recruiter_id == recruiter_id)
        .order_by(JobPosting.created_at.desc())
        .all()
    )

    total_campaigns = len(postings)
    total_candidates = 0
    all_scores = []
    top_score = 0
    all_matched_skills = {}

    funnel = {
        "under_review": 0,
        "shortlisted": 0,
        "interview_scheduled": 0,
        "rejected": 0
    }

    score_tiers = {
        "elite": 0,       # >= 80%
        "strong": 0,      # 65 - 79%
        "moderate": 0,    # 50 - 64%
        "needs_rampup": 0 # < 50%
    }

    spotlight_candidates = []
    campaign_list = []

    for p in postings:
        c_count = len(p.candidates)
        total_candidates += c_count
        p_scores = [c.overall_score for c in p.candidates if c.overall_score is not None]
        p_top = max(p_scores) if p_scores else 0
        p_avg = int(sum(p_scores) / len(p_scores)) if p_scores else 0

        if p_top > top_score:
            top_score = p_top
        all_scores.extend(p_scores)

        # Track top candidate for spotlight
        top_cand = None
        for c in p.candidates:
            st = c.status or "under_review"
            funnel[st] = funnel.get(st, 0) + 1

            sc = c.overall_score or 0
            if sc >= 80:
                score_tiers["elite"] += 1
            elif sc >= 65:
                score_tiers["strong"] += 1
            elif sc >= 50:
                score_tiers["moderate"] += 1
            else:
                score_tiers["needs_rampup"] += 1

            if c.matched_skills:
                try:
                    skills = json.loads(c.matched_skills)
                    for s in skills:
                        all_matched_skills[s] = all_matched_skills.get(s, 0) + 1
                except Exception:
                    pass

            if not top_cand or (c.overall_score or 0) > (top_cand.overall_score or 0):
                top_cand = c

        if top_cand and len(spotlight_candidates) < 4:
            spotlight_candidates.append({
                "id": top_cand.id,
                "candidate_name": top_cand.candidate_name,
                "job_id": p.id,
                "job_title": p.title or "Software Role",
                "overall_score": top_cand.overall_score,
                "seniority_level": top_cand.seniority_level or "Mid-Level",
                "status": top_cand.status or "under_review",
                "star_rating": top_cand.star_rating or 0,
                "matched_skills": json.loads(top_cand.matched_skills) if top_cand.matched_skills else []
            })

        campaign_list.append({
            "id": p.id,
            "title": p.title or "Untitled Campaign",
            "candidate_count": c_count,
            "top_score": p_top,
            "avg_score": p_avg,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "job_description_snippet": (p.job_description or "")[:180] + "..."
        })

    avg_match_score = int(sum(all_scores) / len(all_scores)) if all_scores else 0

    # Top in-demand skills in pool
    sorted_skills = sorted(all_matched_skills.items(), key=lambda x: x[1], reverse=True)[:8]
    top_pool_skills = [{"skill": s, "count": cnt} for s, cnt in sorted_skills]

    return {
        "total_campaigns": total_campaigns,
        "total_candidates": total_candidates,
        "avg_match_score": avg_match_score,
        "top_benchmark_score": top_score,
        "top_pool_skills": top_pool_skills,
        "funnel": funnel,
        "score_tiers": score_tiers,
        "spotlight_candidates": spotlight_candidates,
        "campaigns": campaign_list
    }


def delete_job_posting(db: Session, recruiter_id: int, job_id: int) -> bool:
    """Delete a job posting and its associated candidates."""
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_id,
        JobPosting.recruiter_id == recruiter_id
    ).first()
    if not posting:
        return False
    db.delete(posting)
    db.commit()
    return True
