"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyzeUrl,
  buildCommandPreview,
  createDefaultOptions,
  fetchHealth,
  fetchStatus,
  openLocation,
  patchStatus,
  startDownload,
  uploadCookies,
} from "@/lib/ytdlp";
import type {
  DownloadOptions,
  DownloadTask,
  MediaInfo,
} from "@/lib/ytdlp/types";

const STATUS_POLL_MS = 2000;

function hasActiveTasks(tasks: DownloadTask[]): boolean {
  return tasks.some(
    (t) => t.status === "queued" || t.status === "downloading",
  );
}

export function useDownloadStudio() {
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState<DownloadOptions>(() =>
    createDefaultOptions(),
  );
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [backendOpen, setBackendOpen] = useState(false);
  const [logTaskId, setLogTaskId] = useState<string | null>(null);
  const [cliVersion, setCliVersion] = useState<string | null>(null);
  const [denoAvailable, setDenoAvailable] = useState<boolean | null>(null);

  const queueActive = hasActiveTasks(tasks);

  const commandPreview = useMemo(() => {
    return buildCommandPreview({
      ...options,
      urls: url.trim() ? [url.trim()] : options.urls,
    });
  }, [options, url]);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetchStatus();
      setTasks(res.tasks);
      return res.tasks;
    } catch {
      return null;
    }
  }, []);

  // One-shot on mount: queue snapshot + health. No interval here.
  useEffect(() => {
    void refreshStatus();
    void fetchHealth()
      .then((h) => {
        setCliVersion(h.version);
        setDenoAvailable(h.denoAvailable);
      })
      .catch(() => {
        setCliVersion(null);
        setDenoAvailable(null);
      });
  }, [refreshStatus]);

  // Single interval while (and only while) downloads are active.
  // Cleanup always clears the timer — prevents HMR / Strict Mode leaks.
  useEffect(() => {
    if (!queueActive) return;

    let cancelled = false;
    const id = setInterval(() => {
      void fetchStatus()
        .then((res) => {
          if (!cancelled) setTasks(res.tasks);
        })
        .catch(() => {
          /* ignore transient poll errors */
        });
    }, STATUS_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [queueActive]);

  const patchOptions = useCallback((patch: Partial<DownloadOptions>) => {
    setOptions((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPreset = useCallback((preset: "best" | "audio" | "fast") => {
    if (preset === "best") {
      setOptions((prev) => ({
        ...prev,
        downloadMode: "video",
        extractAudio: false,
        maxHeight: 2160,
        mergeOutputFormat: "mp4",
        embedThumbnail: true,
        embedMetadata: true,
      }));
    } else if (preset === "audio") {
      setOptions((prev) => ({
        ...prev,
        downloadMode: "audio",
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: "0",
        embedThumbnail: true,
        embedMetadata: true,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        downloadMode: "video",
        extractAudio: false,
        maxHeight: 720,
        mergeOutputFormat: "mp4",
        embedThumbnail: false,
      }));
    }
  }, []);

  const analyze = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a video or playlist URL first.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const info = await analyzeUrl({
        url: trimmed,
        cookieMode: options.cookieMode,
        cookiesFromBrowser:
          options.cookieMode === "browser"
            ? options.cookiesFromBrowser
            : undefined,
        cookieFile:
          options.cookieMode === "file" ? options.cookieFile : undefined,
      });
      setMedia(info);
      setOptions((prev) => ({ ...prev, urls: [trimmed] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }, [url, options.cookieMode, options.cookiesFromBrowser, options.cookieFile]);

  const download = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a URL before starting a download.");
      return;
    }
    setError(null);
    setStarting(true);
    try {
      const payload: DownloadOptions = {
        ...options,
        urls: [trimmed],
        extractAudio: options.downloadMode === "audio",
        writeSubs:
          options.downloadMode === "subs" ? true : options.writeSubs,
        writeAutoSubs:
          options.downloadMode === "subs"
            ? options.writeAutoSubs !== false
            : options.writeAutoSubs,
        subLangs:
          options.downloadMode === "subs"
            ? options.subLangs || "en.*,en"
            : options.subLangs,
      };
      await startDownload({
        ...payload,
        seed: media
          ? {
              title: media.title,
              uploader: media.uploader,
              thumbnail: media.thumbnail,
            }
          : undefined,
      });
      await refreshStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setStarting(false);
    }
  }, [url, options, media, refreshStatus]);

  const uploadCookieFile = useCallback(async (file: File) => {
    try {
      const { path } = await uploadCookies(file);
      setOptions((prev) => ({
        ...prev,
        cookieMode: "file",
        cookieFile: path,
      }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cookie upload failed");
      throw e;
    }
  }, []);

  const logTask = logTaskId
    ? (tasks.find((t) => t.id === logTaskId) ?? null)
    : null;

  return {
    url,
    setUrl,
    options,
    patchOptions,
    setOptions,
    media,
    tasks,
    analyzing,
    starting,
    error,
    setError,
    advancedOpen,
    setAdvancedOpen,
    backendOpen,
    setBackendOpen,
    logTask,
    setLogTaskId,
    commandPreview,
    cliVersion,
    denoAvailable,
    applyPreset,
    analyze,
    download,
    uploadCookieFile,
    refreshStatus,
    cancelAll: () =>
      patchStatus("cancelAll").then((r) => setTasks(r.tasks)),
    clearCompleted: () =>
      patchStatus("clearCompleted").then((r) => setTasks(r.tasks)),
    cancelTask: (taskId: string) =>
      patchStatus("cancel", taskId).then((r) => setTasks(r.tasks)),
    deleteTask: (taskId: string) =>
      patchStatus("delete", taskId).then((r) => setTasks(r.tasks)),
    retryTask: async (taskId: string) => {
      try {
        setError(null);
        const r = await patchStatus("retry", taskId);
        setTasks(r.tasks);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Retry failed");
      }
    },
    openTaskLocation: async (taskId?: string) => {
      try {
        setError(null);
        await openLocation(taskId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not open location");
      }
    },
  };
}

export type DownloadStudioState = ReturnType<typeof useDownloadStudio>;
