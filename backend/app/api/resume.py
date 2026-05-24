from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_parser import parse_resume

router = APIRouter()

@router.post("/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload a PDF resume and get extracted information back.
    """
    # Check file is PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Check file size - max 5MB
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )

    # Parse the resume
    result = parse_resume(file_bytes)

    return {
        "success": True,
        "filename": file.filename,
        "data": result
    }

@router.get("/health")
def resume_health():
    return {"status": "resume service running"}
