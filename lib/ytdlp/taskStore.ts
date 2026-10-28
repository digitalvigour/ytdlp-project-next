import type { ChildProcess } from "node:child_process";
import type { DownloadOptions, DownloadTask, TaskStatus } from "./types";

export type StoredTask = DownloadTask & {
  process?: ChildProcess | null;
};

type GlobalStore = typeof globalThis & {
  __ytdlpTaskStore?: StoredTask[];
};

function getStore(): StoredTask[] {
  const g = globalThis as GlobalStore;
  if (!g.__ytdlpTaskStore) {
    g.__ytdlpTaskStore = [];
  }
  return g.__ytdlpTaskStore;
}

/** Public task shape without ChildProcess */
export function toPublicTask(task: StoredTask): DownloadTask {
  const { process: _p, ...rest } = task;
  return rest;
}

export function listTasks(): DownloadTask[] {
  return getStore()
    .map(toPublicTask)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getStoredTask(id: string): StoredTask | undefined {
  return getStore().find((t) => t.id === id);
}

export function addTask(
  partial: Omit<DownloadTask, "id" | "createdAt"> & { id?: string },
): StoredTask {
  const task: StoredTask = {
    ...partial,
    id: partial.id ?? `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    process: null,
  };
  getStore().unshift(task);
  return task;
}

export function updateTask(
  id: string,
  patch: Partial<DownloadTask> & { process?: ChildProcess | null },
): StoredTask | undefined {
  const tasks = getStore();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const next = { ...tasks[idx], ...patch };
  if (patch.logs && patch.logs !== tasks[idx].logs) {
    // already replaced
  } else if (patch.logs === undefined && "logLine" in patch) {
    // no-op
  }
  tasks[idx] = next;
  return tasks[idx];
}

export function appendLog(id: string, line: string, maxLines = 400): void {
  const task = getStoredTask(id);
  if (!task) return;
  const logs = [...task.logs, line];
  if (logs.length > maxLines) logs.splice(0, logs.length - maxLines);
  task.logs = logs;
}

export function setTaskProcess(id: string, proc: ChildProcess | null): void {
  const task = getStoredTask(id);
  if (task) task.process = proc;
}

export function killTaskProcess(id: string): boolean {
  const task = getStoredTask(id);
  if (!task?.process || task.process.killed) return false;
  try {
    task.process.kill("SIGTERM");
    return true;
  } catch {
    return false;
  }
}

export function removeTask(id: string): boolean {
  killTaskProcess(id);
  const tasks = getStore();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

export function clearCompleted(): void {
  const g = globalThis as GlobalStore;
  g.__ytdlpTaskStore = getStore().filter(
    (t) => t.status !== "completed" && t.status !== "error",
  );
}

export function cancelAllActive(): void {
  for (const task of getStore()) {
    if (task.status === "downloading" || task.status === "queued") {
      killTaskProcess(task.id);
      task.status = "error";
      task.speed = "0 B/s";
      task.eta = "Cancelled";
      task.logs.push("[studio] Cancelled by user");
      task.process = null;
    }
  }
}

export function formatLabelFromOptions(options: DownloadOptions): string {
  if (options.downloadMode === "subs") {
    return `Subs (${options.subLangs || "en"})`;
  }
  if (options.downloadMode === "audio" || options.extractAudio) {
    return `${(options.audioFormat ?? "mp3").toUpperCase()} Audio`;
  }
  const h = options.maxHeight;
  if (h === "worst") return "Lowest";
  return `${h ?? 1080}p (${(options.mergeOutputFormat ?? "mp4").toUpperCase()})`;
}

export function setStatus(id: string, status: TaskStatus): void {
  const task = getStoredTask(id);
  if (task) task.status = status;
}
