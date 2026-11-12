/**
 * Offline engine: a rule-based reader for school circulars.
 *
 * It runs without any API key and only reports what it can find in the text.
 * Missing facts are reported as "Not mentioned" rather than invented.
 */
import {
  findDates,
  findEmails,
  findMoney,
  findPhones,
  findTimeRange,
  findTimes,
  toIsoDate,
  toTime24,
  wordCount,
} from "./extract";
import { OFFLINE_LABELS } from "./languages";
import type {
  Category,
  ChecklistItem,
  Faq,
  KeyDetails,
  NoticeResult,
  ProcessRequest,
  Tone,
  Urgency,
} from "./types";

export const NOT_MENTIONED = "Not mentioned";

/* ------------------------------------------------------------------ */
/* Text structure                                                      */
/* ------------------------------------------------------------------ */

const ABBREVIATIONS = /\b(Rs|Mr|Mrs|Ms|Dr|Prof|No|St|Ref|Sr|Jr|approx|e\.g|i\.e|etc|vs|Govt|Std)\./gi;
const DOT = "․"; // one-dot leader, used as a placeholder while splitting

function splitSentences(paragraph: string): string[] {
  const protectedText = paragraph
    .replace(ABBREVIATIONS, (m) => m.replace(/\./g, DOT))
    .replace(/\b([A-Z])\.(?=\s*[A-Z])/g, `$1${DOT}`) // initials: K. Ramanathan
    .replace(/(\d)\.(\d)/g, `$1${DOT}$2`); // 4.45 pm, 2.5
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .map((s) => s.split(DOT).join(".").trim())
    .filter(Boolean);
}

interface Parsed {
  lines: string[];
  header: string[];
  body: string[]; // sentences / list items in reading order
  signature: string[];
  subject: string;
  issueDate: string;
  detectedSchool: string;
}

const CLOSING = /^(sincerely|yours\s+(?:sincerely|faithfully|truly)|warm(?:est)?\s+regards|regards|best\s+regards|with\s+(?:best|warm)\s+(?:wishes|regards)|thanking\s+you|thank\s+you)[,.!]?$/i;
const GREETING = /^(dear|respected)\b/i;
const SUBJECT = /^(subject|sub|regarding|re)\s*[:.\-]\s*/i;
const ISSUE_DATE = /^(date|dated)\s*[:.\-]\s*/i;
const LIST_ITEM = /^(?:\d{1,2}[.)]|[-•*–]|\(?[a-z]\))\s+/i;

function parse(text: string): Parsed {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const greetingIdx = lines.findIndex((l) => GREETING.test(l));
  let closingIdx = lines.findIndex((l, i) => i > greetingIdx && CLOSING.test(l));

  // Some circulars end with "Principal," and the school name with no sign-off.
  if (closingIdx === -1) {
    const tail = lines.length - 2;
    if (tail > 0 && /^(principal|director|head|vice|academic|administrator|coordinator)/i.test(lines[tail])) {
      closingIdx = tail;
    }
  }

  const header = greetingIdx > 0 ? lines.slice(0, greetingIdx) : [];
  const bodyLines = lines.slice(
    greetingIdx >= 0 ? greetingIdx + 1 : 0,
    closingIdx >= 0 ? closingIdx : lines.length
  );
  const signature = closingIdx >= 0
    ? lines.slice(closingIdx).filter((l) => !CLOSING.test(l))
    : [];

  const subjectLine = lines.find((l) => SUBJECT.test(l));
  const subject = subjectLine ? subjectLine.replace(SUBJECT, "").trim() : "";
  const issueLine = lines.find((l) => ISSUE_DATE.test(l));
  const issueDate = issueLine ? findDates(issueLine)[0] ?? "" : "";

  // The school name is usually the first line, set in capitals.
  const first = lines[0] ?? "";
  const detectedSchool =
    first && first === first.toUpperCase() && /school|academy|vidyalaya|college|institute|convent|public/i.test(first)
      ? smartTitle(first)
      : "";

  const body: string[] = [];
  for (const line of bodyLines) {
    if (SUBJECT.test(line) || ISSUE_DATE.test(line)) continue;
    body.push(...splitSentences(LIST_ITEM.test(line) ? line.replace(LIST_ITEM, "").trim() : line));
  }

  return { lines, header, body, signature, subject, issueDate, detectedSchool };
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "from", "&"]);
const ACRONYMS = new Set(["PTM", "PTA", "ID", "AC", "ERP", "CBSE", "ICSE", "IB", "NCC", "NSS", "IT", "AI", "STEM", "PE", "II", "III", "IV", "VI", "VII", "VIII", "IX", "XI", "XII", "UKG", "LKG", "MBBS"]);

export function smartTitle(s: string): string {
  const letters = s.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "");
  const isShouting = letters.length > 0 && upper.length / letters.length > 0.7;
  if (!isShouting) return s.trim();
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (ACRONYMS.has(upper.replace(/[^A-Z]/g, ""))) return upper;
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      return w.replace(/(^[("'“]?|-)(\p{L})/gu, (_, p, c) => p + c.toUpperCase())
        .replace(/'S\b/, "'s");
    })
    .join(" ");
}

function truncateWords(s: string, maxWords: number): string {
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s;
  return words.slice(0, maxWords).join(" ").replace(/[,;:]$/, "") + "…";
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripTrailingPunct(s: string) {
  return s.replace(/[\s,;:.]+$/, "");
}

/* ------------------------------------------------------------------ */
/* Fact extraction                                                     */
/* ------------------------------------------------------------------ */

const EVENT_VERB = /\b(will be (?:held|celebrated|conducted|organi[sz]ed|observed)|scheduled|commence|arranged|will (?:remain|be) closed|closed|takes? place|is planned|will begin)\b/i;
const DIRECTIVE = /\b(must|mandatory|mandated|required|requested|compulsory|kindly|please|should|ensure|to be (?:paid|submitted|returned|signed)|carry|bring|not (?:allowed|permitted|advised)|prohibited|barred|strictly|payable|report)\b/i;

function deadlinePurpose(sentence: string): string {
  const s = sentence.toLowerCase();
  if (/consent|permission|authori[sz]ation|slip|form/.test(s)) return "consent slip";
  if (/fee|payment|payable|paid|charge/.test(s)) return "fee";
  if (/certificate/.test(s)) return "certificate";
  if (/register|registration|enrol/.test(s)) return "registration";
  return "";
}

interface Facts {
  key: KeyDetails;
  eventIso: string;
  start: string;
  end: string;
  deadlines: { date: string; purpose: string; sentence: string }[];
  eventSentence: string;
  online: boolean;
}

function extractFacts(p: Parsed, fallbackYear: number): Facts {
  const sentences = p.body;
  const bodyText = sentences.join(" ");
  const year = (() => {
    const y = p.issueDate.match(/\d{4}/);
    return y ? +y[0] : fallbackYear;
  })();

  /* Deadlines: a date (or "within N hours") directly preceded by a cue word */
  const deadlines: Facts["deadlines"] = [];
  const CUE_BEFORE = /(on or before|by|before|no later than|latest by|deadline|last date(?: is| for [\w\s]+)?)\s*[:,]?\s*$/i;
  for (const s of sentences) {
    const within = s.match(/within \d+\s*(?:hours|days)/i)?.[0];
    const due = findDates(s).filter((d) => CUE_BEFORE.test(s.slice(Math.max(0, s.indexOf(d) - 40), s.indexOf(d))));
    const value = due[due.length - 1] ?? within;
    if (value) deadlines.push({ date: value, purpose: deadlinePurpose(s), sentence: s });
  }
  const deadlineSentences = new Set(deadlines.map((d) => d.sentence));

  /* Event date */
  let eventSentence = "";
  let eventDate = "";
  for (const s of sentences) {
    if (deadlineSentences.has(s) && !EVENT_VERB.test(s)) continue;
    const dates = findDates(s).filter((d) => d !== p.issueDate);
    if (!dates.length || !EVENT_VERB.test(s)) continue;
    eventSentence = s;
    eventDate = /\b(from|commence)\b/i.test(s) && dates.length > 1 && /\b(conclude|to|till|until|end)\b/i.test(s)
      ? `${dates[0]} – ${dates[1]}`
      : dates[0];
    break;
  }
  if (!eventDate) {
    const firstNonDeadline = sentences.find(
      (s) => !deadlineSentences.has(s) && findDates(s).some((d) => d !== p.issueDate)
    );
    if (firstNonDeadline) {
      eventSentence = firstNonDeadline;
      eventDate = findDates(firstNonDeadline).find((d) => d !== p.issueDate) ?? "";
    }
  }

  /* Timings */
  const range = findTimeRange(eventSentence) ?? findTimeRange(bodyText);
  const reportSentence = sentences.find((s) => /\b(assemble|report|seated|reach|arrive)\b/i.test(s) && findTimes(s).length);
  const reportTime = reportSentence
    ? (reportSentence.match(/\b(?:assemble|report|seated|reach|arrive)[^.]*?\bby\s+(\d{1,2}(?:[:.]\d{2})?\s*[ap]\.?m\.?)/i)?.[1] ??
      findTimes(reportSentence)[0]).replace(/\.$/, "")
    : "";
  const firstTime = findTimes(eventSentence)[0] || findTimes(bodyText)[0] || "";
  let timings = NOT_MENTIONED;
  if (range && reportTime && !range.includes(reportTime)) timings = `${range} (report by ${reportTime})`;
  else if (range) timings = range;
  else if (reportTime) timings = `Report by ${reportTime}`;
  else if (firstTime) timings = firstTime;

  const startTime = range ? findTimes(range)[0] : reportTime || firstTime;
  const endTime = range ? findTimes(range)[1] : "";

  /* Venue */
  const online = /\b(online|microsoft teams|zoom|google meet|virtual)\b/i.test(bodyText);
  let venue = NOT_MENTIONED;
  const venueMatch = eventSentence.match(
    /\b(?:(?:at|in)\s+(?:the\s+)?|to\s+the\s+)([A-Z][\w'’.-]*(?:\s+(?:(?:and|for|of|&)\s+)?[A-Z][\w'’.-]*){0,7})/
  );
  if (venueMatch && venueMatch[1].length > 3 && !/^[IVXL]+$/.test(venueMatch[1]) && !/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Grade|Class|Classes)\b/.test(venueMatch[1])) {
    venue = venueMatch[1].replace(/\s+(On|From)$/, "");
  }
  if (online) {
    const platform = bodyText.match(/microsoft teams|zoom|google meet/i)?.[0];
    venue = platform ? `Online (${smartTitle(platform.toUpperCase()).replace("Microsoft Teams", "Microsoft Teams")})` : "Online";
  }

  /* Fee */
  let fee = "None mentioned";
  const feeSentence = sentences.find((s) => findMoney(s).length && /\b(fee|charge|payable|pay|paid|cost|contribution|amount)\b/i.test(s));
  if (feeSentence) {
    const amount = findMoney(feeSentence)[0];
    const per = feeSentence.slice(feeSentence.indexOf(amount) + amount.length).match(/^\s*(per\s+[\w-]+(?:\s+[\w-]+)?)/i);
    const before = feeSentence.slice(0, feeSentence.indexOf(amount));
    const purpose = before.match(/((?:[\w-]+\s+){0,2}(?:fee|charge|contribution|cost))\s+of\s*$/i)?.[1];
    fee = [amount, per?.[1], purpose ? `(${purpose.replace(/^(an?|the)\s+/i, "").toLowerCase()})` : ""]
      .filter(Boolean)
      .join(" ");
  }

  /* Dress code */
  let dressCode = NOT_MENTIONED;
  const dressSentence = sentences.find((s) => /\b(uniform|dress code|t-shirts?|attire|shoes)\b/i.test(s));
  if (dressSentence) {
    const labelled = dressSentence.match(/dress code\s*[:\-]\s*(.+)/i);
    const inPhrase = dressSentence.match(/\bin\s+(?:their\s+)?(?:respective\s+)?((?:[\w'’-]+\s+){0,3}(?:uniform|t-shirts?|attire|dress)[^.]*)/i);
    dressCode = capitalise(stripTrailingPunct((labelled?.[1] ?? inPhrase?.[1] ?? dressSentence).trim()));
    dressCode = truncateWords(dressCode, 18);
  }

  /* Contact */
  const contactSentence =
    [...sentences].reverse().find((s) => findPhones(s).length || findEmails(s).length) ?? "";
  const phone = findPhones(contactSentence)[0] ?? findPhones(bodyText)[0] ?? "";
  const email = findEmails(contactSentence)[0] ?? findEmails(bodyText)[0] ?? "";
  const person = contactSentence.match(/\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+(?:[A-Z]\.\s*)*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/)?.[0] ?? "";
  const contactParts = [person, phone, !phone ? email : ""].filter(Boolean);
  const contactPerson = contactParts.length ? contactParts.join(", ") : "Class teacher or school office";

  /* Deadline summary */
  const deadline = deadlines.length
    ? deadlines
        .slice(0, 2)
        .map((d) => (d.purpose ? `${d.date} (${d.purpose})` : d.date))
        .join("; ")
    : NOT_MENTIONED;

  const firstEventDate = eventDate.split(" – ")[0];

  return {
    key: {
      eventDate: eventDate || NOT_MENTIONED,
      timings,
      venue,
      feeOrAmount: fee,
      dressCode,
      deadline,
      contactPerson,
    },
    eventIso: firstEventDate ? toIsoDate(firstEventDate, year) : "",
    start: startTime ? toTime24(startTime) : "",
    end: endTime ? toTime24(endTime) : "",
    deadlines,
    eventSentence,
    online,
  };
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

function toTask(sentence: string, facts: Facts): { task: string; deadline?: string } {
  const s = sentence.replace(/^[A-Z][\w\s&/-]{2,30}:\s*/, ""); // drop "Excursion Fee:" style labels
  const lower = s.toLowerCase();
  const dates = findDates(s);
  const lastDate = dates[dates.length - 1];
  const amount = findMoney(s)[0];

  if (/consent|authori[sz]ation|permission/.test(lower) && /(sign|return|submit)/.test(lower)) {
    return { task: "Sign the consent slip and return it to school", deadline: lastDate };
  }
  if (amount && /\b(fee|payable|paid|pay)\b/.test(lower) && lastDate) {
    const via = s.match(/through ([^.,]+?)(?: or | by |,|\.|$)/i)?.[1];
    return {
      task: `Pay ${amount}${via ? ` via ${via.replace(/^the\s+/i, "")}` : ""}`,
      deadline: lastDate,
    };
  }
  if (/medical certificate/.test(lower)) {
    const within = s.match(/within \d+\s*(?:hours|days)/i)?.[0];
    return { task: "If your child misses an exam due to illness, submit a medical certificate", deadline: within };
  }
  if (/\b(students|all students|candidates)\b/.test(lower) && /\b(assemble|report|seated)\b/.test(lower)) {
    const t = s.match(/\bby\s+(\d{1,2}(?:[:.]\d{2})?\s*[ap]\.?m)/i)?.[1] ?? findTimes(s)[0];
    if (t) return { task: `Make sure your child reaches school by ${t}` };
  }
  if (/\blinks?\b/.test(lower) && /(shar|broadcast|send|post)/.test(lower)) {
    const t = findTimes(s)[0];
    const where = /whatsapp/.test(lower) ? " on the class WhatsApp group" : "";
    return { task: `Look out for the class link${where}${t ? ` (shared by ${t})` : ""}` };
  }
  if (/hall ticket|admit card|id card/.test(lower) && /mandatory|must|carry/.test(lower)) {
    return { task: "Check your child carries the admit card / ID card every day" };
  }
  if (/\b(bring|carry)\b/.test(lower) || /^what to bring/i.test(sentence)) {
    return { task: capitalise(truncateWords(stripTrailingPunct(s), 26)) };
  }
  return {
    task: capitalise(truncateWords(stripTrailingPunct(s), 26)),
    deadline: lastDate && !s.includes(lastDate) && lastDate !== facts.key.eventDate ? lastDate : undefined,
  };
}

function extractActions(p: Parsed, facts: Facts, limit: number): ChecklistItem[] {
  const scored = p.body
    .map((s, idx) => {
      let score = 0;
      if (DIRECTIVE.test(s)) score += 2;
      if (/\b(must|mandatory|mandated|compulsory|strictly)\b/i.test(s)) score += 2;
      if (facts.deadlines.some((d) => d.sentence === s)) score += 3;
      if (/\bparents?\b/i.test(s)) score += 1;
      if (findMoney(s).length) score += 1;
      if (/\b(postponed|rescheduled|cancelled|changed to)\b/i.test(s)) score += 2;
      if (/\blinks?\b/i.test(s) && /whatsapp|email|portal/i.test(s)) score += 2;
      if (/^(dear|we are|to foster|in view of|kindly note the following|please take note|key tour highlights)/i.test(s)) score -= 4;
      if (s.endsWith(":")) score -= 4;
      return { s, idx, score };
    })
    .filter((x) => x.score >= 2);

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.idx - b.idx);

  const seen = new Set<string>();
  const items: ChecklistItem[] = [];
  for (const { s } of top) {
    const { task, deadline } = toTask(s, facts);
    if (seen.has(task)) continue;
    seen.add(task);
    items.push({
      id: String(items.length + 1),
      task,
      deadline,
      important: /\b(must|mandatory|mandated|compulsory|strictly|required)\b/i.test(s) || Boolean(deadline),
    });
  }
  if (!items.length) {
    items.push({ id: "1", task: "Read the circular and note the dates", important: false });
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

const CATEGORY_WORDS: Record<Category, RegExp> = {
  Emergency: /\b(rain|flood|cyclone|alert|closed|closure|emergency|urgent|holiday declared|heat ?wave|outbreak|suspended)\b/gi,
  Exams: /\b(exam|examination|assessment|test|hall ticket|admit card|timetable|syllabus|re-?exam)\b/gi,
  Trips: /\b(excursion|field trip|trip|tour|picnic|visit to|planetarium|museum)\b/gi,
  Events: /\b(sports|annual day|celebration|function|competition|fest|meet|ceremony|performance|day)\b/gi,
  "Fees & Permissions": /\b(fee|fees|payment|dues|consent|permission|refund|challan)\b/gi,
  General: /$^/g,
};

function classify(text: string): Category {
  let best: Category = "General";
  let bestScore = 0;
  for (const [cat, rx] of Object.entries(CATEGORY_WORDS) as [Category, RegExp][]) {
    const n = (text.match(rx) || []).length * (cat === "Emergency" ? 1.5 : 1);
    if (n > bestScore) {
      best = cat;
      bestScore = n;
    }
  }
  return bestScore >= 2 ? best : "General";
}

function urgencyOf(text: string, category: Category, facts: Facts): Urgency {
  if (category === "Emergency") return "High";
  const strong = (text.match(/\b(urgent|immediately|tomorrow|mandatory|strictly|compulsory|will not be)\b/gi) || []).length;
  if (strong >= 3) return "High";
  if (facts.deadlines.length || strong >= 1) return "Medium";
  return "Low";
}

/* ------------------------------------------------------------------ */
/* Message composition                                                 */
/* ------------------------------------------------------------------ */

const ICON = {
  megaphone: "\u{1F4E2}",
  calendar: "\u{1F4C5}",
  clock: "\u{23F0}",
  pin: "\u{1F4CD}",
  card: "\u{1F4B3}",
  hourglass: "\u{23F3}",
  shirt: "\u{1F455}",
  check: "\u{2705}",
  phone: "\u{1F4DE}",
  warning: "\u{26A0}\u{FE0F}",
};

function summarySentence(sentence: string): string {
  if (!sentence) return "";
  let s = sentence
    .replace(/^we are (?:immensely |very |extremely )?(?:pleased|happy|glad|delighted) to (?:announce|inform(?: you)?) that\s+/i, "")
    .replace(/^this is to inform (?:you |all parents )?that\s+/i, "")
    .replace(/^kindly note that\s+/i, "");
  if (/^(in view of|to foster|to ensure|as part of|in order to|owing to|due to)\b/i.test(s) && s.includes(",")) {
    s = s.slice(s.indexOf(",") + 1).trim();
  }
  s = s.replace(/^our\s+/i, "The ");
  const out = capitalise(truncateWords(stripTrailingPunct(s), 28));
  return out.endsWith("…") ? out : out + ".";
}

function signatureLine(p: Parsed): string {
  const sig = p.signature.map(stripTrailingPunct).filter(Boolean).slice(0, 2);
  return sig.length ? sig.join(", ") : "School Administration";
}

interface ComposeInput {
  schoolName: string;
  title: string;
  summary: string;
  facts: Facts;
  actions: ChecklistItem[];
  tone: Tone;
  useEmoji: boolean;
  signature: string;
  urgency: Urgency;
}

const due = (d: string) => (/^within/i.test(d) ? d : `by ${d}`);

const show = (v: string) => v && v !== NOT_MENTIONED && v !== "None mentioned";

function composeWhatsApp(c: ComposeInput): string {
  const i = (icon: string) => (c.useEmoji ? `${icon} ` : "");
  const k = c.facts.key;
  const out: string[] = [];

  if (c.tone === "urgent" || c.urgency === "High") out.push(`${i(ICON.warning)}*IMPORTANT*`);
  out.push(`${i(ICON.megaphone)}*${c.schoolName}*`);
  out.push(`*${c.title}*`, "");
  out.push(c.tone === "formal" ? "Dear Parents and Guardians," : "Dear Parents,");
  if (c.summary && c.tone !== "brief") out.push(c.summary);
  out.push("");

  const rows: [string, string, string][] = [
    [ICON.calendar, "Date", k.eventDate],
    [ICON.clock, "Time", k.timings],
    [ICON.pin, "Venue", k.venue],
    [ICON.card, "Fee", k.feeOrAmount],
    [ICON.shirt, "Wear", c.tone === "brief" ? "" : k.dressCode],
    [ICON.hourglass, "Deadline", k.deadline],
  ];
  for (const [icon, label, value] of rows) {
    if (show(value)) out.push(`${i(icon)}*${label}:* ${value}`);
  }

  const actions = c.actions.slice(0, c.tone === "brief" ? 3 : 4);
  if (actions.length) {
    out.push("", `${i(ICON.check)}*What you need to do*`);
    actions.forEach((a, n) => out.push(`${n + 1}. ${a.task}${a.deadline ? ` — ${due(a.deadline)}` : ""}`));
  }

  if (show(k.contactPerson)) {
    out.push("", `${i(ICON.phone)}*Questions:* ${k.contactPerson}`);
  }
  out.push("", c.tone === "formal" ? "Regards," : "Thank you,", `_${c.signature}_`);
  return out.join("\n");
}

function composeTranslation(c: ComposeInput, language: string): { text: string; note?: string } {
  const L = OFFLINE_LABELS[language];
  if (!L) {
    return { text: composeWhatsApp(c) };
  }
  const i = (icon: string) => (c.useEmoji ? `${icon} ` : "");
  const k = c.facts.key;
  const out: string[] = [];
  out.push(`${i(ICON.megaphone)}*${c.schoolName} — ${L.heading}*`);
  out.push(`*${L.subject}:* ${c.title}`, "", L.greeting, L.intro, "");
  const rows: [string, string, string][] = [
    [ICON.calendar, L.date, k.eventDate],
    [ICON.clock, L.time, k.timings],
    [ICON.pin, L.venue, k.venue],
    [ICON.card, L.fee, k.feeOrAmount],
    [ICON.hourglass, L.deadline, k.deadline],
  ];
  for (const [icon, label, value] of rows) if (show(value)) out.push(`${i(icon)}*${label}:* ${value}`);
  if (c.actions.length) {
    out.push("", `${i(ICON.check)}*${L.actions}*`);
    c.actions.slice(0, 4).forEach((a, n) => out.push(`${n + 1}. ${a.task}${a.deadline ? ` (${a.deadline})` : ""}`));
  }
  if (show(k.contactPerson)) out.push("", `${i(ICON.phone)}*${L.contact}:* ${k.contactPerson}`);
  out.push("", L.closing, `_${L.signature}_`);
  return {
    text: out.join("\n"),
    note: `Offline mode translates the headings into ${language}; the action items stay in English. Connect Gemini for a full translation.`,
  };
}

function composeSms(c: ComposeInput): string {
  const k = c.facts.key;
  const parts = [`${c.schoolName}: ${c.title}.`];
  if (show(k.eventDate)) parts.push(`${k.eventDate}${show(k.timings) ? `, ${k.timings}` : ""}.`);
  const firstAction = c.actions.find((a) => a.important) ?? c.actions[0];
  if (firstAction) parts.push(`${firstAction.task}${firstAction.deadline ? ` ${due(firstAction.deadline)}` : ""}.`);
  const phone = findPhones(k.contactPerson)[0];
  if (phone) parts.push(`Queries: ${phone}`);
  let sms = parts.join(" ").replace(/\.\./g, ".");
  if (sms.length > 320) sms = sms.slice(0, 317).replace(/\s+\S*$/, "") + "…";
  return sms;
}

function composeAudio(c: ComposeInput): string {
  const k = c.facts.key;
  const parts = [`Message for parents from ${c.schoolName}, about ${c.title}.`];
  if (c.summary) parts.push(c.summary);
  if (show(k.timings)) parts.push(`Timing: ${k.timings.replace(" – ", " to ")}.`);
  if (c.actions.length) {
    parts.push("Here is what you need to do.");
    c.actions.slice(0, 4).forEach((a) => parts.push(`${a.task}${a.deadline ? `, ${due(a.deadline)}` : ""}.`));
  }
  if (show(k.contactPerson)) parts.push(`For questions, contact ${k.contactPerson}.`);
  parts.push("Thank you.");
  return parts.join(" ");
}

function composeFaqs(facts: Facts, actions: ChecklistItem[]): Faq[] {
  const k = facts.key;
  const faqs: Faq[] = [];
  if (show(k.timings)) faqs.push({ question: "What time should my child be there?", answer: k.timings.replace(" – ", " to ") + "." });
  if (show(k.feeOrAmount)) {
    const feeTask = actions.find((a) => /^Pay /.test(a.task));
    faqs.push({
      question: "Is there anything to pay?",
      answer: feeTask ? `${feeTask.task}${feeTask.deadline ? ` ${due(feeTask.deadline)}` : ""}.` : `Yes: ${k.feeOrAmount}.`,
    });
  }
  if (show(k.dressCode)) faqs.push({ question: "What should my child wear?", answer: k.dressCode + "." });
  if (facts.online) faqs.push({ question: "Where will classes happen?", answer: `${k.venue}. Links will be shared by the class teacher.` });
  else if (show(k.venue)) faqs.push({ question: "Where is it happening?", answer: k.venue + "." });
  faqs.push({
    question: "Who do I contact with questions?",
    answer: show(k.contactPerson) ? k.contactPerson + "." : "Your child's class teacher or the school office.",
  });
  return faqs.slice(0, 4);
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function analyzeOffline(req: ProcessRequest, now = new Date()): NoticeResult {
  const p = parse(req.circularText);
  const facts = extractFacts(p, now.getFullYear());
  const schoolName = req.schoolName.trim() || p.detectedSchool || "Our School";

  const firstUseful = p.lines.find(
    (l) =>
      l.toLowerCase() !== schoolName.toLowerCase() &&
      !/^(circular|ref|date|dated|no\.?)\b/i.test(l) &&
      !GREETING.test(l) &&
      l.length > 8
  );
  const title = smartTitle(p.subject || firstUseful || "School update").replace(/[.:]$/, "");

  const fullText = req.circularText;
  const category = classify(fullText);
  const urgency = urgencyOf(fullText, category, facts);
  const actions = extractActions(p, facts, 5);

  const summarySource =
    p.body.find((s) => s === facts.eventSentence) ??
    p.body.find((s) => !/^(dear|kindly note|please take note)/i.test(s)) ??
    "";

  const compose: ComposeInput = {
    schoolName,
    title,
    summary: summarySentence(summarySource),
    facts,
    actions,
    tone: req.tone,
    useEmoji: req.useEmoji,
    signature: signatureLine(p),
    urgency,
  };

  const whatsappNotice = composeWhatsApp(compose);
  const translated =
    req.targetLanguage === "Simple English"
      ? { text: whatsappNotice, note: undefined }
      : composeTranslation(compose, req.targetLanguage);

  const originalWords = wordCount(fullText);
  const summaryWords = wordCount(whatsappNotice);

  return {
    title,
    urgency,
    category,
    whatsappNotice,
    translatedNotice: translated.text,
    smsNotice: composeSms(compose),
    audioScript: composeAudio(compose),
    targetLanguage: req.targetLanguage,
    keyDetails: facts.key,
    calendar: { date: facts.eventIso, start: facts.start, end: facts.end },
    actionChecklist: actions,
    faqs: composeFaqs(facts, actions),
    meta: {
      engine: "offline",
      model: "Offline reader",
      originalWords,
      summaryWords,
      originalReadSeconds: Math.max(10, Math.round((originalWords / 200) * 60)),
      summaryReadSeconds: Math.max(10, Math.round((summaryWords / 200) * 60)),
      translationNote: translated.note,
    },
  };
}
