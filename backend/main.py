from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireSense API",
    description="AI-powered resume intelligence system",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(api_router, prefix="/api/v1")

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "HireSense API is running", "status": "ok"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy"}