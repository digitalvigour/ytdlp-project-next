"use client";

import { Copy, Terminal, X } from "lucide-react";
import type { DownloadTask } from "@/lib/ytdlp/types";

type Props = {
  task: DownloadTask | null;
  onClose: () => void;
};

export function LogModal({ task, onClose }: Props) {
  if (!task) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(task.logs.join("\n"));
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[500px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex min-w-0 items-center gap-2">
            <Terminal className="h-4 w-4 shrink-0 text-[var(--success)]" />
            <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
              yt-dlp log: {task.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto bg-black p-4 font-mono text-xs text-[var(--muted)]">
          {task.logs.map((line, i) => (
            <div key={`${i}-${line.slice(0, 12)}`}>{line}</div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs">
          <span className="text-[var(--muted)]">
            Status: {task.status} · mock stream
          </span>
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          >
            <Copy className="h-3 w-3" />
            Copy log
          </button>
        </div>
      </div>
    </div>
  );
}
