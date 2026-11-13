"""
Offline reader: a rule-based engine that turns a school circular into a
parent notice without any AI service.

It only reports what it finds in the text. A fact that is not in the
circular is reported as "Not mentioned", never guessed.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date

from .languages import OFFLINE_LABELS
from .patterns import (
    find_dates, find_emails, find_money, find_phones, find_spans, find_time_range,
    find_times, to_iso_date, to_time24, word_count,
)

NOT_MENTIONED = "Not mentioned"
NONE_MENTIONED = "None mentioned"

# --------------------------------------------------------------------------
# Text structure
# --------------------------------------------------------------------------

_ABBREV = re.compile(r"\b(Rs|Mr|Mrs|Ms|Dr|Prof|No|St|Ref|Sr|Jr|Thiru|Tmt|approx|e\.g|i\.e|etc|vs|Govt|Std)\.", re.I)
_DOT = "․"  # placeholder while splitting sentences

CLOSING = re.compile(
    r"^(sincerely|yours\s+(?:sincerely|faithfully|truly)|warm(?:est)?\s+regards|regards|best\s+regards"
    r"|with\s+(?:best|warm)\s+(?:wishes|regards)|thanking\s+you|thank\s+you)[,.!]?$",
    re.I,
)
GREETING = re.compile(r"^(dear|respected)\b", re.I)
SUBJECT = re.compile(r"^(subject|sub|regarding|re)\s*[:.\-]\s*", re.I)
ISSUE_DATE = re.compile(r"^(date|dated)\s*[:.\-]\s*", re.I)
LIST_ITEM = re.compile(r"^(?:\d{1,2}[.)]|[-•*–]|\(?[a-z]\))\s+", re.I)


def split_sentences(paragraph: str) -> list[str]:
    s = _ABBREV.sub(lambda m: m.group(0).replace(".", _DOT), paragraph)
    s = re.sub(r"\b([A-Z])\.(?=\s*[A-Z])", rf"\1{_DOT}", s)  # initials: K. Saravanan
    s = re.sub(r"(\d)\.(\d)", rf"\1{_DOT}\2", s)  # 4.45 pm
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"“(])", s)
    return [p.replace(_DOT, ".").strip() for p in parts if p.strip()]


@dataclass
class Parsed:
    lines: list[str]
    body: list[str]
    signature: list[str]
    subject: str
    issue_date: str
    detected_school: str


def parse(text: str) -> Parsed:
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.replace("\r", "").split("\n")]
    lines = [l for l in lines if l]

    greeting_idx = next((i for i, l in enumerate(lines) if GREETING.match(l)), -1)
    closing_idx = next((i for i, l in enumerate(lines) if i > greeting_idx and CLOSING.match(l)), -1)
    if closing_idx == -1 and len(lines) > 2 and re.match(
        r"^(principal|director|head|vice|academic|administrator|coordinator)", lines[-2], re.I
    ):
        closing_idx = len(lines) - 2

    start = greeting_idx + 1 if greeting_idx >= 0 else 0
    end = closing_idx if closing_idx >= 0 else len(lines)
    body_lines = lines[start:end]
    signature = [l for l in lines[closing_idx:] if not CLOSING.match(l)] if closing_idx >= 0 else []

    subject_line = next((l for l in lines if SUBJECT.match(l)), "")
    issue_line = next((l for l in lines if ISSUE_DATE.match(l)), "")
    issue_dates = find_dates(issue_line) if issue_line else []

    first = lines[0] if lines else ""
    detected = ""
    if first and first == first.upper() and re.search(
        r"school|academy|vidyalaya|college|institute|convent|public", first, re.I
    ):
        detected = smart_title(first)

    body: list[str] = []
    for line in body_lines:
        if SUBJECT.match(line) or ISSUE_DATE.match(line):
            continue
        body.extend(split_sentences(LIST_ITEM.sub("", line) if LIST_ITEM.match(line) else line))

    return Parsed(
        lines=lines,
        body=body,
        signature=signature,
        subject=SUBJECT.sub("", subject_line).strip() if subject_line else "",
        issue_date=issue_dates[0] if issue_dates else "",
        detected_school=detected,
    )


# --------------------------------------------------------------------------
# Formatting helpers
# --------------------------------------------------------------------------

_SMALL = {"a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "from", "&"}
_ACRONYMS = {
    "PTM", "PTA", "ID", "AC", "ERP", "CBSE", "ICSE", "IB", "NCC", "NSS", "IT", "AI", "STEM", "PE",
    "II", "III", "IV", "VI", "VII", "VIII", "IX", "XI", "XII", "UKG", "LKG", "MBBS", "SSLC", "HSC",
}


def smart_title(s: str) -> str:
    """Converts SHOUTED headings to Title Case; leaves normal text alone."""
    letters = [c for c in s if c.isalpha()]
    if not letters or sum(c.isupper() for c in letters) / len(letters) <= 0.7:
        return s.strip()
    words = []
    for i, w in enumerate(s.lower().split()):
        bare = re.sub(r"[^A-Za-z]", "", w).upper()
        if bare in _ACRONYMS:
            words.append(w.upper())
        elif i > 0 and w in _SMALL:
            words.append(w)
        else:
            words.append(re.sub(r"(^[(\"'“]?|-)([^\W\d_])", lambda m: m[1] + m[2].upper(), w))
    return " ".join(words)


def truncate_words(s: str, n: int) -> str:
    words = s.split()
    if len(words) <= n:
        return s
    return re.sub(r"[,;:]$", "", " ".join(words[:n])) + "…"


def cap(s: str) -> str:
    return s[:1].upper() + s[1:]


def strip_punct(s: str) -> str:
    return re.sub(r"[\s,;:.]+$", "", s)


def shown(v: str) -> bool:
    return bool(v) and v not in (NOT_MENTIONED, NONE_MENTIONED)


def due(d: str) -> str:
    return d if d.lower().startswith("within") else f"by {d}"


# --------------------------------------------------------------------------
# Facts
# --------------------------------------------------------------------------

EVENT_VERB = re.compile(
    r"\b(will be (?:held|celebrated|conducted|organi[sz]ed|observed)|will celebrate|scheduled|commence"
    r"|arranged|will (?:remain|be) closed|closed|takes? place|is planned|will begin)\b",
    re.I,
)
CUE_BEFORE = re.compile(
    r"(on or before|by|before|no later than|latest by|deadline|last date(?: is| for [\w\s]+)?)\s*[:,]?\s*$", re.I
)
DIRECTIVE = re.compile(
    r"\b(must|mandatory|mandated|required|requested|compulsory|kindly|please|should|ensure"
    r"|to be (?:paid|submitted|returned|signed)|carry|bring|not (?:allowed|permitted|advised)"
    r"|prohibited|barred|strictly|payable|report)\b",
    re.I,
)


@dataclass
class Deadline:
    date: str
    purpose: str
    sentence: str


@dataclass
class Facts:
    key: dict
    event_iso: str
    start: str
    end: str
    deadlines: list[Deadline] = field(default_factory=list)
    event_sentence: str = ""
    online: bool = False


def _purpose(sentence: str) -> str:
    s = sentence.lower()
    if re.search(r"consent|permission|authori[sz]ation|slip|form", s):
        return "consent form"
    if re.search(r"fee|payment|payable|paid|charge|dues|contribution", s):
        return "payment"
    if "certificate" in s:
        return "certificate"
    if re.search(r"register|registration|enrol|order", s):
        return "registration"
    return ""


def extract_facts(p: Parsed, fallback_year: int) -> Facts:
    sentences = p.body
    body_text = " ".join(sentences)
    y = re.search(r"\d{4}", p.issue_date)
    year = int(y.group(0)) if y else fallback_year

    # Deadlines: a date (or "within N days") directly preceded by a cue word.
    deadlines: list[Deadline] = []
    for s in sentences:
        within = re.search(r"within \d+\s*(?:hours|days)", s, re.I)
        dues = [d for d in find_dates(s) if CUE_BEFORE.search(s[max(0, s.find(d) - 40): s.find(d)])]
        value = dues[-1] if dues else (within.group(0) if within else None)
        if value:
            deadlines.append(Deadline(value, _purpose(s), s))
    deadline_sentences = {d.sentence for d in deadlines}

    # Event date: the first sentence that announces something on a date.
    event_sentence, event_date = "", ""
    for s in sentences:
        if s in deadline_sentences and not EVENT_VERB.search(s):
            continue
        dates = [d for d in find_dates(s) if d != p.issue_date]
        if not dates or not EVENT_VERB.search(s):
            continue
        event_sentence = s
        if len(dates) > 1 and re.search(r"\b(from|commence)\b", s, re.I) and re.search(
            r"\b(conclude|to|till|until|end)\b", s, re.I
        ):
            event_date = f"{dates[0]} – {dates[1]}"
        else:
            event_date = dates[0]
        break
    if not event_date:
        for s in sentences:
            dates = [d for d in find_dates(s) if d != p.issue_date]
            if s not in deadline_sentences and dates:
                event_sentence, event_date = s, dates[0]
                break

    # Timings
    rng = find_time_range(event_sentence) or find_time_range(body_text)
    report_sentence = next(
        (s for s in sentences if re.search(r"\b(assemble|report|seated|reach|arrive)\b", s, re.I) and find_times(s)),
        "",
    )
    report_time = ""
    if report_sentence:
        m = re.search(
            r"\b(?:assemble|report|seated|reach|arrive)[^.]*?\bby\s+(\d{1,2}(?:[:.]\d{2})?\s*[ap]\.?m\.?)",
            report_sentence, re.I,
        )
        report_time = (m.group(1) if m else find_times(report_sentence)[0]).rstrip(".")
    # Only trust a bare time if it belongs to the event itself.
    first_time = (find_times(event_sentence) or [""])[0]

    if rng and report_time and report_time not in rng:
        timings = f"{rng} (report by {report_time})"
    elif rng:
        timings = rng
    elif report_time:
        timings = f"Report by {report_time}"
    else:
        timings = first_time or NOT_MENTIONED

    range_times = find_times(rng) if rng else []
    start_time = range_times[0] if range_times else (report_time or first_time)
    end_time = range_times[1] if len(range_times) > 1 else ""

    # Venue
    online = bool(re.search(r"\b(online|microsoft teams|zoom|google meet|virtual)\b", body_text, re.I))
    venue = NOT_MENTIONED
    vm = re.search(
        r"\b(?:(?:at|in)\s+(?:the\s+)?|to\s+the\s+)"
        r"([A-Z][\w'’.-]*(?:\s+(?:(?:and|for|of|&)\s+)?[A-Z][\w'’.-]*){0,7}(?:,\s+[A-Z][\w'’-]+)?)",
        event_sentence,
    )
    if vm:
        cand = re.sub(r"\s+(On|From)$", "", vm.group(1))
        if len(cand) > 3 and not re.fullmatch(r"[IVXL]+", cand) and not re.match(
            r"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Grade|Class|Classes)\b", cand
        ):
            venue = cand
    if online:
        platform = re.search(r"microsoft teams|zoom|google meet", body_text, re.I)
        venue = f"Online ({platform.group(0).title()})" if platform else "Online"

    # Fee
    fee = NONE_MENTIONED
    fee_sentence = next(
        (s for s in sentences if find_money(s) and re.search(
            r"\b(fee|charge|payable|pay|paid|cost|contribution|amount|available)\b", s, re.I)),
        "",
    )
    if fee_sentence:
        amount = find_money(fee_sentence)[0]
        idx = fee_sentence.find(amount)
        per = re.match(r"^\s*(per\s+[\w-]+(?:\s+pass)?)", fee_sentence[idx + len(amount):], re.I)
        label = re.match(r"^([A-Z][\w\s-]{2,25}):", fee_sentence)
        before = re.search(r"((?:[\w-]+\s+){0,2}(?:fee|charge|contribution|cost))\s+of\s*$", fee_sentence[:idx], re.I)
        subject = re.match(r"^([\w\s-]{3,30}?)\s+(?:are|is|will be|costs?)\b", fee_sentence)
        purpose = label.group(1) if label else before.group(1) if before else subject.group(1) if subject else ""
        purpose = re.sub(r"^(an?|the)\s+", "", purpose, flags=re.I).lower()
        fee = " ".join(x for x in [amount, per.group(1) if per else "", f"({purpose})" if purpose else ""] if x)

    # Dress code
    dress = NOT_MENTIONED
    dress_sentence = next(
        (s for s in sentences if re.search(r"\b(uniform|dress code|t-shirts?|attire|shoes|veshti|saree)\b", s, re.I)),
        "",
    )
    if dress_sentence:
        labelled = re.search(r"dress code\s*[:\-]\s*(.+)", dress_sentence, re.I)
        in_phrase = re.search(
            r"\bin\s+(?:their\s+)?(?:respective\s+)?((?:[\w'’-]+\s+){0,3}(?:uniform|t-shirts?|attire|dress)[^.]*)",
            dress_sentence, re.I,
        )
        raw = labelled.group(1) if labelled else in_phrase.group(1) if in_phrase else dress_sentence
        raw = re.sub(r"^(?:all\s+)?(?:students|children)\s+(?:should|must|may|are to)\s+(?:come|wear|be)\s+(?:dressed\s+)?(?:in\s+)?(?:the\s+)?", "", raw.strip(), flags=re.I)
        raw = re.sub(r",\s+(?:as|since|because)\s+.*$", "", raw)
        dress = truncate_words(cap(strip_punct(raw)), 22)

    # Contact: prefer the last sentence with a phone or email (usually the sign-off line).
    contact_sentence = next((s for s in reversed(sentences) if find_phones(s) or find_emails(s)), "")
    person = re.search(
        r"\b(?:Mr|Mrs|Ms|Dr|Prof|Thiru|Tmt)\.?\s+(?:[A-Z]\.\s*)*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?", contact_sentence
    )
    # Prefer the number written after the person's name, not an earlier helpline.
    after = contact_sentence[person.end():] if person else contact_sentence
    phones = find_phones(after) or find_phones(contact_sentence) or find_phones(body_text)
    emails = find_emails(contact_sentence) or find_emails(body_text)
    role = None if person else re.search(r"\bcontact (?:the )?([A-Z][\w\s]{3,40}?)\s+(?:at|on)\b", contact_sentence)
    name = person.group(0) if person else role.group(1) if role else ""
    parts = [name, phones[0] if phones else "", "" if phones else (emails[0] if emails else "")]
    contact = ", ".join(x for x in parts if x) or "Class teacher or school office"

    deadline = "; ".join(f"{d.date} ({d.purpose})" if d.purpose else d.date for d in deadlines[:2]) or NOT_MENTIONED

    first_event = event_date.split(" – ")[0]
    return Facts(
        key={
            "eventDate": event_date or NOT_MENTIONED,
            "timings": timings,
            "venue": venue,
            "feeOrAmount": fee,
            "dressCode": dress,
            "deadline": deadline,
            "contactPerson": contact,
        },
        event_iso=to_iso_date(first_event, year) if first_event else "",
        start=to_time24(start_time) if start_time else "",
        end=to_time24(end_time) if end_time else "",
        deadlines=deadlines,
        event_sentence=event_sentence,
        online=online,
    )


# --------------------------------------------------------------------------
# Actions (what parents must do) — used inside the messages
# --------------------------------------------------------------------------

@dataclass
class Action:
    task: str
    deadline: str = ""
    important: bool = False


def _to_task(sentence: str, facts: Facts, prev: str = "") -> tuple[str, str]:
    # Sentences that point back ("Orders must…", "Attendance on that day…") need the previous one.
    if prev and re.match(r"^orders?\b", sentence, re.I):
        item = re.match(r"^(?:[A-Z][\w\s&/-]{2,30}:\s*)?([\w\s-]{3,30}?)\s+(?:are|is)\s+available", prev)
        amount = (find_money(prev) or [""])[0]
        dates = find_dates(sentence)
        if item:
            return f"Order {item.group(1).lower()}" + (f" ({amount})" if amount else "") + " through the class teacher", dates[-1] if dates else ""
    if prev and re.match(r"^(this|that|it|these|attendance on that day)\b", sentence, re.I):
        sentence = f"{prev} {sentence}"
    label_m = re.match(r"^([A-Z][\w\s&/-]{2,30}):\s*", sentence)
    label = label_m.group(1).strip().lower() if label_m else ""
    s = sentence[label_m.end():] if label_m else sentence  # drop "Trip Fee:" style labels
    low = s.lower()
    dates = find_dates(s)
    last = dates[-1] if dates else ""
    amount = (find_money(s) or [""])[0]

    if re.search(r"consent|authori[sz]ation|permission", low) and re.search(r"sign|return|submit", low):
        return "Sign the consent form and return it to the class teacher", last
    if amount and re.search(r"\b(fee|payable|paid|pay|contribution)\b", low) and last:
        via = re.search(r"through ([^.,]+?)(?: or | by |,|\.|$)", s, re.I)
        via_txt = f" via {re.sub(r'^the ', '', via.group(1), flags=re.I)}" if via else ""
        what = f" {label}" if label and re.search(r"fee|contribution|payment", label) else ""
        return f"Pay {amount}{what}{via_txt}", last
    if re.search(r"\b(dues|term fee)\b", low) and last:
        return "Clear any pending term fee", last
    if "medical certificate" in low:
        within = re.search(r"within \d+\s*(?:hours|days)", s, re.I)
        return "If your child misses an exam due to illness, submit a medical certificate", within.group(0) if within else ""
    if re.search(r"\b(students|all students|candidates)\b", low) and re.search(r"\b(assemble|report|seated)\b", low):
        m = re.search(r"\bby\s+(\d{1,2}(?:[:.]\d{2})?\s*[ap]\.?m)", s, re.I)
        t = m.group(1) if m else (find_times(s) or [""])[0]
        if t:
            return f"Make sure your child reaches school by {t}", ""
    if re.search(r"\blinks?\b|homework", low) and re.search(r"shar|broadcast|send|post", low):
        t = (find_times(s) or [""])[0]
        where = " on the class WhatsApp group" if "whatsapp" in low else ""
        what = "homework" if "homework" in low else "class link"
        return f"Check for the {what}{where}" + (f" (shared by {t})" if t else ""), ""
    reg = re.search(r"register with (?:the )?(.+?)\s+(?:by|on or before|before)\b", s, re.I)
    if reg and last:
        return (f"{cap(label)}: register" if label else "Register") + f" with the {reg.group(1)}", last
    if re.search(r"register|registration", low) and last:
        return cap(truncate_words(strip_punct(s), 26)), last if last not in s else ""
    if re.search(r"hall ticket|admit card|id card", low) and re.search(r"mandatory|must|carry", low):
        return "Make sure your child carries the hall ticket every day", ""
    task = cap(truncate_words(strip_punct(s), 28))
    dl = last if last and last not in s and last != facts.key["eventDate"] else ""
    return task, dl


def extract_actions(p: Parsed, facts: Facts, limit: int = 5) -> list[Action]:
    scored = []
    deadline_sentences = {d.sentence for d in facts.deadlines}
    for idx, s in enumerate(p.body):
        score = 0
        if DIRECTIVE.search(s):
            score += 2
        if re.search(r"\b(must|mandatory|mandated|compulsory|strictly)\b", s, re.I):
            score += 2
        if s in deadline_sentences:
            score += 3
        if re.search(r"\bparents?\b", s, re.I):
            score += 1
        if find_money(s):
            score += 1
        if re.search(r"\b(postponed|rescheduled|cancelled|moved to|changed to)\b", s, re.I):
            score += 2
        if re.search(r"\blinks?\b|homework", s, re.I) and re.search(r"whatsapp|email|portal|app", s, re.I):
            score += 2
        if re.search(r"\b(reopens?|holidays? (?:are|from|begin)|will be sent home|compensatory)\b", s, re.I):
            score += 2
        if re.match(r"^(dear|we are|we wish|as part of|following|in view of|to foster|please note the following|places to visit|trip details|important instructions)", s, re.I):
            score -= 4
        if s.endswith(":"):
            score -= 4
        if score >= 2:
            scored.append((score, idx, s))

    top = sorted(sorted(scored, key=lambda x: -x[0])[:limit], key=lambda x: x[1])
    out: list[Action] = []
    seen = set()
    for _, idx, s in top:
        task, dl = _to_task(s, facts, p.body[idx - 1] if idx > 0 else "")
        if task in seen:
            continue
        seen.add(task)
        out.append(Action(task, dl, bool(re.search(r"\b(must|mandatory|mandated|compulsory|strictly|required)\b", s, re.I)) or bool(dl)))
    return out or [Action("Read the circular and note the dates")]


# --------------------------------------------------------------------------
# Classification
# --------------------------------------------------------------------------

_CATEGORY_WORDS = {
    "Emergency": r"\b(rain|flood|cyclone|alert|closed|closure|emergency|urgent|holiday declared|heat ?wave|outbreak|suspended)\b",
    "Exams": r"\b(exam|examination|examinations|assessment|test|hall ticket|admit card|timetable|syllabus|re-?examination)\b",
    "Trips": r"\b(excursion|field trip|trip|tour|picnic|visit|planetarium|museum)\b",
    "Events": r"\b(sports|annual day|celebration|celebrate|function|competition|fest|meet|ceremony|performance|pongal|kolam)\b",
    "Fees & Permissions": r"\b(fee|fees|payment|dues|consent|permission|refund|challan)\b",
}


def classify(text: str) -> str:
    best, best_score = "General", 0.0
    for cat, rx in _CATEGORY_WORDS.items():
        n = len(re.findall(rx, text, re.I)) * (1.5 if cat == "Emergency" else 1)
        if n > best_score:
            best, best_score = cat, n
    return best if best_score >= 2 else "General"


def urgency_of(text: str, category: str, facts: Facts) -> str:
    if category == "Emergency":
        return "High"
    strong = len(re.findall(r"\b(urgent|immediately|tomorrow|mandatory|strictly|compulsory|will not be)\b", text, re.I))
    if strong >= 3:
        return "High"
    if facts.deadlines or strong >= 1:
        return "Medium"
    return "Low"


# --------------------------------------------------------------------------
# Composition
# --------------------------------------------------------------------------

ICON = {
    "megaphone": "\U0001F4E2", "calendar": "\U0001F4C5", "clock": "⏰", "pin": "\U0001F4CD",
    "card": "\U0001F4B3", "hourglass": "⏳", "shirt": "\U0001F455", "check": "✅",
    "phone": "\U0001F4DE", "warning": "⚠️",
}


def summary_sentence(sentence: str) -> str:
    if not sentence:
        return ""
    s = re.sub(r"^we are (?:immensely |very |extremely )?(?:pleased|happy|glad|delighted) to (?:announce|inform(?: you)?) that\s+", "", sentence, flags=re.I)
    s = re.sub(r"^this is to inform (?:you |all parents )?that\s+", "", s, flags=re.I)
    s = re.sub(r"^kindly note that\s+", "", s, flags=re.I)
    if re.match(r"^(in view of|to foster|to ensure|as part of|in order to|owing to|due to|following)\b", s, re.I) and "," in s:
        s = s[s.index(",") + 1:].strip()
    s = re.sub(r"^accordingly,?\s+", "", s, flags=re.I)
    s = re.sub(r"^our\s+", "The ", s, flags=re.I)
    out = cap(truncate_words(strip_punct(s), 28))
    return out if out.endswith("…") else out + "."


@dataclass
class Compose:
    school: str
    title: str
    summary: str
    facts: Facts
    actions: list[Action]
    tone: str
    use_emoji: bool
    signature: str
    urgency: str


def compose_whatsapp(c: Compose) -> str:
    i = (lambda k: f"{ICON[k]} ") if c.use_emoji else (lambda k: "")
    k = c.facts.key
    out: list[str] = []
    if c.tone == "urgent" or c.urgency == "High":
        out.append(f"{i('warning')}*IMPORTANT*")
    out += [f"{i('megaphone')}*{c.school}*", f"*{c.title}*", ""]
    out.append("Dear Parents and Guardians," if c.tone == "formal" else "Dear Parents,")
    if c.summary and c.tone != "brief":
        out.append(c.summary)
    out.append("")
    rows = [
        ("calendar", "Date", k["eventDate"]),
        ("clock", "Time", k["timings"]),
        ("pin", "Venue", k["venue"]),
        ("card", "Fee", k["feeOrAmount"]),
        ("shirt", "Wear", "" if c.tone == "brief" else k["dressCode"]),
        ("hourglass", "Deadline", k["deadline"]),
    ]
    out += [f"{i(icon)}*{label}:* {value}" for icon, label, value in rows if shown(value)]
    actions = c.actions[: 3 if c.tone == "brief" else 4]
    if actions:
        out += ["", f"{i('check')}*What you need to do*"]
        out += [f"{n}. {a.task}" + (f" — {due(a.deadline)}" if a.deadline else "") for n, a in enumerate(actions, 1)]
    if shown(k["contactPerson"]):
        out += ["", f"{i('phone')}*Questions:* {k['contactPerson']}"]
    out += ["", "Regards," if c.tone == "formal" else "Thank you,", f"_{c.signature}_"]
    return "\n".join(out)


def compose_translation(c: Compose, language: str) -> tuple[str, str | None]:
    L = OFFLINE_LABELS.get(language)
    if not L:
        return compose_whatsapp(c), None
    i = (lambda k: f"{ICON[k]} ") if c.use_emoji else (lambda k: "")
    k = c.facts.key
    out = [f"{i('megaphone')}*{c.school} — {L['heading']}*", f"*{L['subject']}:* {c.title}", "", L["greeting"], L["intro"], ""]
    rows = [
        ("calendar", L["date"], k["eventDate"]),
        ("clock", L["time"], k["timings"]),
        ("pin", L["venue"], k["venue"]),
        ("card", L["fee"], k["feeOrAmount"]),
        ("hourglass", L["deadline"], k["deadline"]),
    ]
    out += [f"{i(icon)}*{label}:* {value}" for icon, label, value in rows if shown(value)]
    if c.actions:
        out += ["", f"{i('check')}*{L['actions']}*"]
        out += [f"{n}. {a.task}" + (f" ({a.deadline})" if a.deadline else "") for n, a in enumerate(c.actions[:4], 1)]
    if shown(k["contactPerson"]):
        out += ["", f"{i('phone')}*{L['contact']}:* {k['contactPerson']}"]
    out += ["", L["closing"], f"_{L['signature']}_"]
    note = (
        f"Offline mode translates the headings into {language}; the details stay in English. "
        "Connect Gemini for a full translation."
    )
    return "\n".join(out), note


def compose_sms(c: Compose) -> str:
    k = c.facts.key
    parts = [f"{c.school}: {c.title}."]
    if shown(k["eventDate"]):
        parts.append(f"{k['eventDate']}" + (f", {k['timings']}" if shown(k["timings"]) else "") + ".")
    first = next((a for a in c.actions if a.important), c.actions[0] if c.actions else None)
    if first:
        parts.append(first.task + (f" {due(first.deadline)}" if first.deadline else "") + ".")
    phones = find_phones(k["contactPerson"])
    if phones:
        parts.append(f"Queries: {phones[0]}")
    sms = " ".join(parts).replace("..", ".")
    if len(sms) > 320:
        sms = re.sub(r"\s+\S*$", "", sms[:317]) + "…"
    return sms


def compose_audio(c: Compose) -> str:
    k = c.facts.key
    parts = [f"Message for parents from {c.school}, about {c.title}."]
    if c.summary:
        parts.append(c.summary)
    if shown(k["timings"]):
        parts.append(f"Timing: {k['timings'].replace(' – ', ' to ')}.")
    if c.actions:
        parts.append("Here is what you need to do.")
        parts += [a.task + (f", {due(a.deadline)}" if a.deadline else "") + "." for a in c.actions[:4]]
    if shown(k["contactPerson"]):
        parts.append(f"For questions, contact {k['contactPerson']}.")
    parts.append("Thank you.")
    return " ".join(parts)


# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------

def analyze_offline(
    circular_text: str,
    school_name: str = "",
    target_language: str = "Tamil",
    tone: str = "friendly",
    use_emoji: bool = True,
    today: date | None = None,
) -> dict:
    today = today or date.today()
    p = parse(circular_text)
    facts = extract_facts(p, today.year)
    school = school_name.strip() or p.detected_school or "Our School"

    first_useful = next(
        (
            l for l in p.lines
            if l.lower() != school.lower()
            and not re.match(r"^(circular|ref|date|dated|no\.?|phone|email)\b", l, re.I)
            and not GREETING.match(l)
            and len(l) > 8
        ),
        "",
    )
    title = re.sub(r"[.:]$", "", smart_title(p.subject or first_useful or "School update"))

    category = classify(circular_text)
    urgency = urgency_of(circular_text, category, facts)
    actions = extract_actions(p, facts)

    summary_src = facts.event_sentence or next(
        (s for s in p.body if not re.match(r"^(dear|kindly note|please note)", s, re.I)), ""
    )
    sig = [strip_punct(l) for l in p.signature if l][:2]

    c = Compose(
        school=school, title=title, summary=summary_sentence(summary_src), facts=facts,
        actions=actions, tone=tone, use_emoji=use_emoji,
        signature=", ".join(sig) if sig else "School Administration", urgency=urgency,
    )

    whatsapp = compose_whatsapp(c)
    if target_language == "Simple English":
        translated, note = whatsapp, None
    else:
        translated, note = compose_translation(c, target_language)

    original_words = word_count(circular_text)
    summary_words = word_count(whatsapp)
    return {
        "title": title,
        "urgency": urgency,
        "category": category,
        "whatsappNotice": whatsapp,
        "translatedNotice": translated,
        "smsNotice": compose_sms(c),
        "audioScript": compose_audio(c),
        "targetLanguage": target_language,
        "keyDetails": facts.key,
        "calendar": {"date": facts.event_iso, "start": facts.start, "end": facts.end},
        "spans": find_spans(circular_text),
        "meta": {
            "engine": "offline",
            "model": "Offline reader",
            "originalWords": original_words,
            "summaryWords": summary_words,
            "originalReadSeconds": max(10, round(original_words / 200 * 60)),
            "summaryReadSeconds": max(10, round(summary_words / 200 * 60)),
            "translationNote": note,
        },
    }
