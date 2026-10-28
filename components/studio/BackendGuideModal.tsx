"use client";

import { Server, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BackendGuideModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">
                Live yt-dlp backend
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Localhost API spawns the system CLI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-6 text-sm">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <strong className="mb-1 block text-[var(--foreground)]">
              How it works
            </strong>
            Routes under{" "}
            <code className="rounded bg-black/40 px-1 text-[var(--accent)]">
              /api/ytdlp/*
            </code>{" "}
            call{" "}
            <code className="rounded bg-black/40 px-1 text-[var(--accent)]">
              lib/ytdlp/runner.ts
            </code>{" "}
            which spawns{" "}
            <code className="rounded bg-black/40 px-1">yt-dlp</code> with args
            from{" "}
            <code className="rounded bg-black/40 px-1">buildArgs()</code>.
            Analyze uses <code className="rounded bg-black/40 px-1">-J</code>.
            Downloads use{" "}
            <code className="rounded bg-black/40 px-1">--newline</code> and write
            to <code className="rounded bg-black/40 px-1">./downloads</code>.
            APIs reject non-localhost hosts.
          </div>

          <div>
            <p className="mb-2 font-semibold text-[var(--foreground)]">
              Env overrides
            </p>
            <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-black/90 p-4 font-mono text-xs text-[var(--success)]">{`YTDLP_BIN=/usr/local/bin/yt-dlp
FFMPEG_LOCATION=/usr/bin/ffmpeg
YTDLP_DOWNLOAD_DIR=/path/to/downloads`}</pre>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-[var(--accent-fg)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
