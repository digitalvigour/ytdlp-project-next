/** Mirrors vendor/yt-dlp/yt_dlp/cookies.py SUPPORTED_BROWSERS */
export const SUPPORTED_BROWSERS = [
  "brave",
  "chrome",
  "chromium",
  "edge",
  "firefox",
  "opera",
  "safari",
  "vivaldi",
  "whale",
] as const;

export type SupportedBrowser = (typeof SUPPORTED_BROWSERS)[number];

export type CookieMode = "none" | "browser" | "file";
