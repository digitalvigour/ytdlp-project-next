"use client";

import { useDownloadStudio } from "@/hooks/useDownloadStudio";
import { AdvancedOptions } from "./AdvancedOptions";
import { BackendGuideModal } from "./BackendGuideModal";
import { DownloadQueue } from "./DownloadQueue";
import { LogModal } from "./LogModal";
import { MediaPreviewSection } from "./MediaPreviewSection";
import { StudioHeader } from "./StudioHeader";
import { UrlInputSection } from "./UrlInputSection";

export function StudioShell() {
  const studio = useDownloadStudio();

  return (
    <div className="flex min-h-full min-w-0 flex-col overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <StudioHeader
        cliVersion={studio.cliVersion}
        denoAvailable={studio.denoAvailable}
        onOpenBackend={() => studio.setBackendOpen(true)}
      />

      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-grow flex-col gap-6 overflow-x-hidden px-4 py-6 sm:px-6">
        {studio.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {studio.error}
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => studio.setError(null)}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <UrlInputSection
          url={studio.url}
          analyzing={studio.analyzing}
          onUrlChange={studio.setUrl}
          onAnalyze={() => void studio.analyze()}
          onPreset={studio.applyPreset}
        />

        <MediaPreviewSection
          media={studio.media}
          options={studio.options}
          starting={studio.starting}
          onPatch={studio.patchOptions}
          onDownload={() => void studio.download()}
        />

        <AdvancedOptions
          open={studio.advancedOpen}
          onToggle={() => studio.setAdvancedOpen((v) => !v)}
          options={studio.options}
          commandPreview={studio.commandPreview}
          onPatch={studio.patchOptions}
          onUploadCookies={(file) => studio.uploadCookieFile(file)}
        />

        <DownloadQueue
          tasks={studio.tasks}
          onClearCompleted={() => void studio.clearCompleted()}
          onCancelAll={() => void studio.cancelAll()}
          onCancel={(id) => void studio.cancelTask(id)}
          onRetry={(id) => void studio.retryTask(id)}
          onOpenLocation={(id) => void studio.openTaskLocation(id)}
          onOpenLogs={(id) => studio.setLogTaskId(id)}
          onDelete={(id) => void studio.deleteTask(id)}
        />
      </main>

      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <span>yt-dlp Web Studio · files save to ./downloads · localhost only</span>
          <a
            href="https://github.com/yt-dlp/yt-dlp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)]"
          >
            yt-dlp on GitHub
          </a>
        </div>
      </footer>

      <LogModal
        task={studio.logTask}
        onClose={() => studio.setLogTaskId(null)}
      />
      <BackendGuideModal
        open={studio.backendOpen}
        onClose={() => studio.setBackendOpen(false)}
      />
    </div>
  );
}
