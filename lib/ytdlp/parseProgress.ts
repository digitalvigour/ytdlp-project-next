export type ProgressUpdate = {
  progress?: number;
  speed?: string;
  eta?: string;
  size?: string;
};

/**
 * Parse yt-dlp --newline progress / info lines into UI fields.
 * Examples:
 *   [download]  12.3% of  100.00MiB at  5.00MiB/s ETA 00:17
 *   [download] 100% of 100.00MiB in 00:20 at 5.00MiB/s
 */
export function parseProgressLine(line: string): ProgressUpdate | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const percentMatch = trimmed.match(
    /\[download\]\s+(\d+(?:\.\d+)?)%/i,
  );
  const ofMatch = trimmed.match(
    /of\s+(~?\s*[\d.]+[KMG]?i?B)/i,
  );
  const speedMatch = trimmed.match(
    /at\s+([\d.]+[KMG]?i?B\/s)/i,
  );
  const etaMatch = trimmed.match(/ETA\s+(\d{1,2}:\d{2}(?::\d{2})?)/i);

  if (!percentMatch && !speedMatch && !etaMatch && !ofMatch) {
    return null;
  }

  const update: ProgressUpdate = {};
  if (percentMatch) {
    update.progress = Math.min(100, Math.round(parseFloat(percentMatch[1])));
  }
  if (ofMatch) update.size = ofMatch[1].replace(/\s+/g, "");
  if (speedMatch) update.speed = speedMatch[1];
  if (etaMatch) update.eta = etaMatch[1];
  return update;
}
