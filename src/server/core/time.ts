/** Seconds-after-midnight -> zero-padded 24h "HH:MM". Out-of-range input is
 *  returned as a raw string — a bad data row must never kill a tool result. */
export function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s < 0 || s > 86399) return String(s);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  return `${hh}:${mm}`;
}
