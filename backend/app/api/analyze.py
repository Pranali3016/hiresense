from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.agent import run_agent

router = APIRouter()

@router.post("/resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    AI Agent powered resume analysis.
    Uses LangGraph agent with RAG semantic matching and Groq AI.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    file_bytes = await file.read()
    
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB")
    
    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")
    
    result = run_agent(file_bytes, job_description)
    return result
