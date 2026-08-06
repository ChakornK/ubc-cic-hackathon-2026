// Walking-distance tool-call interpretation, shared by the chat renderer (which
// emits map highlight state) and the chat panel (which clears it when the
// latest response has no walking_distance call).

import { isToolError, type ToolCall, type WalkingDistanceResult } from "@/src/lib/api-types";

export interface WalkingHighlight {
  /** Building identifiers as the tool reported them (code preferred). */
  from: string;
  to: string;
  meters: number;
  minutes: number;
}

/**
 * A map-renderable highlight from a walking_distance call, or null when the
 * call failed (`status: "error"`) or the payload is malformed. Building
 * identifiers come from the model-supplied `input` (task 4.2: footprints are
 * matched by code from input, and input preserves the asked direction — the
 * spec's own example returns result.from/to swapped); `result` codes are only
 * a fallback for malformed input.
 */
export function extractWalkingHighlight(call: ToolCall): WalkingHighlight | null {
  if (call.name !== "walking_distance" || isToolError(call.result)) return null;
  const result = call.result as Partial<WalkingDistanceResult> | undefined;
  if (typeof result?.meters !== "number" || typeof result.minutes !== "number") return null;
  const from =
    (typeof call.input.from_building === "string" && call.input.from_building) ||
    (typeof result.from === "string" && result.from) ||
    "";
  const to =
    (typeof call.input.to_building === "string" && call.input.to_building) ||
    (typeof result.to === "string" && result.to) ||
    "";
  if (!from || !to) return null;
  return { from, to, meters: result.meters, minutes: result.minutes };
}
