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
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hiresense-seven.vercel.app"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "HireSense API is running", "status": "ok"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy"}