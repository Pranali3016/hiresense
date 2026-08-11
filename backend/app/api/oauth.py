import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.core.auth import create_access_token
from app.models.user import User

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


def _redirect_uri(provider: str) -> str:
    return f"{settings.backend_base_url}/api/v1/oauth/{provider}/callback"


def _frontend_redirect(token=None, email=None, name=None, onboarding_completed=None, error=None) -> str:
    if error:
        return f"{settings.frontend_base_url}/oauth/callback?error={error}"
    return (
        f"{settings.frontend_base_url}/oauth/callback"
        f"?token={token}&email={email}&name={name}&onboarding_completed={str(onboarding_completed).lower()}"
    )


def _find_or_create_oauth_user(db: Session, email: str, name: str, provider: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(email=email, name=name, hashed_password=None, oauth_provider=provider)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/google/login")
def google_login():
    if not settings.google_oauth_client_id:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server")
    params = {
        "client_id": settings.google_oauth_client_id,
        "redirect_uri": _redirect_uri("google"),
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/google/callback")
def google_callback(code: str = None, error: str = None, db: Session = Depends(get_db)):
    if error or not code:
        return RedirectResponse(_frontend_redirect(error=error or "access_denied"))

    with httpx.Client() as client:
        token_res = client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_oauth_client_id,
            "client_secret": settings.google_oauth_client_secret,
            "redirect_uri": _redirect_uri("google"),
            "grant_type": "authorization_code",
        })
        if token_res.status_code != 200:
            return RedirectResponse(_frontend_redirect(error="token_exchange_failed"))
        access_token = token_res.json().get("access_token")

        userinfo_res = client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        if userinfo_res.status_code != 200:
            return RedirectResponse(_frontend_redirect(error="userinfo_failed"))
        info = userinfo_res.json()

    email = info.get("email")
    name = info.get("name", "")
    if not email:
        return RedirectResponse(_frontend_redirect(error="no_email"))

    user = _find_or_create_oauth_user(db, email, name, "google")
    jwt_token = create_access_token(user.id, user.email)
    return RedirectResponse(_frontend_redirect(jwt_token, user.email, user.name or "", user.onboarding_completed))


@router.get("/linkedin/login")
def linkedin_login():
    if not settings.linkedin_oauth_client_id:
        raise HTTPException(status_code=500, detail="LinkedIn OAuth is not configured on the server")
    params = {
        "response_type": "code",
        "client_id": settings.linkedin_oauth_client_id,
        "redirect_uri": _redirect_uri("linkedin"),
        "scope": "openid profile email",
        "state": secrets.token_urlsafe(16),
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{LINKEDIN_AUTH_URL}?{query}")


@router.get("/linkedin/callback")
def linkedin_callback(code: str = None, error: str = None, db: Session = Depends(get_db)):
    if error or not code:
        return RedirectResponse(_frontend_redirect(error=error or "access_denied"))

    with httpx.Client() as client:
        token_res = client.post(
            LINKEDIN_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": _redirect_uri("linkedin"),
                "client_id": settings.linkedin_oauth_client_id,
                "client_secret": settings.linkedin_oauth_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if token_res.status_code != 200:
            return RedirectResponse(_frontend_redirect(error="token_exchange_failed"))
        access_token = token_res.json().get("access_token")

        userinfo_res = client.get(LINKEDIN_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        if userinfo_res.status_code != 200:
            return RedirectResponse(_frontend_redirect(error="userinfo_failed"))
        info = userinfo_res.json()

    email = info.get("email")
    name = info.get("name", "")
    if not email:
        return RedirectResponse(_frontend_redirect(error="no_email"))

    user = _find_or_create_oauth_user(db, email, name, "linkedin")
    jwt_token = create_access_token(user.id, user.email)
    return RedirectResponse(_frontend_redirect(jwt_token, user.email, user.name or "", user.onboarding_completed))
