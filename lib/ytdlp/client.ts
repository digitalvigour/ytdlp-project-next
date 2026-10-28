import type {
  AnalyzeRequest,
  DownloadRequest,
  DownloadResponse,
  HealthResponse,
  MediaInfo,
  StatusResponse,
} from "./types";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const errObj = data as { error?: string } | null;
    throw new Error(
      errObj?.error || text || `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function analyzeUrl(body: AnalyzeRequest): Promise<MediaInfo> {
  const res = await fetch("/api/ytdlp/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<MediaInfo>(res);
}

export async function startDownload(
  body: DownloadRequest,
): Promise<DownloadResponse> {
  const res = await fetch("/api/ytdlp/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<DownloadResponse>(res);
}

export async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/ytdlp/status", { method: "GET" });
  return parseJson<StatusResponse>(res);
}

export async function patchStatus(
  action: "cancelAll" | "clearCompleted" | "cancel" | "delete" | "retry",
  taskId?: string,
): Promise<StatusResponse> {
  const res = await fetch("/api/ytdlp/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, taskId }),
  });
  return parseJson<StatusResponse>(res);
}

export async function openLocation(taskId?: string): Promise<{ path: string }> {
  const res = await fetch("/api/ytdlp/open-location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId }),
  });
  return parseJson<{ path: string }>(res);
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/ytdlp/health", { method: "GET" });
  return parseJson<HealthResponse>(res);
}

export async function uploadCookies(
  file: File,
): Promise<{ path: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/ytdlp/cookies", {
    method: "POST",
    body: form,
  });
  return parseJson<{ path: string }>(res);
}
