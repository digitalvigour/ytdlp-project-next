"use client";

import { Captions, CloudDownload, Film, Headphones } from "lucide-react";
import type { ReactNode } from "react";
import {
  AUTO_OUTPUT_TEMPLATE,
  SHORT_OUTPUT_TEMPLATE,
} from "@/lib/ytdlp/filename";
import type {
  DownloadMode,
  DownloadOptions,
  FilenameMode,
} from "@/lib/ytdlp/types";

type Props = {
  options: DownloadOptions;
  starting: boolean;
  onPatch: (patch: Partial<DownloadOptions>) => void;
  onDownload: () => void;
};

export function FormatOptions({
  options,
  starting,
  onPatch,
  onDownload,
}: Props) {
  const mode = options.downloadMode;
  const isVideo = mode === "video";
  const isAudio = mode === "audio";
  const isSubs = mode === "subs";

  const setMode = (next: DownloadMode) => {
    if (next === "video") {
      onPatch({
        downloadMode: "video",
        extractAudio: false,
        embedThumbnail: true,
        embedMetadata: true,
      });
    } else if (next === "audio") {
      onPatch({
        downloadMode: "audio",
        extractAudio: true,
        embedThumbnail: true,
        embedMetadata: true,
      });
    } else {
      onPatch({
        downloadMode: "subs",
        extractAudio: false,
        writeSubs: true,
        writeAutoSubs: true,
        subLangs: options.subLangs || "en.*,en",
        embedSubs: false,
        embedThumbnail: false,
        embedMetadata: false,
        sponsorblockRemove: undefined,
      });
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-5">
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 text-[11px] font-medium sm:text-xs">
          <ModeTab
            active={isVideo}
            onClick={() => setMode("video")}
            icon={<Film className="h-3.5 w-3.5 shrink-0" />}
            label="Video"
          />
          <ModeTab
            active={isAudio}
            onClick={() => setMode("audio")}
            icon={<Headphones className="h-3.5 w-3.5 shrink-0" />}
            label="Audio"
          />
          <ModeTab
            active={isSubs}
            onClick={() => setMode("subs")}
            icon={<Captions className="h-3.5 w-3.5 shrink-0" />}
            label="Subs"
          />
        </div>

        {isVideo ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Resolution">
              <select
                value={String(options.maxHeight ?? 2160)}
                onChange={(e) => {
                  const v = e.target.value;
                  onPatch({
                    maxHeight: v === "worst" ? "worst" : Number(v),
                    format: undefined,
                  });
                }}
                className={selectClass}
              >
                <option value="2160">4K (2160p)</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="worst">Lowest</option>
              </select>
            </Field>
            <Field label="Container">
              <select
                value={options.mergeOutputFormat ?? "mp4"}
                onChange={(e) => onPatch({ mergeOutputFormat: e.target.value })}
                className={selectClass}
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
              </select>
            </Field>
          </div>
        ) : null}

        {isAudio ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Audio format">
              <select
                value={options.audioFormat ?? "mp3"}
                onChange={(e) => onPatch({ audioFormat: e.target.value })}
                className={selectClass}
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A / AAC</option>
                <option value="flac">FLAC</option>
                <option value="opus">OPUS</option>
                <option value="wav">WAV</option>
              </select>
            </Field>
            <Field label="Audio quality">
              <select
                value={options.audioQuality ?? "0"}
                onChange={(e) => onPatch({ audioQuality: e.target.value })}
                className={selectClass}
              >
                <option value="0">Best (VBR 0)</option>
                <option value="2">High (VBR 2)</option>
                <option value="5">Standard (VBR 5)</option>
                <option value="128K">128 kbps</option>
              </select>
            </Field>
          </div>
        ) : null}

        {isSubs ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Subtitle languages">
              <select
                value={
                  options.writeAutoSubs &&
                  (options.subLangs === "en.*,en" ||
                    options.subLangs === "en" ||
                    !options.subLangs)
                    ? "auto-en"
                    : options.subLangs === "all"
                      ? "all"
                      : options.subLangs === "en"
                        ? "en"
                        : options.subLangs === "es"
                          ? "es"
                          : "auto-en"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "auto-en") {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: true,
                      subLangs: "en.*,en",
                    });
                  } else if (v === "all") {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: true,
                      subLangs: "all",
                    });
                  } else {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: false,
                      subLangs: v,
                    });
                  }
                }}
                className={selectClass}
              >
                <option value="auto-en">English + auto EN</option>
                <option value="en">English only</option>
                <option value="es">Spanish</option>
                <option value="all">All available</option>
              </select>
            </Field>
            <p className="self-end text-xs text-[var(--muted)] sm:pb-2">
              Downloads subtitle files only (no video/audio).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Subtitles">
              <select
                value={
                  options.writeAutoSubs
                    ? "auto"
                    : options.subLangs
                      ? options.subLangs
                      : "none"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "none") {
                    onPatch({
                      writeSubs: false,
                      writeAutoSubs: false,
                      subLangs: undefined,
                    });
                  } else if (v === "auto") {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: true,
                      subLangs: "en",
                    });
                  } else if (v === "all") {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: false,
                      subLangs: "all",
                    });
                  } else {
                    onPatch({
                      writeSubs: true,
                      writeAutoSubs: false,
                      subLangs: v,
                    });
                  }
                }}
                className={selectClass}
              >
                <option value="none">None</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="all">All available</option>
                <option value="auto">Auto-generated EN</option>
              </select>
            </Field>
            <div>
              <p className="mb-1 text-xs font-medium text-[var(--foreground)]">
                Post-processing
              </p>
              <div className="space-y-1.5 pt-1">
                <Check
                  checked={!!options.embedThumbnail}
                  label="Embed thumbnail"
                  onChange={(v) => onPatch({ embedThumbnail: v })}
                />
                <Check
                  checked={!!options.embedMetadata}
                  label="Embed metadata"
                  onChange={(v) => onPatch({ embedMetadata: v })}
                />
              </div>
            </div>
          </div>
        )}

        {!isSubs ? (
          <div className="flex flex-wrap gap-4 border-t border-[var(--border)] pt-3">
            <Check
              checked={!!options.sponsorblockRemove}
              label="Remove sponsors (SponsorBlock)"
              accent
              onChange={(v) =>
                onPatch({ sponsorblockRemove: v ? "sponsor" : undefined })
              }
            />
            <Check
              checked={!!options.embedSubs}
              label="Embed subtitles"
              onChange={(v) => onPatch({ embedSubs: v })}
            />
          </div>
        ) : null}

        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <Field label="Save as filename">
            <select
              value={options.filenameMode ?? "auto"}
              onChange={(e) => {
                const mode = e.target.value as FilenameMode;
                if (mode === "auto") {
                  onPatch({
                    filenameMode: "auto",
                    output: AUTO_OUTPUT_TEMPLATE,
                    trimFilenames: 60,
                  });
                } else if (mode === "short") {
                  onPatch({
                    filenameMode: "short",
                    output: SHORT_OUTPUT_TEMPLATE,
                    trimFilenames: 60,
                  });
                } else {
                  onPatch({
                    filenameMode: "custom",
                    customFilename:
                      options.customFilename ||
                      options.urls[0]?.split("v=").pop()?.slice(0, 20) ||
                      "download",
                  });
                }
              }}
              className={selectClass}
            >
              <option value="auto">
                Auto (short title + id) — avoids “file name too long”
              </option>
              <option value="short">Very short (video id only)</option>
              <option value="custom">Custom name…</option>
            </select>
          </Field>
          {(options.filenameMode ?? "auto") === "custom" ? (
            <input
              type="text"
              value={options.customFilename ?? ""}
              onChange={(e) => onPatch({ customFilename: e.target.value })}
              placeholder="my-movie-name"
              className={selectClass + " font-mono"}
            />
          ) : null}
          <p className="text-[10px] text-[var(--muted)]">
            {(options.filenameMode ?? "auto") === "short"
              ? `Writes as ${SHORT_OUTPUT_TEMPLATE}`
              : (options.filenameMode ?? "auto") === "custom"
                ? "Extension is added automatically. Keep it short (CJK titles are multi-byte)."
                : `Uses ${AUTO_OUTPUT_TEMPLATE} + --trim-filenames 60`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={starting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--success)] px-4 py-3 text-sm font-semibold text-[var(--success-fg)] transition hover:opacity-90 disabled:opacity-60"
      >
        <CloudDownload className="h-5 w-5 shrink-0" />
        <span className="truncate">
          {starting
            ? "Queuing…"
            : isSubs
              ? "Download subtitles"
              : "Start download task"}
        </span>
      </button>
    </div>
  );
}

const selectClass =
  "w-full max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]";

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-1 py-2 transition sm:gap-2 ${
        active
          ? "bg-[var(--accent)] text-[var(--accent-fg)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Check({
  checked,
  label,
  onChange,
  accent,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
  accent?: boolean;
}) {
  return (
    <label
      className={`flex min-w-0 cursor-pointer items-center gap-2 text-xs ${
        accent ? "font-medium text-amber-300" : "text-[var(--foreground)]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="shrink-0 rounded border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]"
      />
      <span className="min-w-0 break-words">{label}</span>
    </label>
  );
}
