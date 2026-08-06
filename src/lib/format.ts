// Formatting helpers: session-list grouping, currency, distances.

export type SessionGroup = "Today" | "Yesterday" | "This week" | "This month" | "Older";

export const SESSION_GROUP_ORDER: SessionGroup[] = ["Today", "Yesterday", "This week", "This month", "Older"];

function startOfDay(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Bucket an ISO timestamp relative to `now` for the sidebar's section headers. */
export function sessionGroup(updatedAt: string, now: Date = new Date()): SessionGroup {
  const updated = new Date(updatedAt);
  if (Number.isNaN(updated.getTime())) return "Older";
  const dayMs = 86_400_000;
  const today = startOfDay(now);
  const day = startOfDay(updated);
  if (day >= today) return "Today";
  if (day >= today - dayMs) return "Yesterday";
  if (day >= today - 6 * dayMs) return "This week";
  if (updated.getFullYear() === now.getFullYear() && updated.getMonth() === now.getMonth()) return "This month";
  return "Older";
}

export function formatCad(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatMeters(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  return `${rounded} min`;
}

/** Compact one-line summary of a tool call's input for the badge, e.g. `query="algorithms", limit=3`. */
export function summarizeToolInput(input: Record<string, unknown>, maxLength = 48): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    parts.push(typeof value === "string" ? `${key}="${value}"` : `${key}=${JSON.stringify(value)}`);
  }
  const joined = parts.join(", ");
  return joined.length > maxLength ? `${joined.slice(0, maxLength - 1)}…` : joined;
}
