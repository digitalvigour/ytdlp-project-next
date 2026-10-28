import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { getDownloadsDir, resolveDenoPath } from "@/lib/ytdlp/paths";
import { getYtDlpVersion } from "@/lib/ytdlp/runner";

export async function GET(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  const denoPath = resolveDenoPath();

  try {
    const version = await getYtDlpVersion();
    return NextResponse.json({
      ok: true,
      version,
      downloadsDir: getDownloadsDir(),
      denoAvailable: Boolean(denoPath),
      denoPath,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        version: null,
        downloadsDir: getDownloadsDir(),
        denoAvailable: Boolean(denoPath),
        denoPath,
        error: e instanceof Error ? e.message : "yt-dlp unavailable",
      },
      { status: 503 },
    );
  }
}
