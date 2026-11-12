import { wordCount } from "./extract";
import type { Category, NoticeResult, ProcessRequest, Tone, Urgency } from "./types";

const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 25_000;

const TONE_GUIDE: Record<Tone, string> = {
  friendly: "Warm, plain and reassuring. Short sentences.",
  formal: "Polite and formal, as a principal would write. No slang.",
  brief: "As short as possible. Only facts parents must act on.",
  urgent: "Direct and urgent. Lead with what changed and what parents must do now.",
};

const SYSTEM_INSTRUCTION = `You turn formal school circulars into messages parents can read in under 30 seconds.

Rules:
- Use only facts stated in the circular. Never invent dates, amounts, venues, names or phone numbers. If something is not stated, write exactly "Not mentioned".
- whatsappNotice: WhatsApp formatting (*bold*, _italic_), short lines, numbered action list, a "Questions" line with the contact. Under 120 words. Do not repeat the school name in the title line.
- translatedNotice: the same message translated naturally into the target language, in the script native to that language. Keep numbers, dates, amounts, phone numbers, emails and proper nouns exactly as written.
- smsNotice: plain text, no emoji, at most 300 characters.
- audioScript: 3–6 spoken sentences in plain English for text-to-speech. No symbols or emoji.
- actionChecklist: 2–5 things parents must actually do, written as imperatives ("Pay Rs. 450 via the parent portal"). important=true when mandatory or deadline-bound.
- faqs: 2–4 questions parents would ask in the class group, answered only from the circular.
- calendar.date: the main event date as YYYY-MM-DD, or "" if there is no single event. calendar.start/end: 24h HH:MM or "".`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    urgency: { type: "STRING", enum: ["High", "Medium", "Low"] },
    category: { type: "STRING", enum: ["Exams", "Events", "Fees & Permissions", "Emergency", "Trips", "General"] },
    whatsappNotice: { type: "STRING" },
    translatedNotice: { type: "STRING" },
    smsNotice: { type: "STRING" },
    audioScript: { type: "STRING" },
    keyDetails: {
      type: "OBJECT",
      properties: {
        eventDate: { type: "STRING" },
        timings: { type: "STRING" },
        venue: { type: "STRING" },
        feeOrAmount: { type: "STRING" },
        dressCode: { type: "STRING" },
        deadline: { type: "STRING" },
        contactPerson: { type: "STRING" },
      },
      required: ["eventDate", "timings", "venue", "feeOrAmount", "dressCode", "deadline", "contactPerson"],
    },
    calendar: {
      type: "OBJECT",
      properties: { date: { type: "STRING" }, start: { type: "STRING" }, end: { type: "STRING" } },
      required: ["date", "start", "end"],
    },
    actionChecklist: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { task: { type: "STRING" }, deadline: { type: "STRING" }, important: { type: "BOOLEAN" } },
        required: ["task", "important"],
      },
    },
    faqs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { question: { type: "STRING" }, answer: { type: "STRING" } },
        required: ["question", "answer"],
      },
    },
  },
  required: [
    "title", "urgency", "category", "whatsappNotice", "translatedNotice", "smsNotice",
    "audioScript", "keyDetails", "calendar", "actionChecklist", "faqs",
  ],
};

export class GeminiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

function modelList(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  return configured ? [configured, ...DEFAULT_MODELS.filter((m) => m !== configured)] : DEFAULT_MODELS;
}

async function callModel(model: string, apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message ?? "";
    } catch {
      /* ignore */
    }
    throw new GeminiError(detail || `Gemini returned HTTP ${res.status}`, res.status);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new GeminiError("Gemini returned an empty response");
  return text;
}

const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback;

/**
 * Runs the circular through Gemini. `base` is the offline result for the same
 * input, used to fill any field the model leaves empty.
 */
export async function analyzeWithGemini(
  req: ProcessRequest,
  apiKey: string,
  base: NoticeResult
): Promise<NoticeResult> {
  const prompt = `School name: ${req.schoolName || "(use the name in the circular)"}
Target language: ${req.targetLanguage}
Tone: ${TONE_GUIDE[req.tone]}
Emoji: ${req.useEmoji ? "Use a few simple emoji as line markers in whatsappNotice and translatedNotice." : "Do not use any emoji."}

Circular:
"""
${req.circularText}
"""`;

  let lastError: unknown;
  for (const model of modelList()) {
    try {
      const raw = await callModel(model, apiKey, prompt);
      const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
      return normalise(parsed, base, req, model);
    } catch (err) {
      lastError = err;
      // A bad key or exhausted quota fails the same way on every model.
      const fatal =
        err instanceof GeminiError &&
        (err.status === 401 || err.status === 403 || err.status === 429 || /api key/i.test(err.message));
      if (fatal) break;
    }
  }
  throw lastError instanceof Error ? lastError : new GeminiError("Gemini request failed");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(p: any, base: NoticeResult, req: ProcessRequest, model: string): NoticeResult {
  const kd = p?.keyDetails ?? {};
  const whatsappNotice = str(p?.whatsappNotice, base.whatsappNotice);
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const hhmm = /^\d{2}:\d{2}$/;
  const cal = p?.calendar ?? {};

  const checklist = Array.isArray(p?.actionChecklist) ? p.actionChecklist : [];
  const faqs = Array.isArray(p?.faqs) ? p.faqs : [];
  const originalWords = wordCount(req.circularText);
  const summaryWords = wordCount(whatsappNotice);

  return {
    title: str(p?.title, base.title),
    urgency: oneOf<Urgency>(p?.urgency, ["High", "Medium", "Low"], base.urgency),
    category: oneOf<Category>(
      p?.category,
      ["Exams", "Events", "Fees & Permissions", "Emergency", "Trips", "General"],
      base.category
    ),
    whatsappNotice,
    translatedNotice: str(p?.translatedNotice, base.translatedNotice),
    smsNotice: str(p?.smsNotice, base.smsNotice).slice(0, 320),
    audioScript: str(p?.audioScript, base.audioScript),
    targetLanguage: req.targetLanguage,
    keyDetails: {
      eventDate: str(kd.eventDate, base.keyDetails.eventDate),
      timings: str(kd.timings, base.keyDetails.timings),
      venue: str(kd.venue, base.keyDetails.venue),
      feeOrAmount: str(kd.feeOrAmount, base.keyDetails.feeOrAmount),
      dressCode: str(kd.dressCode, base.keyDetails.dressCode),
      deadline: str(kd.deadline, base.keyDetails.deadline),
      contactPerson: str(kd.contactPerson, base.keyDetails.contactPerson),
    },
    calendar: {
      date: iso.test(cal.date) ? cal.date : base.calendar.date,
      start: hhmm.test(cal.start) ? cal.start : base.calendar.start,
      end: hhmm.test(cal.end) ? cal.end : base.calendar.end,
    },
    actionChecklist: checklist.length
      ? checklist.slice(0, 6).map((c: { task?: string; deadline?: string; important?: boolean }, i: number) => ({
          id: String(i + 1),
          task: str(c?.task, "Read the circular"),
          deadline: str(c?.deadline, "") || undefined,
          important: Boolean(c?.important),
        }))
      : base.actionChecklist,
    faqs: faqs.length
      ? faqs
          .slice(0, 5)
          .filter((f: { question?: string; answer?: string }) => f?.question && f?.answer)
          .map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))
      : base.faqs,
    meta: {
      engine: "gemini",
      model,
      originalWords,
      summaryWords,
      originalReadSeconds: Math.max(10, Math.round((originalWords / 200) * 60)),
      summaryReadSeconds: Math.max(10, Math.round((summaryWords / 200) * 60)),
    },
  };
}
