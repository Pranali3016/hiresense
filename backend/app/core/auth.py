from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(plain_password: str) -> str:
    """Scramble a plain password into an unreadable bcrypt hash before storing it."""
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches a stored bcrypt hash in constant time."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: int, email: str) -> str:
    """Create a tamper-proof signed JWT token proving the user's identity."""
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email.lower().strip(),
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Verify cryptographic signature and expiration of the JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except (JWTError, Exception):
        return None


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """
    Strict security dependency that extracts and validates the Bearer token.
    Enforces expiration, subject integrity, and user existence in the database.
    """
    from app.models.user import User

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Missing Bearer token.")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")

    sub = payload.get("sub")
    if not sub or not str(sub).isdigit():
        raise HTTPException(status_code=401, detail="Malformed session token subject.")

    user = db.query(User).filter(User.id == int(sub)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User account no longer exists.")

    return user
