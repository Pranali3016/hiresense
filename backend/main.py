import time
import logging
import traceback
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.router import api_router

# Configure production structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s"
)
logger = logging.getLogger("hiresense.api")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireSense API",
    description="Production-grade AI-powered resume intelligence system",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    "https://hiresense-seven.vercel.app",
    "https://hiresense.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

ALLOWED_ORIGIN_REGEX = r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|https://hiresense[a-zA-Z0-9_-]*\.vercel\.app|https://.*\.onrender\.com)$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Log request telemetry with execution time."""
    start_time = time.time()
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        process_time = round((time.time() - start_time) * 1000, 2)
        logger.info(f"{method} {path} -> {response.status_code} ({process_time}ms)")
        return response
    except Exception as exc:
        process_time = round((time.time() - start_time) * 1000, 2)
        logger.error(f"{method} {path} -> 500 Uncaught ({process_time}ms): {exc}")
        raise exc


def _apply_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Consistent error format for application HTTPExceptions."""
    message = str(exc.detail) if isinstance(exc.detail, str) else "Request error"
    payload = {
        "error": True,
        "message": message,
        "detail": exc.detail,
        "code": f"HTTP_{exc.status_code}"
    }
    response = JSONResponse(status_code=exc.status_code, content=payload)
    return _apply_cors_headers(request, response)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Consistent error format for Pydantic input validation errors."""
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", []) if l != "body"])
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}" if loc else msg)
    
    clean_message = "; ".join(error_messages) if error_messages else "Invalid input data provided."
    payload = {
        "error": True,
        "message": clean_message,
        "detail": clean_message,
        "code": "VALIDATION_ERROR",
        "validation_errors": exc.errors()
    }
    response = JSONResponse(status_code=422, content=payload)
    return _apply_cors_headers(request, response)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Consistent error format for uncaught 500 exceptions with server-side tracing."""
    logger.exception(f"Unhandled server exception on {request.method} {request.url.path}: {exc}")
    payload = {
        "error": True,
        "message": "An unexpected server error occurred. Please try again later.",
        "detail": f"Server error: {str(exc)}",
        "code": "INTERNAL_SERVER_ERROR"
    }
    response = JSONResponse(status_code=500, content=payload)
    return _apply_cors_headers(request, response)


# Include all API routes
app.include_router(api_router, prefix="/api/v1")


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "HireSense API is running in production mode", "status": "ok"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy", "version": "1.0.0"}