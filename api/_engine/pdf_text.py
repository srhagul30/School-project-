"""Extracts plain text from an uploaded PDF circular."""
from __future__ import annotations

import io
import re

from pypdf import PdfReader
from pypdf.errors import PdfReadError

MAX_PAGES = 20


class PdfTextError(Exception):
    pass


def extract_pdf_text(data: bytes) -> tuple[str, int]:
    if not data.startswith(b"%PDF"):
        raise PdfTextError("That file isn't a PDF.")
    try:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise PdfTextError("This PDF is password-protected. Remove the password and try again.") from None
        pages = []
        for page in reader.pages[:MAX_PAGES]:
            text = page.extract_text(extraction_mode="plain") or ""
            text = re.sub(r"[ \t]+", " ", text)
            text = "\n".join(line.strip() for line in text.splitlines())
            pages.append(text.strip())
    except PdfTextError:
        raise
    except (PdfReadError, ValueError, KeyError) as e:
        raise PdfTextError("Couldn't read that PDF. It may be damaged.") from e

    joined = reflow("\n\n".join(p for p in pages if p))
    if len(joined) < 20:
        raise PdfTextError("This PDF has no selectable text (it may be a scanned image). Type or paste the circular instead.")
    return joined, len(reader.pages)


_LIST_START = re.compile(r"^(?:\d{1,2}[.)]|[-•*–]|\(?[a-z]\))\s+")


def _is_caps(line: str) -> bool:
    letters = [c for c in line if c.isalpha()]
    return bool(letters) and sum(c.isupper() for c in letters) / len(letters) > 0.8


def reflow(text: str) -> str:
    """
    PDF text comes back with hard line wraps. Re-join wrapped lines into
    paragraphs, and re-attach list numbers that landed on their own line.
    """
    out: list[str] = []
    pending_number = ""
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            if out and out[-1] != "":
                out.append("")
            continue
        if re.fullmatch(r"\d{1,2}[.)]?", line):  # "1" alone on a line
            pending_number = line.rstrip(".)") + ". "
            continue
        if pending_number:
            out.append(pending_number + line)
            pending_number = ""
            continue
        prev = out[-1] if out else ""
        starts_block = (
            _LIST_START.match(line)
            or re.match(r"^(dear|respected|regards|sincerely|yours|with (?:best|warm))\b", line, re.I)
            or (line.endswith(":") and len(line) < 40)
            or (_is_caps(prev) and not _is_caps(line))  # heading followed by body text
        )
        wrapped = prev and not starts_block and not re.search(r"[.:!?,]$", prev) and (
            line[0].islower()
            or (len(prev) > 60 and not _is_caps(line))
            or (_is_caps(prev) and _is_caps(line) and len(prev) > 40)
        )
        if wrapped:
            out[-1] = f"{prev} {line}"
        else:
            out.append(line)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()
