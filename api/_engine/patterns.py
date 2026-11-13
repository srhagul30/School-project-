"""
Pattern-level extraction: dates, times, amounts, phone numbers and emails.

These are the building blocks used by the offline reader and by the
highlighter that marks facts on the original circular.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

MONTHS = (
    r"Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?"
    r"|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?"
)
WEEKDAY = r"(?:(?:Mon|Tues?|Wed(?:nes)?|Thu(?:rs)?|Fri|Sat(?:ur)?|Sun)(?:day)?,?\s+)?"
ORD = r"(?:st|nd|rd|th)?"

DATE_RE = re.compile(
    rf"\b{WEEKDAY}(?:"
    rf"\d{{1,2}}{ORD}\s+(?:of\s+)?(?:{MONTHS})\.?(?:,?\s+\d{{4}})?"
    rf"|(?:{MONTHS})\.?\s+\d{{1,2}}{ORD}(?:,?\s+\d{{4}})?"
    rf"|\d{{1,2}}[/.-]\d{{1,2}}[/.-](?:\d{{4}}|\d{{2}})"
    rf")(?![\w/])",
    re.I,
)
_TIME = r"\b\d{1,2}(?:[:.]\d{2})?\s*(?:[ap]\.m(?:\.(?=\s*[a-z,;]))?|[ap]m)(?![a-z])"
TIME_RE = re.compile(_TIME, re.I)
TIME_RANGE_RE = re.compile(rf"{_TIME}\s*(?:to|-|–|—|until|till)\s*{_TIME}", re.I)
MONEY_RE = re.compile(r"(?:Rs\.?|INR|₹|\$|USD|AED|€|£)\s?\d[\d,]*(?:\.\d{1,2})?(?:\s?/-)?", re.I)
PHONE_RE = re.compile(r"(?<![\w/.-])(?:\+\d{1,3}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{3,5}[\s-]?\d{2,5}(?![\w/])")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+", re.I)

_WEEKDAY_PREFIX = re.compile(rf"^{WEEKDAY}", re.I)
_NUMERIC_DATE = re.compile(r"^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$")

MONTH_INDEX = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _digits(s: str) -> int:
    return sum(c.isdigit() for c in s)


def find_dates(text: str) -> list[str]:
    return [m.group(0).strip() for m in DATE_RE.finditer(text)]


def find_times(text: str) -> list[str]:
    return [m.group(0).strip() for m in TIME_RE.finditer(text)]


def find_time_range(text: str) -> str | None:
    m = TIME_RANGE_RE.search(text)
    if not m:
        return None
    return re.sub(r"\s*(?:-|–|—|until|till|\bto\b)\s*", " – ", m.group(0), count=1, flags=re.I)


def find_money(text: str) -> list[str]:
    return [m.group(0).strip() for m in MONEY_RE.finditer(text)]


def find_emails(text: str) -> list[str]:
    return [m.group(0) for m in EMAIL_RE.finditer(text)]


def find_phones(text: str) -> list[str]:
    """Phone numbers have 10–13 digits; this rules out years and reference numbers."""
    out = []
    for m in PHONE_RE.finditer(text):
        p = m.group(0).strip()
        if 10 <= _digits(p) <= 13 and not _NUMERIC_DATE.match(p):
            out.append(p)
    return out


def to_iso_date(raw: str, fallback_year: int) -> str:
    """'Saturday, 9th January 2027' -> '2027-01-09'. Day-first for numeric dates."""
    s = _WEEKDAY_PREFIX.sub("", raw)
    s = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", s, flags=re.I)
    s = re.sub(r"\bof\s+", "", s, flags=re.I).replace(",", " ").strip()

    day = month = year = None
    if m := re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$", s):
        day, month, year = int(m[1]), int(m[2]), int(m[3])
        if year < 100:
            year += 2000
    elif m := re.match(r"^(\d{1,2})\s+([A-Za-z]+)\.?(?:\s+(\d{4}))?", s):
        day, month = int(m[1]), MONTH_INDEX.get(m[2][:3].lower())
        year = int(m[3]) if m[3] else fallback_year
    elif m := re.match(r"^([A-Za-z]+)\.?\s+(\d{1,2})(?:\s+(\d{4}))?", s):
        month, day = MONTH_INDEX.get(m[1][:3].lower()), int(m[2])
        year = int(m[3]) if m[3] else fallback_year

    if not day or not month or not year or day > 31 or month > 12:
        return ""
    return f"{year}-{month:02d}-{day:02d}"


def to_time24(raw: str) -> str:
    """'4:45 PM' -> '16:45'."""
    m = re.search(r"(\d{1,2})(?:[:.](\d{2}))?\s*([ap])", raw, re.I)
    if not m:
        return ""
    h = int(m[1]) % 12 + (12 if m[3].lower() == "p" else 0)
    return f"{h:02d}:{m[2] or '00'}"


def word_count(text: str) -> int:
    return len(text.split())


# --------------------------------------------------------------------------
# Highlight spans
# --------------------------------------------------------------------------

@dataclass
class Span:
    start: int
    end: int
    kind: str  # date | time | money | contact


def find_spans(text: str) -> list[dict]:
    """
    Non-overlapping fact spans for the highlighter. Offsets are UTF-16 code
    units so they line up with JavaScript string indices in the browser.
    """
    candidates: list[Span] = []

    def push(pattern: re.Pattern, kind: str, keep=None):
        for m in pattern.finditer(text):
            if keep and not keep(m.group(0)):
                continue
            candidates.append(Span(m.start(), m.end(), kind))

    # Order sets priority when spans overlap.
    push(EMAIL_RE, "contact")
    push(PHONE_RE, "contact", lambda s: 10 <= _digits(s) <= 13)
    push(MONEY_RE, "money")
    push(TIME_RANGE_RE, "time")
    push(TIME_RE, "time")
    push(DATE_RE, "date")

    taken: list[Span] = []
    for c in candidates:
        if not any(c.start < t.end and c.end > t.start for t in taken):
            taken.append(c)
    taken.sort(key=lambda s: s.start)

    # Convert code-point offsets to UTF-16 offsets (differs only for astral characters).
    if all(ord(ch) < 0x10000 for ch in text):
        return [{"start": s.start, "end": s.end, "kind": s.kind} for s in taken]
    prefix = [0]
    for ch in text:
        prefix.append(prefix[-1] + (2 if ord(ch) >= 0x10000 else 1))
    return [{"start": prefix[s.start], "end": prefix[s.end], "kind": s.kind} for s in taken]
