from fastapi import APIRouter
from app.api import resume, analyze, syllabus, interview, auth, dashboard, progress, onboarding, oauth, recruiter

api_router = APIRouter()
api_router.include_router(resume.router, prefix="/resume", tags=["Resume"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
api_router.include_router(syllabus.router, prefix="/syllabus", tags=["Syllabus"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["Onboarding"])
api_router.include_router(oauth.router, prefix="/oauth", tags=["OAuth"])
api_router.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
