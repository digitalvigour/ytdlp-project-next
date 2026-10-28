# yt-dlp Web Studio — Installation & Environment Setup

**Audience:** humans and AI coding agents setting up this project on a new machine.

This app is a **local-only** Next.js GUI that spawns the system `yt-dlp` CLI. It does **not** embed Python yt-dlp. Success depends on the host having the right binaries and PATH.

---

## 1. Quick verification checklist (run first)

Execute these on the target machine and adapt installs based on results:

```bash
uname -srm
node -v          # need >= 20 (project uses Next 16)
pnpm -v          # or enable via: corepack enable && corepack prepare pnpm@latest --activate
which yt-dlp && yt-dlp --version
which ffmpeg && ffmpeg -version | head -1
which ffprobe
which deno && deno --version
echo "PATH=$PATH"
ls -la "$(which yt-dlp 2>/dev/null)" 2>/dev/null
```

| Check | Required? | Healthy signal |
|-------|-----------|----------------|
| Node.js | Yes | `v20+` (prefer current LTS) |
| pnpm | Yes | Any recent pnpm (`packageManager` in `package.json`) |
| yt-dlp | Yes | Prefer **nightly** or build newer than ~90 days |
| ffmpeg + ffprobe | Yes | Needed for merge / audio extract / embeds |
| Deno | Strongly recommended | YouTube JS challenges; without it expect 403s |
| Linux desktop `xdg-open` | Optional | Used by “Open folder / location” |

---

## 2. Clone / copy project

```bash
cd /path/to/workspace
# if git clone:
git clone <repo-url> ytdlp-project
cd ytdlp-project

# Official yt-dlp sources as submodule (reference only — not executed by Next)
git submodule update --init --recursive
```

If the submodule is missing, the app still runs; only `vendor/yt-dlp` reference docs are incomplete.

```bash
pnpm install
```

---

## 3. Install / upgrade system dependencies

### 3.1 Node + pnpm

```bash
# Example: nvm
nvm install --lts
nvm use --lts

corepack enable
corepack prepare pnpm@latest --activate
```

### 3.2 yt-dlp (critical)

Prefer a dedicated user venv or pipx so upgrades are easy:

```bash
# Option A — pipx (isolated)
pipx install "yt-dlp[default]"
pipx upgrade yt-dlp
# For YouTube breakage, install nightly:
pipx install --pip-args='--pre' "yt-dlp[default]"
# or: pipx upgrade --pip-args='--pre' yt-dlp

# Option B — user venv (this machine used ~/.local/yt-env)
python3 -m venv ~/.local/yt-env
~/.local/yt-env/bin/pip install -U --pre "yt-dlp[default]"
# Ensure `yt-dlp` resolves to that binary, e.g. symlink:
# sudo ln -sf ~/.local/yt-env/bin/yt-dlp /usr/local/bin/yt-dlp

yt-dlp --version
```

**Agent rule:** if `yt-dlp --version` is older than ~90 days or YouTube returns HTTP 403, upgrade to **nightly** before debugging app code.

Override binary path without changing PATH:

```bash
export YTDLP_BIN=/full/path/to/yt-dlp
```

### 3.3 ffmpeg

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y ffmpeg

# Fedora
sudo dnf install -y ffmpeg

# Arch
sudo pacman -S ffmpeg

# macOS
brew install ffmpeg

which ffmpeg ffprobe
```

Optional override:

```bash
export FFMPEG_LOCATION=/usr/bin/ffmpeg
```

### 3.4 Deno (YouTube)

```bash
curl -fsSL https://deno.land/install.sh | sh
# Ensure ~/.deno/bin is on PATH for the shell that runs `pnpm dev`
export PATH="$HOME/.deno/bin:$PATH"
# Persist (bash):
grep -q '.deno/bin' ~/.bashrc || echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc

deno --version
```

Verify yt-dlp sees Deno:

```bash
yt-dlp -v --simulate "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1 | head -40
# Expect a line like: [debug] JS runtimes: deno-...
```

Optional override:

```bash
export DENO_PATH=$HOME/.deno/bin/deno
```

The Studio also injects `~/.deno/bin` into the child process PATH when spawning yt-dlp.

---

## 4. Environment variables (optional)

| Variable | Purpose | Default |
|----------|---------|---------|
| `YTDLP_BIN` | yt-dlp executable | `yt-dlp` on PATH |
| `FFMPEG_LOCATION` | ffmpeg binary or dir | auto `/usr/bin/ffmpeg` if present |
| `DENO_PATH` | Deno binary | auto `~/.deno/bin/deno` etc. |
| `YTDLP_DOWNLOAD_DIR` | Output directory | `<project>/downloads` |

Create a local `.env.local` if desired (Next loads it; do not commit secrets):

```bash
# .env.local (example)
YTDLP_BIN=/home/USER/.local/yt-env/bin/yt-dlp
FFMPEG_LOCATION=/usr/bin/ffmpeg
DENO_PATH=/home/USER/.deno/bin/deno
YTDLP_DOWNLOAD_DIR=/home/USER/Videos/ytdlp-studio
```

---

## 5. Run the app

```bash
cd /path/to/ytdlp-project
pnpm install
pnpm dev
```

Open **http://localhost:3000** (API routes reject non-localhost hosts).

Production-style:

```bash
pnpm build
pnpm start
```

---

## 6. Smoke tests (agent should run after setup)

### 6.1 Health

```bash
curl -s http://127.0.0.1:3000/api/ytdlp/health | jq .
# Expect: ok=true, version=..., denoAvailable=true
```

### 6.2 Analyze

```bash
curl -s -X POST http://127.0.0.1:3000/api/ytdlp/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"}' | jq '.title,.id'
```

### 6.3 CLI download (outside UI)

```bash
export PATH="$HOME/.deno/bin:$PATH"
yt-dlp --no-update --js-runtimes deno \
  -f "bestvideo[height<=360]+bestaudio/best" --merge-output-format mp4 \
  -o "%(title).40B [%(id)s].%(ext)s" --trim-filenames 60 \
  -P ./downloads \
  "https://www.youtube.com/watch?v=jNQXAC9IVRw"
```

---

## 7. Platform notes

### Linux

- Cookie-from-browser for Chromium may need keyring access (`secretstorage` / desktop session).
- “Open location” uses `xdg-open`.
- Filename limit is **255 bytes** (not characters). The Studio forces short templates + `--trim-filenames 60`.

### macOS

- Install ffmpeg/yt-dlp via Homebrew if preferred.
- `xdg-open` may be missing; open-location may need adapting to `open`.
- Deno install path is still typically `~/.deno/bin`.

### Windows

- Use PowerShell / winget / scoop for yt-dlp, ffmpeg, Deno.
- Open-location currently assumes `xdg-open` — agents should replace with `explorer` / `start` if porting.
- Prefer running under WSL2 for closest parity with this repo’s Linux assumptions.

---

## 8. Common failures → agent fixes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Health `ok: false` | yt-dlp not on PATH of Next process | Install yt-dlp; set `YTDLP_BIN`; restart `pnpm dev` |
| Header “Deno missing” | Deno not installed / not discoverable | Install Deno; set `DENO_PATH`; restart dev server |
| `HTTP Error 403` on YouTube | Old yt-dlp and/or no JS runtime | Upgrade yt-dlp to nightly; install Deno; verify `JS runtimes: deno` in `-v` |
| `File name too long` / Errno 36 | Long CJK titles | UI: Filename mode **Auto** or **Short**; do not use bare `%(title)s` templates |
| Analyze/download 403 from API | Not localhost | Use `127.0.0.1` / `localhost` only |
| Merge / audio extract fails | Missing ffmpeg | Install ffmpeg; set `FFMPEG_LOCATION` |
| Cookies-from-browser fails | Locked DB / keyring / wrong browser | Export Netscape `cookies.txt`; use Cookie mode **file** |
| Terminal flooded with `GET /api/ytdlp/status` | Should only poll while downloads active | Soft-refresh UI; if stuck, hard-reload; idle = no poll |

---

## 9. Project map (for agents)

```
app/
  page.tsx, layout.tsx, globals.css
  api/ytdlp/
    analyze/     POST  → yt-dlp -J
    download/    POST  → spawn download
    status/      GET/POST → in-memory queue
    health/      GET  → version + deno
    cookies/     POST → save cookies.txt under downloads/.cookies
    open-location/ POST → xdg-open downloads (or file)
components/studio/   UI sections
hooks/useDownloadStudio.ts
lib/ytdlp/
  buildArgs.ts   options → CLI argv
  filename.ts    safe output templates
  runner.ts      spawn + progress parse
  taskStore.ts   in-memory tasks
  paths.ts       downloads / deno / ffmpeg resolution
vendor/yt-dlp/       git submodule (reference)
docs/
  INSTALLATION.md    this file
  ytdlp-reference.md CLI / upstream pointers
downloads/           runtime output (gitignored)
```

---

## 10. Agent setup procedure (ordered)

1. Run **§1 verification** commands; record missing tools.
2. Install Node/pnpm if needed; `pnpm install` in project root.
3. Install/upgrade **yt-dlp** (nightly if YouTube-related) and ensure `which yt-dlp` works in the same environment that will run `pnpm dev`.
4. Install **ffmpeg** (+ ffprobe).
5. Install **Deno**; put `~/.deno/bin` on PATH; confirm with `yt-dlp -v --simulate <url>`.
6. `git submodule update --init --recursive` (optional but preferred).
7. `pnpm dev`; hit `/api/ytdlp/health`; confirm `ok` + `denoAvailable`.
8. Do not expose the server beyond localhost; treat cookie files as secrets.
9. If adapting to macOS/Windows, fix open-location launcher and PATH discovery in `lib/ytdlp/paths.ts` first.

---

## 11. Related docs

- [`ytdlp-reference.md`](./ytdlp-reference.md) — flag mapping and YouTube notes  
- [`../README.md`](../README.md) — short human overview  
- Upstream: https://github.com/yt-dlp/yt-dlp  
- EJS / Deno: https://github.com/yt-dlp/yt-dlp/wiki/EJS  
- PO Tokens: https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide  
