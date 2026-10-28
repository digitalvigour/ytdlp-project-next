import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { getCookiesDir } from "@/lib/ytdlp/paths";

/**
 * Accept a Netscape cookies.txt upload and persist under downloads/.cookies/
 */
export async function POST(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const text = await file.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "Empty cookie file" }, { status: 400 });
  }

  const safeName = `${Date.now()}-${randomUUID().slice(0, 8)}.txt`;
  const dest = path.join(getCookiesDir(), safeName);
  await writeFile(dest, text, "utf8");

  return NextResponse.json({ path: dest });
}
