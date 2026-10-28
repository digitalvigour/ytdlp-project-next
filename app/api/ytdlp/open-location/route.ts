import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { getDownloadsDir } from "@/lib/ytdlp/paths";
import { getStoredTask } from "@/lib/ytdlp/taskStore";

type Body = {
  taskId?: string;
};

function openPath(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("xdg-open", [target], {
      detached: true,
      stdio: "ignore",
    });
    child.on("error", reject);
    child.unref();
    // xdg-open returns quickly; don't wait forever
    setTimeout(() => resolve(), 300);
  });
}

/**
 * Open the downloads folder (or a task's output file) in the desktop file manager.
 */
export async function POST(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const downloads = getDownloadsDir();
  let target = downloads;

  if (body.taskId) {
    const task = getStoredTask(body.taskId);
    if (task?.outputPath && existsSync(/*turbopackIgnore: true*/ task.outputPath)) {
      target = task.outputPath;
    }
  }

  if (!existsSync(/*turbopackIgnore: true*/ target)) {
    return NextResponse.json(
      { error: `Path not found: ${target}` },
      { status: 404 },
    );
  }

  try {
    await openPath(target);
    return NextResponse.json({ ok: true, path: target });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to open location (is xdg-open available?)",
        path: target,
      },
      { status: 500 },
    );
  }
}
