import { NextResponse } from "next/server";

/** Reject non-localhost callers for yt-dlp routes (local desktop GUI). */
export function assertLocalhost(request: Request): NextResponse | null {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const hostname = host.split(":")[0]?.toLowerCase() || "";

  const allowed =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1";

  // Also allow empty host in some local test contexts
  if (!hostname || allowed) return null;

  return NextResponse.json(
    { error: "yt-dlp API is only available on localhost" },
    { status: 403 },
  );
}
