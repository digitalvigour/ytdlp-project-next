import { resolveOutputTemplate } from "./filename";
import type { CookiesFromBrowser, DownloadOptions } from "./types";

/** Format BROWSER[+KEYRING][:PROFILE][::CONTAINER] per yt-dlp --cookies-from-browser */
export function formatCookiesFromBrowser(spec: CookiesFromBrowser): string {
  let value = spec.browser;
  if (spec.keyring) value += `+${spec.keyring}`;
  if (spec.profile) value += `:${spec.profile}`;
  if (spec.container) value += `::${spec.container}`;
  return value;
}

function resolveFormat(options: DownloadOptions): string | undefined {
  if (options.format) return options.format;
  if (
    options.extractAudio ||
    options.downloadMode === "audio" ||
    options.downloadMode === "subs"
  ) {
    return undefined;
  }
  if (options.maxHeight === "worst") return "worstvideo+worstaudio/worst";
  if (typeof options.maxHeight === "number") {
    return `bestvideo[height<=${options.maxHeight}]+bestaudio/best`;
  }
  return "bestvideo+bestaudio/best";
}

/**
 * Maps DownloadOptions → argv for `yt-dlp` (without the binary name).
 * Keep in sync with vendor/yt-dlp/yt_dlp/options.py and docs/ytdlp-reference.md.
 */
export function buildArgs(options: DownloadOptions): string[] {
  const args: string[] = [];
  const isSubs = options.downloadMode === "subs";
  const extractAudio =
    !isSubs &&
    (options.extractAudio === true || options.downloadMode === "audio");

  if (options.noUpdate !== false) args.push("--no-update");
  if (options.jsRuntimes) {
    args.push("--js-runtimes", options.jsRuntimes);
  }
  if (options.extractorArgs) {
    args.push("--extractor-args", options.extractorArgs);
  }

  if (options.dumpSingleJson) args.push("-J");
  if (options.simulate) args.push("--simulate");
  if (options.newline) args.push("--newline");
  if (options.progressTemplate) {
    args.push("--progress-template", options.progressTemplate);
  }

  if (isSubs) {
    // Subtitles only — no media download
    args.push("--skip-download");
    args.push("--write-subs");
    if (options.writeAutoSubs !== false) args.push("--write-auto-subs");
    args.push("--sub-langs", options.subLangs?.trim() || "en.*,en");
  } else if (extractAudio) {
    args.push("-x");
    if (options.audioFormat) args.push("--audio-format", options.audioFormat);
    if (options.audioQuality) args.push("--audio-quality", options.audioQuality);
  } else {
    const format = resolveFormat(options);
    if (format) args.push("-f", format);
    if (options.mergeOutputFormat) {
      args.push("--merge-output-format", options.mergeOutputFormat);
    }
  }

  if (!isSubs) {
    if (options.writeSubs) args.push("--write-subs");
    if (options.writeAutoSubs) args.push("--write-auto-subs");
    if (options.subLangs) args.push("--sub-langs", options.subLangs);
    if (options.embedSubs) args.push("--embed-subs");
    if (options.embedThumbnail) args.push("--embed-thumbnail");
    if (options.embedMetadata) args.push("--embed-metadata");
    if (options.embedChapters) args.push("--embed-chapters");
    if (options.sponsorblockRemove) {
      args.push("--sponsorblock-remove", options.sponsorblockRemove);
    }
  }

  const resolved = resolveOutputTemplate(options);
  args.push("-o", resolved.output);
  if (options.paths) args.push("-P", options.paths);
  args.push("--trim-filenames", String(resolved.trimFilenames));
  if (options.limitRate) args.push("-r", options.limitRate);

  if (options.cookieMode === "browser" && options.cookiesFromBrowser) {
    args.push(
      "--cookies-from-browser",
      formatCookiesFromBrowser(options.cookiesFromBrowser),
    );
  } else if (options.cookieMode === "file" && options.cookieFile) {
    args.push("--cookies", options.cookieFile);
  }

  for (const url of options.urls) {
    if (url.trim()) args.push(url.trim());
  }

  return args;
}

/** Human-readable command preview for the UI */
export function buildCommandPreview(options: DownloadOptions): string {
  const args = buildArgs(options);
  const quoted = args.map((arg) =>
    /[\s"'\\]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg,
  );
  return ["yt-dlp", ...quoted].join(" ");
}

export function createDefaultOptions(url = ""): DownloadOptions {
  return {
    urls: url ? [url] : [],
    downloadMode: "video",
    maxHeight: 2160,
    mergeOutputFormat: "mp4",
    extractAudio: false,
    audioFormat: "mp3",
    audioQuality: "0",
    writeSubs: false,
    writeAutoSubs: false,
    subLangs: undefined,
    embedSubs: false,
    embedThumbnail: true,
    embedMetadata: true,
    embedChapters: false,
    sponsorblockRemove: "sponsor",
    filenameMode: "auto",
    customFilename: "",
    output: "%(title).40B [%(id)s].%(ext)s",
    trimFilenames: 60,
    limitRate: undefined,
    cookieMode: "none",
    cookiesFromBrowser: { browser: "chrome" },
    cookieFile: undefined,
    jsRuntimes: "deno",
    extractorArgs: undefined,
    noUpdate: true,
    newline: true,
  };
}
