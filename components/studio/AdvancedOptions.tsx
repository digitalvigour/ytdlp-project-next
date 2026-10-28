"use client";

import { ChevronDown, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { SUPPORTED_BROWSERS } from "@/lib/ytdlp/browsers";
import type { CookieMode } from "@/lib/ytdlp/browsers";
import {
  AUTO_OUTPUT_TEMPLATE,
  SHORT_OUTPUT_TEMPLATE,
} from "@/lib/ytdlp/filename";
import type { DownloadOptions, FilenameMode } from "@/lib/ytdlp/types";

type Props = {
  open: boolean;
  onToggle: () => void;
  options: DownloadOptions;
  commandPreview: string;
  onPatch: (patch: Partial<DownloadOptions>) => void;
  onUploadCookies: (file: File) => Promise<void>;
};

export function AdvancedOptions({
  open,
  onToggle,
  options,
  commandPreview,
  onPatch,
  onUploadCookies,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commandPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const setCookieMode = (mode: CookieMode) => {
    onPatch({ cookieMode: mode });
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-[var(--surface-2)] px-4 py-4 text-left transition hover:bg-[var(--surface-2)]/80 sm:px-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] sm:text-base">
              Advanced options & command preview
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Output template, cookies, rate limit — drives live yt-dlp spawn
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-[var(--border)] p-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--foreground)]">
                Executable command preview
              </span>
              <button
                type="button"
                onClick={() => void copy()}
                className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 font-medium text-[var(--accent)]"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="max-w-full overflow-x-auto break-all whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/80 p-4 font-mono text-xs text-[var(--success)] sm:text-sm">
              <span className="text-[var(--muted)]">$ </span>
              {commandPreview}
            </pre>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
            <div>
              <label className="mb-1 block font-medium text-[var(--foreground)]">
                Filename mode
              </label>
              <select
                value={options.filenameMode ?? "auto"}
                onChange={(e) => {
                  const mode = e.target.value as FilenameMode;
                  if (mode === "auto") {
                    onPatch({
                      filenameMode: "auto",
                      output: AUTO_OUTPUT_TEMPLATE,
                    });
                  } else if (mode === "short") {
                    onPatch({
                      filenameMode: "short",
                      output: SHORT_OUTPUT_TEMPLATE,
                    });
                  } else {
                    onPatch({ filenameMode: "custom" });
                  }
                }}
                className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                <option value="auto">Auto (truncated title + id)</option>
                <option value="short">Very short (id only)</option>
                <option value="custom">Custom basename</option>
              </select>
              {(options.filenameMode ?? "auto") === "custom" ? (
                <input
                  type="text"
                  value={options.customFilename ?? ""}
                  onChange={(e) => onPatch({ customFilename: e.target.value })}
                  placeholder="my-file-name"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value={
                    (options.filenameMode ?? "auto") === "short"
                      ? SHORT_OUTPUT_TEMPLATE
                      : AUTO_OUTPUT_TEMPLATE
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--muted)] outline-none"
                />
              )}
              <span className="mt-1 block text-[10px] text-[var(--muted)]">
                Auto ignores old long templates. Trim capped at 60 chars for CJK.
              </span>
            </div>

            <div>
              <label className="mb-1 block font-medium text-[var(--foreground)]">
                Cookies
              </label>
              <select
                value={options.cookieMode}
                onChange={(e) => setCookieMode(e.target.value as CookieMode)}
                className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                <option value="none">None (public media)</option>
                <option value="browser">From browser</option>
                <option value="file">Custom cookies file</option>
              </select>

              {options.cookieMode === "browser" ? (
                <div className="space-y-2">
                  <select
                    value={options.cookiesFromBrowser?.browser ?? "chrome"}
                    onChange={(e) =>
                      onPatch({
                        cookiesFromBrowser: {
                          ...options.cookiesFromBrowser,
                          browser: e.target
                            .value as (typeof SUPPORTED_BROWSERS)[number],
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--foreground)] outline-none"
                  >
                    {SUPPORTED_BROWSERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Profile (optional)"
                    value={options.cookiesFromBrowser?.profile ?? ""}
                    onChange={(e) =>
                      onPatch({
                        cookiesFromBrowser: {
                          browser:
                            options.cookiesFromBrowser?.browser ?? "chrome",
                          ...options.cookiesFromBrowser,
                          profile: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--foreground)] outline-none"
                  />
                  <span className="block text-[10px] text-[var(--muted)]">
                    Maps to --cookies-from-browser
                  </span>
                </div>
              ) : null}

              {options.cookieMode === "file" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="/path/to/cookies.txt"
                    value={options.cookieFile ?? ""}
                    onChange={(e) =>
                      onPatch({ cookieFile: e.target.value || undefined })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--foreground)] outline-none"
                  />
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      void onUploadCookies(file)
                        .catch(() => {
                          // parent shows errors via options; keep silent here
                        })
                        .finally(() => setUploading(false));
                    }}
                    className="w-full text-[var(--muted)] file:mr-2 file:rounded file:border file:border-[var(--border)] file:bg-[var(--surface-2)] file:px-2 file:py-1 file:text-xs file:text-[var(--foreground)]"
                  />
                  <span className="block text-[10px] text-[var(--muted)]">
                    {uploading
                      ? "Uploading…"
                      : "Upload Netscape cookies.txt → saved under downloads/.cookies"}
                  </span>
                </div>
              ) : null}

              {options.cookieMode === "none" ? (
                <span className="mt-1 block text-[10px] text-[var(--muted)]">
                  Age-gated / members-only need browser or file cookies
                </span>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[var(--foreground)]">
                Bandwidth limit (-r)
              </label>
              <select
                value={options.limitRate ?? "none"}
                onChange={(e) =>
                  onPatch({
                    limitRate:
                      e.target.value === "none" ? undefined : e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                <option value="none">Unlimited</option>
                <option value="5M">5 MB/s</option>
                <option value="10M">10 MB/s</option>
                <option value="50M">50 MB/s</option>
              </select>
              <span className="mt-1 block text-[10px] text-[var(--muted)]">
                Prevents network saturation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-4 text-xs md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-[var(--foreground)]">
                JS runtime (--js-runtimes)
              </label>
              <input
                type="text"
                value={options.jsRuntimes ?? ""}
                onChange={(e) =>
                  onPatch({ jsRuntimes: e.target.value || undefined })
                }
                placeholder="deno"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="mt-1 block text-[10px] text-[var(--muted)]">
                Required for modern YouTube extraction (Deno)
              </span>
            </div>
            <div>
              <label className="mb-1 block font-medium text-[var(--foreground)]">
                Extractor args (--extractor-args)
              </label>
              <input
                type="text"
                value={options.extractorArgs ?? ""}
                onChange={(e) =>
                  onPatch({ extractorArgs: e.target.value || undefined })
                }
                placeholder="youtube:player_client=default (optional)"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="mt-1 block text-[10px] text-[var(--muted)]">
                Leave empty for yt-dlp defaults; only set if you know you need it
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
