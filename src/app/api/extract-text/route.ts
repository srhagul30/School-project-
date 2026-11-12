import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's request body limit is 4.5 MB

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`pdf:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many uploads. Try again in ${limit.retryAfter} seconds.` }, { status: 429 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ error: "Upload a PDF file in the 'file' field." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That PDF is larger than 4 MB. Copy the text in instead." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
    return NextResponse.json({ error: "That file isn't a PDF." }, { status: 415 });
  }

  try {
    const pdf = await getDocumentProxy(bytes);
    const { text, totalPages } = await extractText(pdf, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text]).map((t) => t.replace(/[ \t]+/g, " ").trim());
    const joined = pages.join("\n\n").trim();
    if (joined.length < 20) {
      return NextResponse.json(
        { error: "This PDF has no selectable text (it may be a scan). Type or paste the circular instead." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text: joined, pages: totalPages });
  } catch {
    return NextResponse.json({ error: "Couldn't read that PDF. It may be encrypted or damaged." }, { status: 422 });
  }
}
