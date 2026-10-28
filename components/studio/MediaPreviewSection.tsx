"use client";

import type { DownloadOptions, MediaInfo } from "@/lib/ytdlp/types";
import { FormatOptions } from "./FormatOptions";

type Props = {
  media: MediaInfo | null;
  options: DownloadOptions;
  starting: boolean;
  onPatch: (patch: Partial<DownloadOptions>) => void;
  onDownload: () => void;
};

export function MediaPreviewSection({
  media,
  options,
  starting,
  onPatch,
  onDownload,
}: Props) {
  const info = media ?? {
    id: "—",
    title: "Analyze a URL to load media metadata",
    uploader: "—",
    duration: "--:--",
    views: "—",
    thumbnail: "",
    uploadDate: "—",
    provider: "Waiting",
    streamCount: 0,
    formats: [],
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-5 flex min-w-0 flex-col gap-2 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--success)]" />
          <h2 className="truncate text-sm font-semibold text-[var(--foreground)] sm:text-base">
            Media analysis & download config
          </h2>
        </div>
        <span className="w-fit max-w-full truncate rounded border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          {info.provider}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-5">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-[var(--border)] bg-black">
            {info.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={info.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                No thumbnail
              </div>
            )}
            <div className="absolute bottom-2 right-2 rounded border border-[var(--border)] bg-black/80 px-2 py-0.5 font-mono text-xs text-white">
              {info.duration}
            </div>
          </div>

          <div className="min-w-0">
            <h3
              className="break-words text-base font-semibold text-[var(--foreground)] [overflow-wrap:anywhere]"
              title={info.title}
            >
              {info.title}
            </h3>
            <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <span className="min-w-0 truncate font-medium text-[var(--accent)]">
                {info.uploader}
              </span>
              <span className="shrink-0 font-mono">
                {info.uploadDate ?? "—"}
              </span>
            </div>
          </div>

          <div className="min-w-0 space-y-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs">
            <Row label="Video ID" value={info.id} mono />
            <Row
              label="Available streams"
              value={`${info.streamCount} formats`}
            />
            <Row label="Views" value={info.views} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <FormatOptions
            options={options}
            starting={starting}
            onPatch={onPatch}
            onDownload={onDownload}
          />
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 justify-between gap-4 text-[var(--muted)]">
      <span className="shrink-0">{label}</span>
      <span
        className={`min-w-0 truncate text-right text-[var(--foreground)] ${mono ? "font-mono" : "font-medium"}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
