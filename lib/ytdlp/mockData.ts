import type { DownloadTask, MediaInfo } from "./types";
import { createDefaultOptions } from "./buildArgs";

export const SAMPLE_URLS = [
  {
    label: "Synthwave Cyberpunk Music (Video)",
    value: "https://www.youtube.com/watch?v=L_LUpnjgPso",
  },
  {
    label: "Tech Documentary Playlist",
    value:
      "https://www.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI",
  },
  {
    label: "SoundCloud Lo-Fi Track",
    value: "https://soundcloud.com/artist/lofi-beats",
  },
] as const;

const BASE_THUMB =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80";

export function mockMediaForUrl(url: string): MediaInfo {
  if (url.includes("playlist")) {
    return {
      id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI",
      title: "Top 50 Tech & Coding Soundtracks [Playlist]",
      uploader: "Tech Beats Official",
      duration: "50 Videos",
      views: "4.5M Total Plays",
      thumbnail: BASE_THUMB,
      uploadDate: "Mar 2026",
      provider: "YouTube Playlist",
      streamCount: 50,
      isPlaylist: true,
      formats: [],
    };
  }

  if (url.includes("soundcloud")) {
    return {
      id: "sc-lofi",
      title: "Chill Lofi Synth Track (SoundCloud Release)",
      uploader: "SoundCloud Creator",
      duration: "03:42",
      views: "89,400 plays",
      thumbnail: BASE_THUMB,
      uploadDate: "Jan 2026",
      provider: "SoundCloud",
      streamCount: 4,
      formats: [
        {
          formatId: "http",
          ext: "mp3",
          acodec: "mp3",
          note: "HTTP progressive",
        },
      ],
    };
  }

  return {
    id: "L_LUpnjgPso",
    title:
      "Synthesizer Dreams - Cyberpunk City Lo-Fi Beats & Visuals [4K 60FPS]",
    uploader: "CyberSound Records",
    duration: "12:45",
    views: "1,245,800 views",
    thumbnail: BASE_THUMB,
    uploadDate: "Mar 2026",
    provider: "YouTube",
    streamCount: 18,
    formats: [
      {
        formatId: "401",
        ext: "mp4",
        resolution: "3840x2160",
        fps: 60,
        vcodec: "av01",
        note: "4K",
      },
      {
        formatId: "137",
        ext: "mp4",
        resolution: "1920x1080",
        fps: 60,
        vcodec: "avc1",
        note: "1080p",
      },
      {
        formatId: "140",
        ext: "m4a",
        acodec: "mp4a",
        note: "audio only",
      },
    ],
  };
}

export function createSeedTasks(): DownloadTask[] {
  const opts = createDefaultOptions(
    "https://www.youtube.com/watch?v=L_LUpnjgPso",
  );
  return [
    {
      id: "seed-1",
      title: "Ambient Rain & City Lights [Live Mix]",
      uploader: "Nightwave Radio",
      thumbnail: BASE_THUMB,
      progress: 62,
      speed: "8.4 MB/s",
      eta: "00:18",
      size: "180.2 MB",
      status: "downloading",
      formatLabel: "1080p (MP4)",
      logs: [
        "[yt-dlp] Starting download task...",
        "[info] Fetching video streams",
        "[download] 62% of 180.2 MB at 8.4 MB/s",
      ],
      options: opts,
      createdAt: Date.now() - 60_000,
    },
    {
      id: "seed-2",
      title: "Deep Focus Beats Vol. 3",
      uploader: "Study Sessions",
      thumbnail: BASE_THUMB,
      progress: 100,
      speed: "0 B/s",
      eta: "Finished",
      size: "42.1 MB",
      status: "completed",
      formatLabel: "MP3 Audio",
      logs: [
        "[yt-dlp] Starting download task...",
        "[download] 100% finished downloading & merging format files.",
      ],
      options: { ...opts, downloadMode: "audio", extractAudio: true },
      createdAt: Date.now() - 120_000,
    },
  ];
}
