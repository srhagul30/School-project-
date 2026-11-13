"""Builds an .ics calendar file for the event in a notice (RFC 5545)."""
from __future__ import annotations

import re
import uuid
from datetime import date, datetime, timedelta, timezone

NOT_SET = {"not mentioned", "none mentioned", ""}


def _esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def _fold(line: str) -> str:
    """Lines longer than 75 octets are folded with CRLF + space."""
    out, b = [], line.encode("utf-8")
    while len(b) > 74:
        cut = 74
        while cut > 0 and (b[cut] & 0xC0) == 0x80:  # don't split a UTF-8 character
            cut -= 1
        out.append(b[:cut].decode("utf-8"))
        b = b" " + b[cut:]
    out.append(b.decode("utf-8"))
    return "\r\n".join(out)


def build_ics(title: str, school: str, cal: dict, key: dict) -> str:
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", cal.get("date", "")):
        raise ValueError("No single event date to add to a calendar.")
    d = cal["date"].replace("-", "")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NoticeBridge//School Notice//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT", f"UID:{uuid.uuid4()}@noticebridge", f"DTSTAMP:{stamp}",
    ]
    start = cal.get("start") or ""
    if re.match(r"^\d{2}:\d{2}$", start):
        end = cal.get("end") or ""
        if not re.match(r"^\d{2}:\d{2}$", end):
            h, m = map(int, start.split(":"))
            end = f"{min(23, h + 1):02d}:{m:02d}"
        # Floating local time: shows at the same clock time in any timezone.
        lines += [f"DTSTART:{d}T{start.replace(':', '')}00", f"DTEND:{d}T{end.replace(':', '')}00"]
    else:
        nxt = date.fromisoformat(cal["date"]) + timedelta(days=1)
        lines += [f"DTSTART;VALUE=DATE:{d}", f"DTEND;VALUE=DATE:{nxt.strftime('%Y%m%d')}"]

    labels = [("Time", "timings"), ("Deadline", "deadline"), ("Fee", "feeOrAmount"), ("Wear", "dressCode"), ("Contact", "contactPerson")]
    desc = "\n".join(f"{label}: {key[k]}" for label, k in labels if str(key.get(k, "")).lower() not in NOT_SET)
    lines += [_fold(f"SUMMARY:{_esc(f'{title} – {school}')}"), _fold(f"DESCRIPTION:{_esc(desc)}")]
    venue = str(key.get("venue", ""))
    if venue.lower() not in NOT_SET:
        lines.append(_fold(f"LOCATION:{_esc(venue)}"))
    lines += [
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", _fold(f"DESCRIPTION:{_esc(title)} is tomorrow"), "END:VALARM",
        "END:VEVENT", "END:VCALENDAR",
    ]
    return "\r\n".join(lines) + "\r\n"
