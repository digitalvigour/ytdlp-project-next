import { existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export function getProjectRoot(): string {
  return process.cwd();
}

export function getDownloadsDir(): string {
  const dir =
    process.env.YTDLP_DOWNLOAD_DIR?.trim() ||
    path.join(getProjectRoot(), "downloads");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getCookiesDir(): string {
  const dir = path.join(getDownloadsDir(), ".cookies");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function resolveYtDlpBin(): string {
  return process.env.YTDLP_BIN?.trim() || "yt-dlp";
}

/** Path to ffmpeg binary or directory, if known */
export function resolveFfmpegLocation(): string | undefined {
  const fromEnv = process.env.FFMPEG_LOCATION?.trim();
  if (fromEnv) return fromEnv;
  if (existsSync(/*turbopackIgnore: true*/ "/usr/bin/ffmpeg")) {
    return "/usr/bin/ffmpeg";
  }
  return undefined;
}

export function resolveDenoPath(): string | null {
  const fromEnv = process.env.DENO_PATH?.trim();
  if (fromEnv && existsSync(/*turbopackIgnore: true*/ fromEnv)) return fromEnv;
  const home = os.homedir();
  const candidates = [
    path.join(home, ".deno", "bin", "deno"),
    "/usr/local/bin/deno",
    "/usr/bin/deno",
  ];
  for (const c of candidates) {
    if (existsSync(/*turbopackIgnore: true*/ c)) return c;
  }
  return null;
}

/** Env for child processes so yt-dlp can find deno even if Next was started without it on PATH */
export function spawnEnv(): NodeJS.ProcessEnv {
  const deno = resolveDenoPath();
  const denoBinDir = deno ? path.dirname(deno) : null;
  const pathParts = [
    denoBinDir,
    path.join(os.homedir(), ".local", "bin"),
    process.env.PATH || "",
  ].filter(Boolean);
  return {
    ...process.env,
    PATH: pathParts.join(path.delimiter),
    ...(deno ? { DENO_DIR: path.join(os.homedir(), ".deno") } : {}),
  };
}

export function defaultJsRuntimes(): string {
  const deno = resolveDenoPath();
  if (deno) return `deno:${deno}`;
  return "deno";
}
