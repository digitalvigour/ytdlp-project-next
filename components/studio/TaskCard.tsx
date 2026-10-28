"use client";

import { FolderOpen, RotateCcw, Square, Terminal, Trash2 } from "lucide-react";
import type { DownloadTask } from "@/lib/ytdlp/types";

type Props = {
  task: DownloadTask;
  onCancel: () => void;
  onRetry: () => void;
  onOpenLocation: () => void;
  onOpenLogs: () => void;
  onDelete: () => void;
};

export function TaskCard({
  task,
  onCancel,
  onRetry,
  onOpenLocation,
  onOpenLogs,
  onDelete,
}: Props) {
  const completed = task.status === "completed";
  const failed = task.status === "error";
  const active = task.status === "downloading" || task.status === "queued";

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 w-full items-center gap-3 lg:max-w-[42%] lg:flex-1">
        {task.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={task.thumbnail}
            alt=""
            className="h-10 w-16 shrink-0 rounded-md border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="h-10 w-16 shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)]" />
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <h4
            className="truncate text-sm font-semibold text-[var(--foreground)]"
            title={task.title}
          >
            {task.title}
          </h4>
          <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="min-w-0 truncate font-medium text-[var(--accent)]">
              {task.uploader}
            </span>
            <span className="shrink-0">·</span>
            <span className="shrink-0 rounded bg-[var(--surface)] px-1.5 font-mono">
              {task.formatLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 w-full space-y-1.5 lg:w-56 lg:shrink-0">
        <div className="flex justify-between gap-2 font-mono text-[11px]">
          <span
            className={`shrink-0 ${
              completed
                ? "font-medium text-[var(--success)]"
                : failed
                  ? "font-medium text-red-400"
                  : "text-[var(--foreground)]"
            }`}
          >
            {completed
              ? "Completed"
              : failed
                ? "Cancelled / error"
                : `${task.progress}%`}
          </span>
          <span className="min-w-0 truncate text-right text-[var(--muted)]">
            {completed ? task.size : `${task.speed} · ETA ${task.eta}`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]">
          <div
            className={`h-full rounded-full transition-all ${
              completed
                ? "bg-[var(--success)]"
                : failed
                  ? "bg-red-500"
                  : "bg-[var(--accent)]"
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 self-end lg:self-auto">
        {active ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-amber-400"
            title="Cancel download"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {failed ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            title="Retry download"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onOpenLocation}
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-sky-400"
          title={
            task.outputPath
              ? "Open file location"
              : "Open downloads folder"
          }
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onOpenLogs}
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--success)]"
          title="View log"
        >
          <Terminal className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-red-400"
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
