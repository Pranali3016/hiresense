from fastapi import APIRouter
from app.api import resume, analyze, syllabus

api_router = APIRouter()
api_router.include_router(resume.router, prefix="/resume", tags=["Resume"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
api_router.include_router(syllabus.router, prefix="/syllabus", tags=["Syllabus"])
