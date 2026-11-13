"""
NoticeBridge API — all notice logic runs here, in Python.

On Vercel this file is a Python serverless function; Next.js rewrites
/api/py/* to it. Locally it runs with uvicorn on port 8000.

Endpoints
  GET  /api/py/status          Is a server-side Gemini key configured?
  POST /api/py/process-notice  Circular text -> parent notice
  POST /api/py/extract-text    PDF upload -> circular text
  POST /api/py/calendar        Notice -> .ics calendar file
"""
from __future__ import annotations

import os
import sys
import time
from collections import defaultdict, deque

sys.path.insert(0, os.path.dirname(__file__))


def _load_local_env() -> None:
    """Locally, read GEMINI_* settings from .env.local / .env (Vercel injects them itself)."""
    if os.environ.get("VERCEL"):
        return
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in (".env.local", ".env"):
        path = os.path.join(root, name)
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                value = value.strip().strip('"').strip("'")
                if value:
                    os.environ.setdefault(key.strip(), value)


_load_local_env()

from fastapi import FastAPI, File, Header, Request, UploadFile  # noqa: E402
from fastapi.responses import JSONResponse, Response  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from _engine.calendar_ics import build_ics  # noqa: E402
from _engine.gemini import GeminiError, analyze_with_gemini  # noqa: E402
from _engine.languages import LANGUAGE_NAMES  # noqa: E402
from _engine.offline import analyze_offline  # noqa: E402
from _engine.pdf_text import PdfTextError, extract_pdf_text  # noqa: E402

MAX_CHARS = 20_000
MAX_PDF_BYTES = 4 * 1024 * 1024  # Vercel's request body limit is 4.5 MB
TONES = {"friendly", "formal", "brief", "urgent"}

app = FastAPI(
    title="NoticeBridge API",
    version="2.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)

# ---------------------------------------------------------------------------
# Rate limiting: in-memory sliding window per IP. Each serverless instance
# keeps its own window, which is enough to blunt floods and protect quota.
# ---------------------------------------------------------------------------
_WINDOW_S, _MAX_HITS = 60, 20
_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "local")


def _rate_limited(key: str) -> int | None:
    now = time.monotonic()
    q = _hits[key]
    while q and now - q[0] > _WINDOW_S:
        q.popleft()
    if len(q) >= _MAX_HITS:
        return int(_WINDOW_S - (now - q[0])) + 1
    q.append(now)
    if len(_hits) > 5000:
        _hits.clear()
    return None


def _error(status: int, message: str, **headers) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=status, headers=headers or None)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/py/status")
def status():
    return {"serverAi": bool((os.environ.get("GEMINI_API_KEY") or "").strip()), "runtime": f"Python {sys.version.split()[0]}"}


class NoticeRequest(BaseModel):
    circularText: str = ""
    schoolName: str = ""
    targetLanguage: str = "Tamil"
    tone: str = "friendly"
    useEmoji: bool = True
    engine: str = "auto"


@app.post("/api/py/process-notice")
def process_notice(body: NoticeRequest, request: Request, x_gemini_key: str | None = Header(default=None)):
    if (wait := _rate_limited(_client_ip(request))) is not None:
        return _error(429, f"Too many requests. Try again in {wait} seconds.", **{"Retry-After": str(wait)})

    text = body.circularText.strip()
    if len(text) < 40:
        return _error(400, "The circular is too short to summarise. Paste the full text (at least a few sentences).")
    if len(text) > MAX_CHARS:
        return _error(413, f"The circular is {len(text):,} characters. The limit is {MAX_CHARS:,}.")

    school = body.schoolName.strip()[:120]
    language = body.targetLanguage if body.targetLanguage in LANGUAGE_NAMES else "Tamil"
    tone = body.tone if body.tone in TONES else "friendly"

    offline = analyze_offline(text, school, language, tone, body.useEmoji)

    # A key typed in the browser takes precedence over the server's key.
    api_key = (x_gemini_key or "").strip() or (os.environ.get("GEMINI_API_KEY") or "").strip()
    if not api_key or body.engine == "offline":
        return offline

    try:
        return analyze_with_gemini(text, school, language, tone, body.useEmoji, api_key, offline)
    except GeminiError as e:
        print(f"[process-notice] Gemini failed, using offline reader: {e}", file=sys.stderr)
        offline["meta"]["fallbackReason"] = str(e)[:200]
        return offline


@app.post("/api/py/extract-text")
async def extract_text(request: Request, file: UploadFile = File(...)):
    if (wait := _rate_limited("pdf:" + _client_ip(request))) is not None:
        return _error(429, f"Too many uploads. Try again in {wait} seconds.")
    data = await file.read(MAX_PDF_BYTES + 1)
    if len(data) > MAX_PDF_BYTES:
        return _error(413, "That PDF is larger than 4 MB. Copy the text in instead.")
    try:
        text, pages = extract_pdf_text(data)
    except PdfTextError as e:
        return _error(415 if str(e).startswith("That file isn't") else 422, str(e))
    return {"text": text, "pages": pages}


class CalendarRequest(BaseModel):
    title: str = Field(max_length=300)
    schoolName: str = Field(default="", max_length=200)
    calendar: dict
    keyDetails: dict


@app.post("/api/py/calendar")
def calendar(body: CalendarRequest):
    try:
        ics = build_ics(body.title, body.schoolName or "School", body.calendar, body.keyDetails)
    except ValueError as e:
        return _error(400, str(e))
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="school-event.ics"'},
    )
