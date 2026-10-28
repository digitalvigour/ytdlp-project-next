# yt-dlp Web Studio

Local Next.js GUI for [yt-dlp](https://github.com/yt-dlp/yt-dlp). The UI spawns the system `yt-dlp` CLI on localhost and saves files under `./downloads`.

## Requirements

- Node.js + pnpm
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) on `PATH` (or set `YTDLP_BIN`) — prefer **nightly** for YouTube
- [`ffmpeg`](https://ffmpeg.org/) on `PATH` (or set `FFMPEG_LOCATION`)
- [Deno](https://deno.land/) on `PATH` (YouTube JS challenges) — install: `curl -fsSL https://deno.land/install.sh | sh`

The Studio injects `--js-runtimes` and puts `~/.deno/bin` on the child `PATH` automatically.

## Getting started

```bash
git submodule update --init --recursive
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Downloads

Files are written to `./downloads` (gitignored). Override with `YTDLP_DOWNLOAD_DIR`.

Uploaded Netscape cookie files are stored under `./downloads/.cookies/`.

## Full setup (humans & AI agents)

See **[`docs/INSTALLATION.md`](docs/INSTALLATION.md)** — environment checks, yt-dlp/ffmpeg/Deno install, env vars, smoke tests, and common failures.

## Project layout

- `components/studio/` — UI
- `lib/ytdlp/` — types, CLI arg builder, runner, task store, client
- `app/api/ytdlp/` — analyze / download / status / health / cookies (localhost only)
- `vendor/yt-dlp/` — official engine submodule (reference only)
- [`docs/ytdlp-reference.md`](docs/ytdlp-reference.md) — upstream flag notes
- [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — full install / agent setup guide

## Submodule

```bash
git submodule update --init --recursive
```

## Status polling

The UI polls `/api/ytdlp/status` **only while** a download is `queued`/`downloading` (every 2s). Idle = no poll. Hard-refresh after pulling if an old HMR session left timers running.
