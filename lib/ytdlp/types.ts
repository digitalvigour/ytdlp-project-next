import type { CookieMode, SupportedBrowser } from "./browsers";

export type DownloadMode = "video" | "audio" | "subs";

/** How the output basename is chosen (avoids Linux NAME_MAX / Errno 36) */
export type FilenameMode = "auto" | "short" | "custom";

export type TaskStatus = "queued" | "downloading" | "paused" | "completed" | "error";

export type MediaFormat = {
  formatId: string;
  ext: string;
  resolution?: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  note?: string;
};

export type MediaInfo = {
  id: string;
  title: string;
  uploader: string;
  duration: string;
  views: string;
  thumbnail: string;
  uploadDate?: string;
  provider: string;
  streamCount: number;
  formats: MediaFormat[];
  isPlaylist?: boolean;
};

export type CookiesFromBrowser = {
  browser: SupportedBrowser;
  keyring?: string;
  profile?: string;
  container?: string;
};

export type DownloadOptions = {
  urls: string[];
  downloadMode: DownloadMode;
  /** yt-dlp -f */
  format?: string;
  /** height cap used to build format when format is unset (UI convenience) */
  maxHeight?: number | "worst";
  mergeOutputFormat?: string;
  extractAudio?: boolean;
  audioFormat?: string;
  audioQuality?: string;
  writeSubs?: boolean;
  writeAutoSubs?: boolean;
  subLangs?: string;
  embedSubs?: boolean;
  embedThumbnail?: boolean;
  embedMetadata?: boolean;
  embedChapters?: boolean;
  sponsorblockRemove?: string;
  output?: string;
  paths?: string;
  /** auto = truncated title; short = video id only; custom = customFilename */
  filenameMode?: FilenameMode;
  /** Basename for custom mode (extension added automatically) */
  customFilename?: string;
  /** --trim-filenames LENGTH in characters; clamped server-side for CJK safety */
  trimFilenames?: number;
  limitRate?: string;
  cookieMode: CookieMode;
  cookiesFromBrowser?: CookiesFromBrowser;
  cookieFile?: string;
  /** --js-runtimes e.g. "deno" or "deno:/home/user/.deno/bin/deno" */
  jsRuntimes?: string;
  /** --extractor-args e.g. "youtube:player_client=default" */
  extractorArgs?: string;
  /** Suppress yt-dlp update nag */
  noUpdate?: boolean;
  /** analyze / progress plumbing */
  dumpSingleJson?: boolean;
  simulate?: boolean;
  newline?: boolean;
  progressTemplate?: string;
};

export type DownloadTask = {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  progress: number;
  speed: string;
  eta: string;
  size: string;
  status: TaskStatus;
  formatLabel: string;
  logs: string[];
  options: DownloadOptions;
  /** Absolute path to the primary output file when known */
  outputPath?: string;
  createdAt: number;
};

export type AnalyzeRequest = {
  url: string;
  cookieMode?: CookieMode;
  cookiesFromBrowser?: CookiesFromBrowser;
  cookieFile?: string;
};

export type HealthResponse = {
  ok: boolean;
  version: string | null;
  downloadsDir: string;
  denoAvailable: boolean;
  denoPath: string | null;
  error?: string;
};

export type DownloadRequest = DownloadOptions & {
  seed?: {
    title?: string;
    uploader?: string;
    thumbnail?: string;
  };
};

export type DownloadResponse = {
  taskId: string;
};

export type StatusResponse = {
  tasks: DownloadTask[];
};

export type DefaultStudioOptions = Omit<DownloadOptions, "urls"> & {
  urls: string[];
};
