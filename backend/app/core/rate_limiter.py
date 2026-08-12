import time
from collections import defaultdict
from fastapi import Request, HTTPException

class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter per IP or user token.
    Cleans up expired timestamps automatically.
    """
    def __init__(self, requests_limit: int = 30, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def check(self, key: str):
        now = time.time()
        window_start = now - self.window_seconds

        # Prune old request timestamps
        timestamps = [t for t in self.history[key] if t > window_start]
        self.history[key] = timestamps

        if len(timestamps) >= self.requests_limit:
            retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded ({self.requests_limit} reqs/{self.window_seconds}s). Please retry in {retry_after} seconds."
            )

        self.history[key].append(now)


# Standard rate limiters
analysis_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60)   # 15 scans per minute per user/IP
general_limiter = InMemoryRateLimiter(requests_limit=60, window_seconds=60)    # 60 calls per minute


def limit_analysis_requests(request: Request):
    """Dependency to rate limit heavy AI endpoints (resume analysis, recruiter batch ranking)."""
    # Key by user authorization header or client host
    auth = request.headers.get("authorization", "")
    key = auth if auth else (request.client.host if request.client else "unknown")
    analysis_limiter.check(key)


def limit_general_requests(request: Request):
    """Dependency to rate limit standard API endpoints."""
    auth = request.headers.get("authorization", "")
    key = auth if auth else (request.client.host if request.client else "unknown")
    general_limiter.check(key)
