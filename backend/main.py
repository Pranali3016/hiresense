from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.router import api_router
import traceback

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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    response = JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"}
    )
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response

# Include all routes
app.include_router(api_router, prefix="/api/v1")

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "HireSense API is running", "status": "ok"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy"}