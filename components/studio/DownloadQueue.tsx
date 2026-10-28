"use client";

import { FolderOpen, Square } from "lucide-react";
import type { DownloadTask } from "@/lib/ytdlp/types";
import { TaskCard } from "./TaskCard";

type Props = {
  tasks: DownloadTask[];
  onClearCompleted: () => void;
  onCancelAll: () => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenLocation: (id?: string) => void;
  onOpenLogs: (id: string) => void;
  onDelete: (id: string) => void;
};

export function DownloadQueue({
  tasks,
  onClearCompleted,
  onCancelAll,
  onCancel,
  onRetry,
  onOpenLocation,
  onOpenLogs,
  onDelete,
}: Props) {
  const active = tasks.filter(
    (t) => t.status === "downloading" || t.status === "queued",
  ).length;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-4 flex min-w-0 flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)] ${active ? "animate-pulse" : ""}`}
          />
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Download queue
          </h2>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
            {active} active
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenLocation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <FolderOpen className="h-3 w-3 text-sky-400" />
            Open folder
          </button>
          <button
            type="button"
            onClick={onClearCompleted}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Clear completed
          </button>
          <button
            type="button"
            onClick={onCancelAll}
            disabled={active === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:opacity-40"
          >
            <Square className="h-3 w-3 text-amber-400" />
            Cancel all
          </button>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            No tasks yet. Analyze a URL and start a download.
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onCancel={() => onCancel(task.id)}
              onRetry={() => onRetry(task.id)}
              onOpenLocation={() => onOpenLocation(task.id)}
              onOpenLogs={() => onOpenLogs(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
