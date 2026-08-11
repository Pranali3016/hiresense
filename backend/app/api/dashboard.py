from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, Analysis, UserSkillProgress, UserInterviewProgress
from app.models.syllabus import Skill, Module, Subtopic, Week, InterviewQuestion
import json

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """All the numbers and lists needed for the dashboard home page."""

    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    total_analyses = len(analyses)
    avg_score = round(sum(a.overall_score for a in analyses) / total_analyses, 1) if total_analyses > 0 else 0

    recent_analyses = [
        {
            "id": a.id,
            "job_title": a.job_title,
            "overall_score": a.overall_score,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses[:5]
    ]

    progress_rows = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == current_user.id)
        .all()
    )

    skill_ids = [row.skill_id for row in progress_rows]

    skills_by_id = {}
    subtopic_totals_by_skill = {}
    if skill_ids:
        skills_by_id = {s.id: s for s in db.query(Skill).filter(Skill.id.in_(skill_ids)).all()}

        subtopic_counts = (
            db.query(Week.skill_id, func.count(Subtopic.id))
            .join(Module, Module.week_id == Week.id)
            .join(Subtopic, Subtopic.module_id == Module.id)
            .filter(Week.skill_id.in_(skill_ids))
            .group_by(Week.skill_id)
            .all()
        )
        subtopic_totals_by_skill = {skill_id: count for skill_id, count in subtopic_counts}

    skills_improved = 0
    continue_learning = []

    for row in progress_rows:
        skill = skills_by_id.get(row.skill_id)
        if not skill:
            continue

        total_subtopics = subtopic_totals_by_skill.get(skill.id, 0)
        completed_ids = json.loads(row.subtopics_completed) if row.subtopics_completed else []
        completed_count = len(completed_ids)

        percent = round((completed_count / total_subtopics) * 100) if total_subtopics > 0 else 0

        # Only counts as "improved" once the ENTIRE syllabus for that skill is complete
        if total_subtopics > 0 and completed_count >= total_subtopics:
            skills_improved += 1

        if 0 < percent < 100:
            continue_learning.append({"skill": skill.name, "percent": percent})

    # An interview set only counts as "touched" once EVERY question for that skill is completed
    interview_sets_touched = 0
    skill_ids_with_questions = [row[0] for row in db.query(InterviewQuestion.skill_id).distinct().all()]

    if skill_ids_with_questions:
        total_questions_by_skill = dict(
            db.query(InterviewQuestion.skill_id, func.count(InterviewQuestion.id))
            .filter(InterviewQuestion.skill_id.in_(skill_ids_with_questions))
            .group_by(InterviewQuestion.skill_id)
            .all()
        )

        completed_question_ids = [
            r.question_id for r in
            db.query(UserInterviewProgress)
            .filter(UserInterviewProgress.user_id == current_user.id, UserInterviewProgress.completed == True)
            .all()
        ]

        if completed_question_ids:
            completed_by_skill = dict(
                db.query(InterviewQuestion.skill_id, func.count(InterviewQuestion.id))
                .filter(InterviewQuestion.id.in_(completed_question_ids))
                .group_by(InterviewQuestion.skill_id)
                .all()
            )

            for skill_id, total in total_questions_by_skill.items():
                if total > 0 and completed_by_skill.get(skill_id, 0) >= total:
                    interview_sets_touched += 1

    skill_counts = {}
    for a in analyses:
        if not a.matched_skills:
            continue
        for skill in json.loads(a.matched_skills):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1

    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    top_skills = [{"skill": s, "count": c} for s, c in top_skills]

    return {
        "total_analyses": total_analyses,
        "average_match_score": avg_score,
        "skills_improved": skills_improved,
        "interview_sets_touched": interview_sets_touched,
        "recent_analyses": recent_analyses,
        "continue_learning": continue_learning[:6],
        "top_skills": top_skills,
    }


@router.get("/history")
def get_analysis_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Full archive of every analysis the user has ever run (Dashboard only shows the latest 5)."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return {
        "analyses": [
            {
                "id": a.id,
                "job_title": a.job_title,
                "overall_score": a.overall_score,
                "matched_skills": json.loads(a.matched_skills) if a.matched_skills else [],
                "missing_skills": json.loads(a.missing_skills) if a.missing_skills else [],
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in analyses
        ]
    }


@router.get("/skill-gaps")
def get_skill_gaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Missing skills aggregated across every analysis, ranked by how often they recur."""
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).all()
    total_analyses = len(analyses)

    gap_counts = {}
    for a in analyses:
        if not a.missing_skills:
            continue
        for skill in json.loads(a.missing_skills):
            gap_counts[skill] = gap_counts.get(skill, 0) + 1

    gaps = sorted(gap_counts.items(), key=lambda x: x[1], reverse=True)
    return {
        "total_analyses": total_analyses,
        "gaps": [
            {
                "skill": s,
                "count": c,
                "percent_of_analyses": round((c / total_analyses) * 100) if total_analyses else 0,
            }
            for s, c in gaps
        ],
    }


@router.get("/roadmaps")
def get_roadmaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Every skill the user has started learning, with full progress (not capped like the dashboard preview)."""
    progress_rows = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == current_user.id)
        .all()
    )
    skill_ids = [row.skill_id for row in progress_rows]

    skills_by_id = {}
    subtopic_totals = {}
    if skill_ids:
        skills_by_id = {s.id: s for s in db.query(Skill).filter(Skill.id.in_(skill_ids)).all()}
        counts = (
            db.query(Week.skill_id, func.count(Subtopic.id))
            .join(Module, Module.week_id == Week.id)
            .join(Subtopic, Subtopic.module_id == Module.id)
            .filter(Week.skill_id.in_(skill_ids))
            .group_by(Week.skill_id)
            .all()
        )
        subtopic_totals = {sid: c for sid, c in counts}

    roadmaps = []
    for row in progress_rows:
        skill = skills_by_id.get(row.skill_id)
        if not skill:
            continue
        total = subtopic_totals.get(skill.id, 0)
        completed_ids = json.loads(row.subtopics_completed) if row.subtopics_completed else []
        completed = len(completed_ids)
        percent = round((completed / total) * 100) if total > 0 else 0
        roadmaps.append({
            "skill": skill.name,
            "percent": percent,
            "completed": completed,
            "total": total,
        })

    roadmaps.sort(key=lambda r: r["percent"])
    return {"roadmaps": roadmaps}


@router.get("/interview-sets")
def get_interview_sets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Every skill the user has touched interview questions for, with progress."""
    completed_rows = (
        db.query(UserInterviewProgress)
        .filter(UserInterviewProgress.user_id == current_user.id, UserInterviewProgress.completed == True)
        .all()
    )
    completed_qids = [r.question_id for r in completed_rows]
    if not completed_qids:
        return {"sets": []}

    touched_skill_ids = [
        row[0] for row in
        db.query(InterviewQuestion.skill_id).filter(InterviewQuestion.id.in_(completed_qids)).distinct().all()
    ]
    skills_by_id = {s.id: s for s in db.query(Skill).filter(Skill.id.in_(touched_skill_ids)).all()}

    total_by_skill = dict(
        db.query(InterviewQuestion.skill_id, func.count(InterviewQuestion.id))
        .filter(InterviewQuestion.skill_id.in_(touched_skill_ids))
        .group_by(InterviewQuestion.skill_id)
        .all()
    )
    completed_by_skill = dict(
        db.query(InterviewQuestion.skill_id, func.count(InterviewQuestion.id))
        .filter(InterviewQuestion.id.in_(completed_qids))
        .group_by(InterviewQuestion.skill_id)
        .all()
    )

    sets = []
    for sid, skill in skills_by_id.items():
        total = total_by_skill.get(sid, 0)
        done = completed_by_skill.get(sid, 0)
        sets.append({
            "skill": skill.name,
            "completed": done,
            "total": total,
            "percent": round((done / total) * 100) if total else 0,
        })

    sets.sort(key=lambda s: s["percent"])
    return {"sets": sets}
