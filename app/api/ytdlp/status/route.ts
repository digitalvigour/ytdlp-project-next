import { NextResponse } from "next/server";
import { assertLocalhost } from "@/lib/ytdlp/localhost";
import { startDownloadTask } from "@/lib/ytdlp/runner";
import {
  cancelAllActive,
  clearCompleted,
  getStoredTask,
  killTaskProcess,
  listTasks,
  removeTask,
  updateTask,
} from "@/lib/ytdlp/taskStore";

export async function GET(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;
  return NextResponse.json({ tasks: listTasks() });
}

type StatusActionBody = {
  action: "cancelAll" | "clearCompleted" | "cancel" | "delete" | "retry";
  taskId?: string;
};

export async function POST(request: Request) {
  const blocked = assertLocalhost(request);
  if (blocked) return blocked;

  let body: StatusActionBody;
  try {
    body = (await request.json()) as StatusActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  switch (body.action) {
    case "cancelAll":
      cancelAllActive();
      break;
    case "clearCompleted":
      clearCompleted();
      break;
    case "cancel":
      if (body.taskId) {
        killTaskProcess(body.taskId);
        updateTask(body.taskId, {
          status: "error",
          eta: "Cancelled",
          speed: "0 B/s",
        });
      }
      break;
    case "delete":
      if (body.taskId) removeTask(body.taskId);
      break;
    case "retry": {
      if (!body.taskId) {
        return NextResponse.json(
          { error: "taskId is required" },
          { status: 400 },
        );
      }
      const old = getStoredTask(body.taskId);
      if (!old) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      if (old.status !== "error") {
        return NextResponse.json(
          { error: "Only failed or cancelled tasks can be retried" },
          { status: 400 },
        );
      }
      await startDownloadTask(old.options, {
        title: old.title,
        uploader: old.uploader,
        thumbnail: old.thumbnail,
      });
      removeTask(old.id);
      break;
    }
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  return NextResponse.json({ tasks: listTasks() });
}
