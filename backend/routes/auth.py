import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from database import get_conn
from schemas import Token
from security import create_access_token, verify_password, require_admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Simple in-memory brute-force protection: 8 failed logins per client per 10 minutes.
MAX_FAILURES = 8
WINDOW_SECONDS = 600
_failures: dict[str, deque] = defaultdict(deque)


def _client_id(request: Request) -> str:
    # Behind a proxy (Render) the last X-Forwarded-For entry is the one the proxy itself appended.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(client: str) -> None:
    now = time.time()
    q = _failures[client]
    while q and now - q[0] > WINDOW_SECONDS:
        q.popleft()
    if len(q) >= MAX_FAILURES:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many failed attempts. Please try again in a few minutes.")


@router.post("/login", response_model=Token)
def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    client = _client_id(request)
    _check_rate_limit(client)
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM admins WHERE username = ?", (form.username,)).fetchone()
    if not row or not verify_password(form.password, row["password_hash"]):
        _failures[client].append(time.time())
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect username or password")
    _failures.pop(client, None)
    return Token(access_token=create_access_token(row["username"]))


@router.get("/me")
def me(username: str = Depends(require_admin)):
    return {"username": username}
