import { NextRequest, NextResponse } from "next/server";
import { analyzeOffline } from "@/lib/offline-engine";
import { analyzeWithGemini } from "@/lib/gemini";
import { LANGUAGES } from "@/lib/languages";
import { rateLimit } from "@/lib/rate-limit";
import type { ProcessRequest, Tone } from "@/lib/types";

export const maxDuration = 60;

const MAX_CHARS = 20_000;
const TONES: Tone[] = ["friendly", "formal", "brief", "urgent"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const circularText = typeof body.circularText === "string" ? body.circularText.trim() : "";
  if (circularText.length < 40) {
    return NextResponse.json(
      { error: "The circular is too short to summarise. Paste the full text (at least a few sentences)." },
      { status: 400 }
    );
  }
  if (circularText.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `The circular is ${circularText.length.toLocaleString()} characters. The limit is ${MAX_CHARS.toLocaleString()}.` },
      { status: 413 }
    );
  }

  const input: ProcessRequest = {
    circularText,
    schoolName: typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 120) : "",
    targetLanguage: LANGUAGES.some((l) => l.name === body.targetLanguage)
      ? (body.targetLanguage as string)
      : LANGUAGES[0].name,
    tone: TONES.includes(body.tone as Tone) ? (body.tone as Tone) : "friendly",
    useEmoji: body.useEmoji !== false,
  };

  const offline = analyzeOffline(input);

  // A key typed in the browser takes precedence over the server's key.
  const headerKey = req.headers.get("x-gemini-key")?.trim();
  const apiKey = headerKey || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || body.engine === "offline") {
    return NextResponse.json(offline);
  }

  try {
    const result = await analyzeWithGemini(input, apiKey, offline);
    return NextResponse.json(result);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Gemini request failed";
    console.error("[process-notice] Gemini failed, using offline reader:", reason);
    return NextResponse.json({
      ...offline,
      meta: { ...offline.meta, fallbackReason: reason.slice(0, 200) },
    });
  }
}
