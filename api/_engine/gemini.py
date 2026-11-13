"""
Gemini client. Asks the model for a structured JSON notice, validates every
field, and fills anything missing from the offline reader's result.
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request

from .patterns import word_count

DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"]
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
TIMEOUT_S = 25

TONE_GUIDE = {
    "friendly": "Warm, plain and reassuring. Short sentences.",
    "formal": "Polite and formal, as a principal would write. No slang.",
    "brief": "As short as possible. Only facts parents must act on.",
    "urgent": "Direct and urgent. Lead with what changed and what parents must do now.",
}

SYSTEM_INSTRUCTION = """You turn formal school circulars from schools in Tamil Nadu, India into messages parents can read in under 30 seconds.

Rules:
- Use only facts stated in the circular. Never invent dates, amounts, venues, names or phone numbers. If something is not stated, write exactly "Not mentioned".
- whatsappNotice: WhatsApp formatting (*bold*, _italic_), short lines, a numbered "What you need to do" list of 2–4 items, and a "Questions" line with the contact. Under 120 words.
- translatedNotice: the same message translated naturally into the target language, in that language's own script. Keep numbers, dates, amounts, phone numbers, emails and proper nouns exactly as written. For Tamil, use simple everyday Tamil that parents in Salem would use, not literary Tamil.
- smsNotice: plain text, no emoji, at most 300 characters.
- audioScript: 3–6 spoken sentences in plain English for text-to-speech. No symbols or emoji.
- calendar.date: the main event date as YYYY-MM-DD, or "" if there is no single event. calendar.start and calendar.end: 24-hour HH:MM, or ""."""

_STR = {"type": "STRING"}
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": _STR,
        "urgency": {"type": "STRING", "enum": ["High", "Medium", "Low"]},
        "category": {"type": "STRING", "enum": ["Exams", "Events", "Fees & Permissions", "Emergency", "Trips", "General"]},
        "whatsappNotice": _STR,
        "translatedNotice": _STR,
        "smsNotice": _STR,
        "audioScript": _STR,
        "keyDetails": {
            "type": "OBJECT",
            "properties": {k: _STR for k in ["eventDate", "timings", "venue", "feeOrAmount", "dressCode", "deadline", "contactPerson"]},
            "required": ["eventDate", "timings", "venue", "feeOrAmount", "dressCode", "deadline", "contactPerson"],
        },
        "calendar": {
            "type": "OBJECT",
            "properties": {"date": _STR, "start": _STR, "end": _STR},
            "required": ["date", "start", "end"],
        },
    },
    "required": ["title", "urgency", "category", "whatsappNotice", "translatedNotice", "smsNotice", "audioScript", "keyDetails", "calendar"],
}


class GeminiError(Exception):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


def _models() -> list[str]:
    configured = (os.environ.get("GEMINI_MODEL") or "").strip()
    return [configured] + [m for m in DEFAULT_MODELS if m != configured] if configured else DEFAULT_MODELS


def _call(model: str, api_key: str, prompt: str) -> str:
    body = json.dumps({
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "responseSchema": RESPONSE_SCHEMA},
    }).encode()
    req = urllib.request.Request(
        ENDPOINT.format(model=model),
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as res:
            data = json.loads(res.read())
    except urllib.error.HTTPError as e:
        try:
            detail = json.loads(e.read()).get("error", {}).get("message", "")
        except Exception:
            detail = ""
        raise GeminiError(detail or f"Gemini returned HTTP {e.code}", e.code) from None
    except (urllib.error.URLError, TimeoutError) as e:
        raise GeminiError(f"Couldn't reach Gemini ({getattr(e, 'reason', e)})") from None

    parts = (((data.get("candidates") or [{}])[0].get("content") or {}).get("parts")) or []
    text = "".join(p.get("text", "") for p in parts)
    if not text:
        raise GeminiError("Gemini returned an empty response")
    return text


def analyze_with_gemini(
    circular_text: str, school_name: str, target_language: str, tone: str, use_emoji: bool,
    api_key: str, base: dict,
) -> dict:
    """`base` is the offline result for the same input; it fills any gap in the model's answer."""
    prompt = (
        f"School name: {school_name or '(use the name in the circular)'}\n"
        f"Target language: {target_language}\n"
        f"Tone: {TONE_GUIDE.get(tone, TONE_GUIDE['friendly'])}\n"
        f"Emoji: {'Use a few simple emoji as line markers in whatsappNotice and translatedNotice.' if use_emoji else 'Do not use any emoji.'}\n\n"
        f'Circular:\n"""\n{circular_text}\n"""'
    )
    last_error: Exception | None = None
    for model in _models():
        try:
            raw = _call(model, api_key, prompt)
            parsed = json.loads(re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip()))
            return _normalise(parsed, base, circular_text, target_language, model)
        except GeminiError as e:
            last_error = e
            # A bad key or exhausted quota fails the same way on every model.
            if e.status in (401, 403, 429) or "api key" in str(e).lower():
                break
        except (ValueError, KeyError, TypeError) as e:
            last_error = GeminiError(f"Gemini returned malformed JSON ({e})")
    raise last_error or GeminiError("Gemini request failed")


def _s(v, fallback: str) -> str:
    return v.strip() if isinstance(v, str) and v.strip() else fallback


def _normalise(p: dict, base: dict, circular_text: str, target_language: str, model: str) -> dict:
    kd = p.get("keyDetails") or {}
    cal = p.get("calendar") or {}
    bkd, bcal = base["keyDetails"], base["calendar"]
    whatsapp = _s(p.get("whatsappNotice"), base["whatsappNotice"])
    iso = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    hhmm = re.compile(r"^\d{2}:\d{2}$")
    original_words, summary_words = word_count(circular_text), word_count(whatsapp)
    categories = ["Exams", "Events", "Fees & Permissions", "Emergency", "Trips", "General"]

    return {
        "title": _s(p.get("title"), base["title"]),
        "urgency": p.get("urgency") if p.get("urgency") in ("High", "Medium", "Low") else base["urgency"],
        "category": p.get("category") if p.get("category") in categories else base["category"],
        "whatsappNotice": whatsapp,
        "translatedNotice": _s(p.get("translatedNotice"), base["translatedNotice"]),
        "smsNotice": _s(p.get("smsNotice"), base["smsNotice"])[:320],
        "audioScript": _s(p.get("audioScript"), base["audioScript"]),
        "targetLanguage": target_language,
        "keyDetails": {k: _s(kd.get(k), bkd[k]) for k in bkd},
        "calendar": {
            "date": cal.get("date") if iso.match(str(cal.get("date", ""))) else bcal["date"],
            "start": cal.get("start") if hhmm.match(str(cal.get("start", ""))) else bcal["start"],
            "end": cal.get("end") if hhmm.match(str(cal.get("end", ""))) else bcal["end"],
        },
        "spans": base["spans"],
        "meta": {
            "engine": "gemini",
            "model": model,
            "originalWords": original_words,
            "summaryWords": summary_words,
            "originalReadSeconds": max(10, round(original_words / 200 * 60)),
            "summaryReadSeconds": max(10, round(summary_words / 200 * 60)),
            "translationNote": None,
        },
    }
