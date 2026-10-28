"use client";

import { Code2, Download, Moon } from "lucide-react";

type Props = {
  onOpenBackend: () => void;
  cliVersion: string | null;
  denoAvailable: boolean | null;
};

export function StudioHeader({
  onOpenBackend,
  cliVersion,
  denoAvailable,
}: Props) {
  const connected = Boolean(cliVersion);
  const denoOk = denoAvailable === true;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-fg)]">
            <Download className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                yt-dlp Web Studio
              </h1>
              <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Local CLI
              </span>
            </div>
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              Downloads save to ./downloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 lg:flex">
            <span className="relative flex h-2 w-2">
              {connected && denoOk ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              )}
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {connected ? "CLI" : "CLI missing"}
            </span>
            <span className="text-[var(--muted)]">|</span>
            <span className="font-mono text-[var(--accent)]">
              {cliVersion ? `yt-dlp ${cliVersion}` : "yt-dlp ?"}
            </span>
            <span className="text-[var(--muted)]">|</span>
            <span
              className={
                denoOk ? "text-[var(--success)]" : "text-amber-400"
              }
            >
              {denoOk ? "Deno OK" : "Deno missing"}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenBackend}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-[var(--accent-fg)] transition hover:opacity-90"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Backend guide</span>
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            aria-label="Theme"
            title="Dark theme (default)"
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
