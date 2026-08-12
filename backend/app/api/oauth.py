import secrets
import json
import base64
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

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


def _get_backend_base_url(request: Request) -> str:
    """Dynamically determine the backend's public base URL based on incoming request headers."""
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    
    # If request is coming to a public host (e.g. onrender.com)
    if host and "127.0.0.1" not in host and "localhost" not in host:
        return f"{proto}://{host}".rstrip("/")
    
    # Check if backend_base_url is explicitly configured in settings
    if settings.backend_base_url and "127.0.0.1" not in settings.backend_base_url and "localhost" not in settings.backend_base_url:
        return settings.backend_base_url.rstrip("/")
    
    return f"{proto}://{host}".rstrip("/") if host else "http://127.0.0.1:8000"


def _redirect_uri(request: Request, provider: str) -> str:
    base = _get_backend_base_url(request)
    return f"{base}/api/v1/oauth/{provider}/callback"


def _frontend_redirect(token=None, email=None, name=None, onboarding_completed=None, error=None, frontend_url=None) -> str:
    base = frontend_url or settings.frontend_base_url or "http://localhost:5173"
    base = base.rstrip("/")
    if error:
        return f"{base}/oauth/callback?error={error}"
    return (
        f"{base}/oauth/callback"
        f"?token={token}&email={email or ''}&name={name or ''}&onboarding_completed={str(onboarding_completed).lower()}"
    )


def _find_or_create_oauth_user(db: Session, email: str, name: str, provider: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.name and name:
            user.name = name
        if not user.oauth_provider:
            user.oauth_provider = provider
        db.commit()
        db.refresh(user)
        return user
    user = User(email=email, name=name, hashed_password=None, oauth_provider=provider, role="candidate")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/google/login")
def google_login(request: Request, redirect_to: str = None):
    if not settings.google_oauth_client_id or not settings.google_oauth_client_secret:
        return RedirectResponse(_frontend_redirect(error="google_not_configured", frontend_url=redirect_to))

    redirect_uri = _redirect_uri(request, "google")
    state_payload = {"origin": redirect_to, "redirect_uri": redirect_uri} if redirect_to else {"redirect_uri": redirect_uri}
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "client_id": settings.google_oauth_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/google/callback")
def google_callback(request: Request, code: str = None, error: str = None, state: str = None, db: Session = Depends(get_db)):
    frontend_url = None
    redirect_uri = _redirect_uri(request, "google")
    if state:
        try:
            state_data = json.loads(base64.urlsafe_b64decode(state.encode()).decode())
            frontend_url = state_data.get("origin")
            if state_data.get("redirect_uri"):
                redirect_uri = state_data.get("redirect_uri")
        except Exception:
            pass

    if error or not code:
        return RedirectResponse(_frontend_redirect(error=error or "access_denied", frontend_url=frontend_url))

    if not settings.google_oauth_client_id or not settings.google_oauth_client_secret:
        return RedirectResponse(_frontend_redirect(error="google_not_configured", frontend_url=frontend_url))

    try:
        with httpx.Client(timeout=15.0) as client:
            token_res = client.post(GOOGLE_TOKEN_URL, data={
                "code": code,
                "client_id": settings.google_oauth_client_id,
                "client_secret": settings.google_oauth_client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            })
            if token_res.status_code != 200:
                print(f"Google token exchange error: {token_res.status_code} {token_res.text}")
                return RedirectResponse(_frontend_redirect(error="token_exchange_failed", frontend_url=frontend_url))

            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(_frontend_redirect(error="no_access_token", frontend_url=frontend_url))

            userinfo_res = client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
            if userinfo_res.status_code != 200:
                print(f"Google userinfo error: {userinfo_res.status_code} {userinfo_res.text}")
                return RedirectResponse(_frontend_redirect(error="userinfo_failed", frontend_url=frontend_url))
            info = userinfo_res.json()

        email = info.get("email")
        name = info.get("name", "")
        if not email:
            return RedirectResponse(_frontend_redirect(error="no_email", frontend_url=frontend_url))

        user = _find_or_create_oauth_user(db, email, name, "google")
        jwt_token = create_access_token(user.id, user.email)
        return RedirectResponse(_frontend_redirect(jwt_token, user.email, user.name or "", user.onboarding_completed, frontend_url=frontend_url))
    except Exception as e:
        print(f"Google OAuth Exception: {e}")
        return RedirectResponse(_frontend_redirect(error=str(e), frontend_url=frontend_url))


@router.get("/linkedin/login")
def linkedin_login(request: Request, redirect_to: str = None):
    if not settings.linkedin_oauth_client_id or not settings.linkedin_oauth_client_secret:
        return RedirectResponse(_frontend_redirect(error="linkedin_not_configured", frontend_url=redirect_to))

    redirect_uri = _redirect_uri(request, "linkedin")
    state_payload = {"origin": redirect_to, "redirect_uri": redirect_uri, "rnd": secrets.token_urlsafe(8)} if redirect_to else {"redirect_uri": redirect_uri, "rnd": secrets.token_urlsafe(8)}
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "response_type": "code",
        "client_id": settings.linkedin_oauth_client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid profile email",
        "state": state,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{LINKEDIN_AUTH_URL}?{query}")


@router.get("/linkedin/callback")
def linkedin_callback(request: Request, code: str = None, error: str = None, state: str = None, db: Session = Depends(get_db)):
    frontend_url = None
    redirect_uri = _redirect_uri(request, "linkedin")
    if state:
        try:
            state_data = json.loads(base64.urlsafe_b64decode(state.encode()).decode())
            frontend_url = state_data.get("origin")
            if state_data.get("redirect_uri"):
                redirect_uri = state_data.get("redirect_uri")
        except Exception:
            pass

    if error or not code:
        return RedirectResponse(_frontend_redirect(error=error or "access_denied", frontend_url=frontend_url))

    if not settings.linkedin_oauth_client_id or not settings.linkedin_oauth_client_secret:
        return RedirectResponse(_frontend_redirect(error="linkedin_not_configured", frontend_url=frontend_url))

    try:
        with httpx.Client(timeout=15.0) as client:
            token_res = client.post(
                LINKEDIN_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": settings.linkedin_oauth_client_id,
                    "client_secret": settings.linkedin_oauth_client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if token_res.status_code != 200:
                print(f"LinkedIn token exchange error: {token_res.status_code} {token_res.text}")
                return RedirectResponse(_frontend_redirect(error="token_exchange_failed", frontend_url=frontend_url))

            token_data = token_res.json()
            access_token = token_data.get("access_token")

            userinfo_res = client.get(LINKEDIN_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
            if userinfo_res.status_code != 200:
                print(f"LinkedIn userinfo error: {userinfo_res.status_code} {userinfo_res.text}")
                return RedirectResponse(_frontend_redirect(error="userinfo_failed", frontend_url=frontend_url))
            info = userinfo_res.json()

        email = info.get("email")
        name = info.get("name", "")
        if not email:
            return RedirectResponse(_frontend_redirect(error="no_email", frontend_url=frontend_url))

        user = _find_or_create_oauth_user(db, email, name, "linkedin")
        jwt_token = create_access_token(user.id, user.email)
        return RedirectResponse(_frontend_redirect(jwt_token, user.email, user.name or "", user.onboarding_completed, frontend_url=frontend_url))
    except Exception as e:
        print(f"LinkedIn OAuth Exception: {e}")
        return RedirectResponse(_frontend_redirect(error=str(e), frontend_url=frontend_url))
