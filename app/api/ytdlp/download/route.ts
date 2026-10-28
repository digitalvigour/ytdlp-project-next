import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { startDownloadTask } from "@/lib/ytdlp/runner";
import type { DownloadRequest } from "@/lib/ytdlp/types";

export async function POST(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  let body: DownloadRequest;
  try {
    body = (await request.json()) as DownloadRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { seed, ...options } = body;
  const url = options.urls?.[0]?.trim();
  if (!url) {
    return NextResponse.json(
      { error: "urls[0] is required" },
      { status: 400 },
    );
  }

  try {
    const task = await startDownloadTask(options, {
      title: seed?.title || url,
      uploader: seed?.uploader,
      thumbnail: seed?.thumbnail,
    });
    return NextResponse.json({ taskId: task.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
