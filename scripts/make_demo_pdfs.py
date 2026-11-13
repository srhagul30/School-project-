"""
Generates the demo circular PDFs in public/demo/ from src/data/samples.json.

    python scripts/make_demo_pdfs.py

The school, people and phone numbers in these circulars are fictional.
"""
import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "demo"
GREEN = colors.HexColor("#1E4A3C")

base = ParagraphStyle("base", fontName="Times-Roman", fontSize=11.5, leading=16, spaceAfter=7)
styles = {
    "school": ParagraphStyle("school", parent=base, fontName="Times-Bold", fontSize=16, leading=20, alignment=TA_CENTER, textColor=GREEN, spaceAfter=2),
    "addr": ParagraphStyle("addr", parent=base, fontSize=10, leading=13, alignment=TA_CENTER, spaceAfter=1),
    "meta": ParagraphStyle("meta", parent=base, fontName="Times-Bold", fontSize=10.5, spaceAfter=1),
    "subject": ParagraphStyle("subject", parent=base, fontName="Times-Bold", fontSize=12, leading=16, spaceBefore=6, spaceAfter=10),
    "body": base,
    "item": ParagraphStyle("item", parent=base, spaceAfter=4),
    "sign": ParagraphStyle("sign", parent=base, spaceAfter=0),
}


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build(sample: dict) -> None:
    lines = sample["text"].split("\n")
    story = [Paragraph(esc(lines[0]), styles["school"])]
    i = 1
    while i < len(lines) and lines[i].strip() and not lines[i].startswith(("CIRCULAR", "DATE")):
        story.append(Paragraph(esc(lines[i]), styles["addr"]))
        i += 1
    story += [Spacer(1, 4), HRFlowable(width="100%", thickness=1.2, color=GREEN, spaceAfter=10)]

    numbered, bullets = [], []

    def flush():
        nonlocal numbered, bullets
        if numbered:
            story.append(ListFlowable([ListItem(Paragraph(esc(t), styles["item"]), value=n) for n, t in numbered],
                                      bulletType="1", bulletFontName="Times-Roman", leftIndent=16))
        if bullets:
            story.append(ListFlowable([ListItem(Paragraph(esc(t), styles["item"])) for t in bullets],
                                      bulletType="bullet", start="•", leftIndent=16))
        numbered, bullets = [], []

    for line in lines[i:]:
        t = line.strip()
        if not t:
            flush()
            continue
        if m := re.match(r"^(\d+)\.\s+(.*)", t):
            numbered.append((int(m[1]), m[2]))
        elif t.startswith("- "):
            bullets.append(t[2:])
        else:
            flush()
            if t.startswith(("CIRCULAR", "DATE")):
                story.append(Paragraph(esc(t), styles["meta"]))
            elif t.startswith("SUBJECT"):
                story.append(Paragraph(esc(t), styles["subject"]))
            elif t in ("Regards,",):
                story += [Spacer(1, 10), Paragraph(esc(t), styles["sign"]), Spacer(1, 18)]
            else:
                story.append(Paragraph(esc(t), styles["sign"] if t in ("Principal",) or t.startswith("Mrs. R.") else styles["body"]))
    flush()
    story += [Spacer(1, 24), Paragraph("Demo circular for NoticeBridge. The school, names and phone numbers are fictional.",
                                       ParagraphStyle("note", parent=base, fontName="Times-Italic", fontSize=8, textColor=colors.grey))]

    path = OUT / sample["file"]
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm, topMargin=18 * mm, bottomMargin=18 * mm,
                            title=sample["label"] + " – " + sample["schoolName"], author=sample["schoolName"], subject="Demo circular (fictional)")
    doc.build(story)
    print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for s in json.loads((ROOT / "src" / "data" / "samples.json").read_text(encoding="utf-8")):
        build(s)
