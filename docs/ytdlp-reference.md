# yt-dlp reference (vendored)

The official engine lives at [`vendor/yt-dlp`](../vendor/yt-dlp) as a git submodule. It is **reference only** — the Next.js app does not import Python from it. Future backends should spawn the installed `yt-dlp` CLI binary.

## Init after clone

```bash
git submodule update --init --recursive
```

## Key upstream paths

| Path | Why it matters |
|------|----------------|
| `yt_dlp/options.py` | Canonical CLI flags → option dest names |
| `yt_dlp/YoutubeDL.py` | Full API params + progress/postprocessor hooks |
| `yt_dlp/cookies.py` | `SUPPORTED_BROWSERS`, Netscape cookie jar format |
| `yt_dlp/postprocessor/` | Audio extract, embed thumb/meta/subs, SponsorBlock |
| `devscripts/cli_to_api.py` | CLI ↔ `YoutubeDL` dict mapping |
| `README.md` | Format selection, output templates, embedding notes |

## Planned CLI contract (this app)

| Feature | Flags |
|---------|--------|
| Analyze | `-J` / `--dump-single-json` |
| Format | `-f`, `--merge-output-format` |
| Audio | `-x`, `--audio-format`, `--audio-quality` |
| Subs | `--write-subs`, `--write-auto-subs`, `--sub-langs`, `--embed-subs` |
| Embed | `--embed-thumbnail`, `--embed-metadata` |
| SponsorBlock | `--sponsorblock-remove` |
| Output | `-o`, `-P` |
| Rate limit | `-r` / `--limit-rate` |
| Browser cookies | `--cookies-from-browser BROWSER[+KEYRING][:PROFILE][::CONTAINER]` |
| Cookie file | `--cookies FILE` (Netscape format) |
| Progress | `--newline`, `--progress-template` |
| JS runtime | `--js-runtimes deno[:PATH]` (required for modern YouTube) |
| Extractor args | `--extractor-args` (optional YouTube client overrides) |

App-side mapping lives in `lib/ytdlp/buildArgs.ts`.

## YouTube notes (2026)

- Keep yt-dlp on **nightly** when YouTube breaks stable builds.
- Install **Deno**; without a JS runtime, extraction is degraded and 403s are common.
- Android player clients generally **do not** accept account cookies; cookies are for web/tv-family clients.
- See [EJS wiki](https://github.com/yt-dlp/yt-dlp/wiki/EJS) and [PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide).
