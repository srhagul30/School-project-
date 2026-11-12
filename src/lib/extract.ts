/**
 * Pattern-level extraction shared by the offline engine (server) and the
 * circular highlighter (client). Pure functions, no dependencies.
 */

const MONTHS =
  "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
const WEEKDAY = "(?:(?:Mon|Tues?|Wed(?:nes)?|Thu(?:rs)?|Fri|Sat(?:ur)?|Sun)(?:day)?,?\\s+)?";
const ORD = "(?:st|nd|rd|th)?";

const DATE_SRC =
  `\\b${WEEKDAY}(?:` +
  `\\d{1,2}${ORD}\\s+(?:of\\s+)?(?:${MONTHS})\\.?(?:,?\\s+\\d{4})?` +
  `|(?:${MONTHS})\\.?\\s+\\d{1,2}${ORD}(?:,?\\s+\\d{4})?` +
  `|\\d{1,2}[/.-]\\d{1,2}[/.-](?:\\d{4}|\\d{2})` +
  `)(?![\\w/])`;

const TIME_SRC = `\\b\\d{1,2}(?:[:.]\\d{2})?\\s*(?:[ap]\\.m(?:\\.(?=\\s*[a-z,;]))?|[ap]m)(?![a-z])`;
const TIME_RANGE_SRC = `${TIME_SRC}\\s*(?:to|-|–|—|until|till)\\s*${TIME_SRC}`;
const MONEY_SRC = `(?:Rs\\.?|INR|₹|\\$|USD|AED|€|£)\\s?\\d[\\d,]*(?:\\.\\d{1,2})?(?:\\s?\\/-)?`;
const PHONE_SRC = `(?<![\\w/.-])(?:\\+\\d{1,3}[\\s-]?)?\\(?\\d{2,5}\\)?[\\s-]?\\d{3,5}[\\s-]?\\d{2,5}(?![\\w/])`;
const EMAIL_SRC = `[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+`;

export const re = {
  date: () => new RegExp(DATE_SRC, "gi"),
  time: () => new RegExp(TIME_SRC, "gi"),
  timeRange: () => new RegExp(TIME_RANGE_SRC, "gi"),
  money: () => new RegExp(MONEY_SRC, "gi"),
  phone: () => new RegExp(PHONE_SRC, "g"),
  email: () => new RegExp(EMAIL_SRC, "gi"),
};

export function allMatches(text: string, pattern: RegExp): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    out.push(m);
    if (m[0].length === 0) pattern.lastIndex++;
  }
  return out;
}

function digitCount(s: string) {
  return (s.match(/\d/g) || []).length;
}

export function findPhones(text: string): string[] {
  return allMatches(text, re.phone())
    .map((m) => m[0].trim())
    .filter((p) => {
      const d = digitCount(p);
      // Real phone numbers have 10–13 digits; this rules out years and refs.
      return d >= 10 && d <= 13 && !/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(p);
    });
}

export function findDates(text: string): string[] {
  return allMatches(text, re.date()).map((m) => m[0].trim());
}

export function findTimes(text: string): string[] {
  return allMatches(text, re.time()).map((m) => m[0].trim());
}

export function findTimeRange(text: string): string | null {
  const m = re.timeRange().exec(text);
  return m ? m[0].replace(/\s*(?:-|–|—|until|till)\s*/i, " – ").replace(/\s+to\s+/i, " – ") : null;
}

export function findMoney(text: string): string[] {
  return allMatches(text, re.money()).map((m) => m[0].trim());
}

export function findEmails(text: string): string[] {
  return allMatches(text, re.email()).map((m) => m[0]);
}

/* ------------------------------------------------------------------ */
/* Normalisation helpers                                               */
/* ------------------------------------------------------------------ */

const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Converts a human date ("Saturday, 12th December 2026") to YYYY-MM-DD. */
export function toIsoDate(raw: string, fallbackYear: number): string {
  const s = raw
    .replace(new RegExp(`^${WEEKDAY}`, "i"), "")
    .replace(/(\d)(st|nd|rd|th)\b/gi, "$1")
    .replace(/\bof\s+/i, "")
    .replace(/,/g, " ")
    .trim();

  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;

  const numeric = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (numeric) {
    // Day-first, as used on Indian and most non-US circulars.
    day = +numeric[1];
    month = +numeric[2];
    year = +numeric[3];
    if (year < 100) year += 2000;
  } else {
    const dm = s.match(/^(\d{1,2})\s+([A-Za-z]+)\.?(?:\s+(\d{4}))?/);
    const md = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:\s+(\d{4}))?/);
    if (dm) {
      day = +dm[1];
      month = MONTH_INDEX[dm[2].slice(0, 3).toLowerCase()];
      year = dm[3] ? +dm[3] : fallbackYear;
    } else if (md) {
      month = MONTH_INDEX[md[1].slice(0, 3).toLowerCase()];
      day = +md[2];
      year = md[3] ? +md[3] : fallbackYear;
    }
  }

  if (!day || !month || !year || day > 31 || month > 12) return "";
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Converts "8:30 AM" / "4.45 pm" / "9 am" to "HH:MM" (24h). */
export function toTime24(raw: string): string {
  const m = raw.match(/(\d{1,2})(?:[:.](\d{2}))?\s*([ap])/i);
  if (!m) return "";
  let h = +m[1] % 12;
  if (m[3].toLowerCase() === "p") h += 12;
  return `${pad(h)}:${m[2] ?? "00"}`;
}

/* ------------------------------------------------------------------ */
/* Highlight spans                                                      */
/* ------------------------------------------------------------------ */

export type SpanKind = "date" | "time" | "money" | "contact";

export interface Span {
  start: number;
  end: number;
  kind: SpanKind;
}

/** Non-overlapping spans of facts in the text, for the highlighter view. */
export function findSpans(text: string): Span[] {
  const candidates: Span[] = [];
  const push = (pattern: RegExp, kind: SpanKind, keep?: (s: string) => boolean) => {
    for (const m of allMatches(text, pattern)) {
      if (keep && !keep(m[0])) continue;
      candidates.push({ start: m.index, end: m.index + m[0].length, kind });
    }
  };

  // Order sets priority when spans overlap.
  push(re.email(), "contact");
  push(re.phone(), "contact", (s) => digitCount(s) >= 10 && digitCount(s) <= 13);
  push(re.money(), "money");
  push(re.timeRange(), "time");
  push(re.time(), "time");
  push(re.date(), "date");

  const taken: Span[] = [];
  for (const c of candidates) {
    if (!taken.some((t) => c.start < t.end && c.end > t.start)) taken.push(c);
  }
  return taken.sort((a, b) => a.start - b.start);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
