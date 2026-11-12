import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Tells the client whether a server-side Gemini key is configured (never the key itself). */
export function GET() {
  return NextResponse.json({ serverAi: Boolean(process.env.GEMINI_API_KEY?.trim()) });
}
