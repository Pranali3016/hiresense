from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Production-grade connection pool with liveness checks and auto-reconnection
engine_kwargs = {
    "pool_pre_ping": True,     # Test connection liveness before checking out from pool
    "pool_recycle": 300,       # Recycle connections every 5 minutes to prevent stale dropped sockets
}

# Apply pool size limits only for PostgreSQL / MySQL (SQLite does not support pool_size with static pool)
if not settings.database_url.startswith("sqlite"):
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Resilient database session dependency.
    Automatically rolls back uncommitted transactions on error and closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()