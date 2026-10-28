import { spawn } from "node:child_process";
import { buildArgs, formatCookiesFromBrowser } from "./buildArgs";
import { mediaFromJson, seedMetaFromJson } from "./mediaFromJson";
import { parseProgressLine } from "./parseProgress";
import { resolveOutputTemplate } from "./filename";
import {
  defaultJsRuntimes,
  getDownloadsDir,
  resolveFfmpegLocation,
  resolveYtDlpBin,
  spawnEnv,
} from "./paths";
import {
  addTask,
  appendLog,
  formatLabelFromOptions,
  setTaskProcess,
  updateTask,
} from "./taskStore";
import type {
  AnalyzeRequest,
  DownloadOptions,
  DownloadTask,
  MediaInfo,
} from "./types";

function cookieArgsFromAnalyze(req: AnalyzeRequest): string[] {
  const args: string[] = [];
  if (req.cookieMode === "browser" && req.cookiesFromBrowser) {
    args.push(
      "--cookies-from-browser",
      formatCookiesFromBrowser(req.cookiesFromBrowser),
    );
  } else if (req.cookieMode === "file" && req.cookieFile) {
    args.push("--cookies", req.cookieFile);
  } else if (req.cookiesFromBrowser) {
    args.push(
      "--cookies-from-browser",
      formatCookiesFromBrowser(req.cookiesFromBrowser),
    );
  } else if (req.cookieFile) {
    args.push("--cookies", req.cookieFile);
  }
  return args;
}

function withBinaryExtras(args: string[]): string[] {
  const extras: string[] = [];
  const ffmpeg = resolveFfmpegLocation();
  if (ffmpeg) extras.push("--ffmpeg-location", ffmpeg);
  return [...extras, ...args];
}

/** Ensure Deno / safe filenames / etc. for YouTube hardening */
function withStudioDefaults(options: DownloadOptions): DownloadOptions {
  const resolved = resolveOutputTemplate(options);
  return {
    ...options,
    noUpdate: options.noUpdate !== false,
    jsRuntimes: options.jsRuntimes?.trim() || defaultJsRuntimes(),
    filenameMode: resolved.filenameMode,
    output: resolved.output,
    trimFilenames: resolved.trimFilenames,
  };
}

export async function getYtDlpVersion(): Promise<string> {
  const bin = resolveYtDlpBin();
  return new Promise((resolve, reject) => {
    const child = spawn(bin, ["--version"], { env: spawnEnv() });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(out.trim() || "unknown");
      else reject(new Error(err.trim() || `yt-dlp --version exited ${code}`));
    });
  });
}

export async function analyzeWithYtDlp(
  req: AnalyzeRequest,
): Promise<MediaInfo> {
  const bin = resolveYtDlpBin();
  const args = withBinaryExtras([
    "--no-update",
    "--js-runtimes",
    defaultJsRuntimes(),
    "-J",
    "--no-playlist",
    ...cookieArgsFromAnalyze(req),
    "--",
    req.url.trim(),
  ]);

  // Allow playlists: if URL looks like playlist, don't force --no-playlist
  const url = req.url.trim();
  if (
    url.includes("list=") ||
    url.includes("/playlist") ||
    url.includes("/sets/")
  ) {
    const idx = args.indexOf("--no-playlist");
    if (idx !== -1) args.splice(idx, 1);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { env: spawnEnv() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (e) => {
      reject(
        new Error(
          `Failed to start yt-dlp (${bin}): ${e.message}. Is yt-dlp on PATH?`,
        ),
      );
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr.trim().split("\n").slice(-8).join("\n") ||
              `yt-dlp exited with code ${code}`,
          ),
        );
        return;
      }
      try {
        const json = JSON.parse(stdout);
        resolve(mediaFromJson(json));
      } catch {
        reject(
          new Error(
            "Failed to parse yt-dlp JSON output. " +
              (stderr.trim().slice(-500) || stdout.slice(0, 200)),
          ),
        );
      }
    });
  });
}

function buildDownloadArgv(options: DownloadOptions): string[] {
  const downloads = getDownloadsDir();
  const opts = withStudioDefaults({
    ...options,
    dumpSingleJson: false,
    simulate: false,
    newline: true,
    paths: options.paths || downloads,
  });
  return withBinaryExtras(buildArgs(opts));
}

export async function startDownloadTask(
  options: DownloadOptions,
  seed?: { title?: string; uploader?: string; thumbnail?: string },
): Promise<DownloadTask> {
  const url = options.urls[0]?.trim();
  if (!url) throw new Error("urls[0] is required");

  const bin = resolveYtDlpBin();
  const args = buildDownloadArgv(options);

  const task = addTask({
    title: seed?.title || url,
    uploader: seed?.uploader || "—",
    thumbnail: seed?.thumbnail || "",
    progress: 0,
    speed: "—",
    eta: "—",
    size: "—",
    status: "downloading",
    formatLabel: formatLabelFromOptions(options),
    logs: [`[studio] spawn ${bin} ${args.join(" ")}`],
    options,
  });

  const child = spawn(bin, args, { env: spawnEnv() });
  setTaskProcess(task.id, child);

  let buffer = "";
  const onChunk = (chunk: Buffer, stream: "stdout" | "stderr") => {
    const text = chunk.toString();
    buffer += text;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      appendLog(task.id, trimmed);
      const progress = parseProgressLine(trimmed);
      if (progress) {
        updateTask(task.id, {
          ...(progress.progress != null
            ? { progress: progress.progress }
            : {}),
          ...(progress.speed ? { speed: progress.speed } : {}),
          ...(progress.eta ? { eta: progress.eta } : {}),
          ...(progress.size ? { size: progress.size } : {}),
        });
      }
      // Capture destination / merged output path
      const dest = trimmed.match(/\[download\] Destination: (.+)/i);
      if (dest) {
        updateTask(task.id, { outputPath: dest[1] });
        appendLog(task.id, `[studio] writing ${dest[1]}`);
      }
      const merged = trimmed.match(
        /\[Merger\] Merging formats into "(.+)"/i,
      );
      if (merged) {
        updateTask(task.id, { outputPath: merged[1] });
      }
      const already = trimmed.match(
        /\[download\] (.+) has already been downloaded/i,
      );
      if (already && !already[1].includes("%")) {
        updateTask(task.id, { outputPath: already[1] });
      }
    }
    void stream;
  };

  child.stdout.on("data", (d) => onChunk(d, "stdout"));
  child.stderr.on("data", (d) => onChunk(d, "stderr"));

  child.on("error", (e) => {
    updateTask(task.id, {
      status: "error",
      eta: "Error",
      speed: "0 B/s",
    });
    appendLog(task.id, `[studio] process error: ${e.message}`);
    setTaskProcess(task.id, null);
  });

  child.on("close", (code, signal) => {
    setTaskProcess(task.id, null);
    if (signal === "SIGTERM" || signal === "SIGKILL") {
      updateTask(task.id, {
        status: "error",
        eta: "Cancelled",
        speed: "0 B/s",
      });
      appendLog(task.id, `[studio] killed (${signal})`);
      return;
    }
    if (code === 0) {
      updateTask(task.id, {
        status: "completed",
        progress: 100,
        speed: "0 B/s",
        eta: "Finished",
      });
      appendLog(task.id, "[studio] download finished");
    } else {
      updateTask(task.id, {
        status: "error",
        eta: "Error",
        speed: "0 B/s",
      });
      appendLog(task.id, `[studio] yt-dlp exited with code ${code}`);
    }
  });

  return {
    id: task.id,
    title: task.title,
    uploader: task.uploader,
    thumbnail: task.thumbnail,
    progress: task.progress,
    speed: task.speed,
    eta: task.eta,
    size: task.size,
    status: task.status,
    formatLabel: task.formatLabel,
    logs: task.logs,
    options: task.options,
    createdAt: task.createdAt,
  };
}

/** Best-effort metadata seed without blocking download start too long */
export async function quickSeedMeta(
  url: string,
  cookieOpts: Pick<
    DownloadOptions,
    "cookieMode" | "cookiesFromBrowser" | "cookieFile"
  >,
): Promise<{ title: string; uploader: string; thumbnail: string } | null> {
  try {
    const media = await analyzeWithYtDlp({
      url,
      cookieMode: cookieOpts.cookieMode,
      cookiesFromBrowser: cookieOpts.cookiesFromBrowser,
      cookieFile: cookieOpts.cookieFile,
    });
    return {
      title: media.title,
      uploader: media.uploader,
      thumbnail: media.thumbnail,
    };
  } catch {
    return null;
  }
}

export { seedMetaFromJson };
