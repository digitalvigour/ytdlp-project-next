import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { analyzeWithYtDlp } from "@/lib/ytdlp/runner";
import type { AnalyzeRequest } from "@/lib/ytdlp/types";

export async function POST(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.url?.trim()) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const media = await analyzeWithYtDlp(body);
    return NextResponse.json(media);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analyze failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
