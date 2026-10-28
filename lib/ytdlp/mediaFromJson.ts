import type { MediaFormat, MediaInfo } from "./types";

type YtDlpFormat = {
  format_id?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number | null;
  filesize_approx?: number | null;
  format_note?: string;
};

type YtDlpEntry = {
  id?: string;
  title?: string;
  fulltitle?: string;
  uploader?: string;
  channel?: string;
  creator?: string;
  duration?: number | null;
  duration_string?: string;
  view_count?: number | null;
  thumbnail?: string;
  thumbnails?: { url?: string }[];
  upload_date?: string;
  extractor?: string;
  extractor_key?: string;
  webpage_url_domain?: string;
  formats?: YtDlpFormat[];
  entries?: (YtDlpEntry | null)[];
  _type?: string;
};

function formatDuration(seconds?: number | null, fallback?: string): string {
  if (fallback) return fallback;
  if (seconds == null || Number.isNaN(seconds)) return "--:--";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(count?: number | null): string {
  if (count == null) return "—";
  return `${count.toLocaleString()} views`;
}

function formatUploadDate(raw?: string): string | undefined {
  if (!raw || raw.length !== 8) return raw;
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return `${y}-${m}-${d}`;
}

function mapFormats(formats: YtDlpFormat[] | undefined): MediaFormat[] {
  if (!formats?.length) return [];
  return formats.slice(0, 40).map((f) => ({
    formatId: f.format_id ?? "?",
    ext: f.ext ?? "?",
    resolution:
      f.resolution ||
      (f.width && f.height ? `${f.width}x${f.height}` : undefined),
    fps: f.fps ?? undefined,
    vcodec: f.vcodec && f.vcodec !== "none" ? f.vcodec : undefined,
    acodec: f.acodec && f.acodec !== "none" ? f.acodec : undefined,
    filesize: f.filesize ?? f.filesize_approx ?? undefined,
    note: f.format_note,
  }));
}

function entryToMedia(entry: YtDlpEntry, isPlaylist = false): MediaInfo {
  const thumb =
    entry.thumbnail ||
    entry.thumbnails?.find((t) => t.url)?.url ||
    "";

  return {
    id: entry.id ?? "unknown",
    title: entry.title || entry.fulltitle || "Untitled",
    uploader: entry.uploader || entry.channel || entry.creator || "Unknown",
    duration: isPlaylist
      ? `${entry.entries?.filter(Boolean).length ?? 0} items`
      : formatDuration(entry.duration, entry.duration_string),
    views: formatViews(entry.view_count),
    thumbnail: thumb,
    uploadDate: formatUploadDate(entry.upload_date),
    provider: entry.extractor_key || entry.extractor || "yt-dlp",
    streamCount: entry.formats?.length ?? entry.entries?.length ?? 0,
    formats: mapFormats(entry.formats),
    isPlaylist,
  };
}

/** Map yt-dlp -J JSON object to MediaInfo */
export function mediaFromJson(raw: unknown): MediaInfo {
  const data = raw as YtDlpEntry;
  const isPlaylist =
    data._type === "playlist" ||
    (Array.isArray(data.entries) && data.entries.length > 0);

  if (isPlaylist) {
    return entryToMedia(data, true);
  }
  return entryToMedia(data, false);
}

/** Extract first usable title/uploader/thumb from -J for download task seeding */
export function seedMetaFromJson(raw: unknown): {
  title: string;
  uploader: string;
  thumbnail: string;
} {
  const media = mediaFromJson(raw);
  return {
    title: media.title,
    uploader: media.uploader,
    thumbnail: media.thumbnail,
  };
}
