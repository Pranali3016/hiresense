import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User

router = APIRouter()


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "candidate"  # "candidate" or "recruiter"
    company_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RecruiterOnboardingRequest(BaseModel):
    company_name: str
    company_website: Optional[str] = None
    recruiter_title: Optional[str] = "Talent Acquisition Lead"
    company_size: Optional[str] = "11-50 employees"
    hiring_domain: Optional[str] = "Engineering & Technology"


class AuthResponse(BaseModel):
    access_token: str
    email: str
    name: Optional[str] = None
    role: str
    onboarding_completed: bool
    company_name: Optional[str] = None
    recruiter_title: Optional[str] = None


@router.post("/signup", response_model=AuthResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    email_lower = data.email.lower().strip()

    # Common email domain typo detection
    typo_domains = [
        "@gmail.comm", "@gmail.con", "@gmail.co", "@gmai.com", "@gamil.com",
        "@yahoo.comm", "@yahoo.con", "@yahooo.com",
        "@hotmail.comm", "@hotmail.con",
        "@outlook.comm", "@outlook.con"
    ]
    for typo in typo_domains:
        if email_lower.endswith(typo):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid email domain typo detected ({typo}). Please check your email spelling."
            )

    existing = db.query(User).filter(User.email == email_lower).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    if not data.name or not data.name.strip():
        raise HTTPException(status_code=400, detail="Please enter your name")

    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    if not re.search(r"[A-Za-z]", data.password) or not re.search(r"[0-9]", data.password):
        raise HTTPException(status_code=400, detail="Password must contain both letters and numbers for security")

    new_user = User(
        email=email_lower,
        name=data.name.strip(),
        hashed_password=hash_password(data.password),
        role=data.role if data.role in ("candidate", "recruiter") else "candidate",
        company_name=data.company_name.strip() if data.company_name else None,
        onboarding_completed=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.email)
    return AuthResponse(
        access_token=token,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        onboarding_completed=new_user.onboarding_completed,
        company_name=new_user.company_name,
        recruiter_title=new_user.recruiter_title
    )


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password, or this account uses Google/LinkedIn sign-in")

    token = create_access_token(user.id, user.email)
    return AuthResponse(
        access_token=token,
        email=user.email,
        name=user.name,
        role=user.role,
        onboarding_completed=user.onboarding_completed,
        company_name=user.company_name,
        recruiter_title=user.recruiter_title
    )


@router.post("/recruiter-onboarding")
def complete_recruiter_onboarding(
    data: RecruiterOnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save recruiter company details and complete step-by-step onboarding."""
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiter accounts can access recruiter onboarding")

    current_user.company_name = data.company_name.strip()
    current_user.company_website = data.company_website.strip() if data.company_website else None
    current_user.recruiter_title = data.recruiter_title.strip() if data.recruiter_title else "Talent Acquisition Lead"
    current_user.company_size = data.company_size
    current_user.hiring_domain = data.hiring_domain
    current_user.onboarding_completed = True

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Recruiter profile setup completed!",
        "company_name": current_user.company_name,
        "recruiter_title": current_user.recruiter_title,
        "onboarding_completed": True
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "target_role": current_user.target_role,
        "location": current_user.location,
        "company_name": current_user.company_name,
        "company_website": current_user.company_website,
        "recruiter_title": current_user.recruiter_title,
        "company_size": current_user.company_size,
        "hiring_domain": current_user.hiring_domain,
        "has_resume": bool(current_user.resume_text),
        "onboarding_completed": current_user.onboarding_completed,
        "oauth_provider": current_user.oauth_provider,
    }
