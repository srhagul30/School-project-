import type { NoticeResult } from "./types";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

function fold(line: string): string {
  // RFC 5545: lines longer than 75 octets are folded with CRLF + space.
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function canExportCalendar(r: NoticeResult): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(r.calendar.date);
}

/** Builds an .ics file for the event, as floating local time (no timezone shift). */
export function buildIcs(r: NoticeResult, schoolName: string): string {
  const d = r.calendar.date.replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NoticeBridge//School Notice//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${d}-${Math.random().toString(36).slice(2)}@noticebridge`,
    `DTSTAMP:${stamp}`,
  ];

  if (r.calendar.start) {
    const start = r.calendar.start.replace(":", "");
    const endTime = r.calendar.end || addHour(r.calendar.start);
    lines.push(`DTSTART:${d}T${start}00`, `DTEND:${d}T${endTime.replace(":", "")}00`);
  } else {
    const next = new Date(`${r.calendar.date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`);
  }

  const description = [
    ...r.actionChecklist.map((a) => `- ${a.task}${a.deadline ? ` (${a.deadline})` : ""}`),
    "",
    `Contact: ${r.keyDetails.contactPerson}`,
  ].join("\n");

  lines.push(
    fold(`SUMMARY:${esc(`${r.title} – ${schoolName}`)}`),
    fold(`DESCRIPTION:${esc(description)}`)
  );
  if (r.keyDetails.venue && r.keyDetails.venue !== "Not mentioned") {
    lines.push(fold(`LOCATION:${esc(r.keyDetails.venue)}`));
  }
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(r.title)} is tomorrow`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );
  return lines.join("\r\n");
}

function addHour(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "notice";
}
