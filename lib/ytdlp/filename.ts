import type { DownloadOptions, FilenameMode } from "./types";

/** Safe default: byte-truncated title + id (Linux NAME_MAX is 255 bytes) */
export const AUTO_OUTPUT_TEMPLATE = "%(title).40B [%(id)s].%(ext)s";
export const SHORT_OUTPUT_TEMPLATE = "%(id)s.%(ext)s";

/** Max characters for --trim-filenames (CJK is multi-byte) */
export const SAFE_TRIM_CHARS = 60;

export function sanitizeCustomFilename(raw: string): string {
  let name = raw.trim();
  // Drop path segments / nulls
  name = name.replace(/[/\\:\0]/g, "-");
  name = name.replace(/\s+/g, " ").trim();
  if (!name) return "download";
  // Cap to ~80 bytes for custom basenames
  const encoder = new TextEncoder();
  if (encoder.encode(name).length > 80) {
    let cut = name;
    while (encoder.encode(cut).length > 80 && cut.length > 1) {
      cut = cut.slice(0, -1);
    }
    name = cut.trim() || "download";
  }
  return name;
}

export function resolveOutputTemplate(options: DownloadOptions): {
  output: string;
  trimFilenames: number;
  filenameMode: FilenameMode;
} {
  const mode: FilenameMode = options.filenameMode ?? "auto";
  const trim = Math.min(
    Math.max(1, options.trimFilenames ?? SAFE_TRIM_CHARS),
    SAFE_TRIM_CHARS,
  );

  if (mode === "short") {
    return {
      output: SHORT_OUTPUT_TEMPLATE,
      trimFilenames: trim,
      filenameMode: mode,
    };
  }

  if (mode === "custom") {
    const custom = options.customFilename?.trim();
    if (custom) {
      const base = sanitizeCustomFilename(custom);
      const output = base.includes("%(") ? base : `${base}.%(ext)s`;
      return { output, trimFilenames: trim, filenameMode: mode };
    }
    // Fall through to auto if custom empty
  }

  // auto — always use the safe truncated template (ignore stale long -o values)
  return {
    output: AUTO_OUTPUT_TEMPLATE,
    trimFilenames: trim,
    filenameMode: "auto",
  };
}
