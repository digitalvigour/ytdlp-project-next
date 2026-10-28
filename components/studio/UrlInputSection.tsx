"use client";

import { ClipboardPaste, Link2, Loader2, Sparkles, X } from "lucide-react";
import { SAMPLE_URLS } from "@/lib/ytdlp/mockData";

type Props = {
  url: string;
  analyzing: boolean;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  onPreset: (preset: "best" | "audio" | "fast") => void;
};

export function UrlInputSection({
  url,
  analyzing,
  onUrlChange,
  onAnalyze,
  onPreset,
}: Props) {
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onUrlChange(text);
    } catch {
      // clipboard blocked
    }
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <label className="mb-3 flex items-center justify-between gap-2 text-sm font-medium text-[var(--foreground)]">
        <span className="inline-flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--accent)]" />
          Media URL / playlist
        </span>
        <span className="hidden text-xs font-normal text-[var(--muted)] sm:inline">
          YouTube, Twitch, TikTok, and 1000+ sites
        </span>
      </label>

      <div className="relative flex items-center">
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAnalyze();
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-3 pl-3 pr-28 font-mono text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => void paste()}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>
          {url ? (
            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="rounded-md p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Clear URL"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">Presets</span>
          <button
            type="button"
            onClick={() => onPreset("best")}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Best quality
          </button>
          <button
            type="button"
            onClick={() => onPreset("audio")}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Audio MP3
          </button>
          <button
            type="button"
            onClick={() => onPreset("fast")}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Fast 720p
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-xs text-[var(--foreground)] outline-none"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onUrlChange(e.target.value);
            }}
          >
            <option value="">Sample URL…</option>
            {SAMPLE_URLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:opacity-90 disabled:opacity-60"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyze
          </button>
        </div>
      </div>
    </section>
  );
}
