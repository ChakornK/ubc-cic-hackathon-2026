// The mock-mode user journey, verified end to end at the logic level with
// vitest (UI rendering itself is verified visually per the task notes):
// sign-in token → chat walking question → renderer highlight extraction →
// building resolution from geo data → route + camera bounds the map draws.

import type { ToolCall } from "@/src/lib/api-types";
import { featureCentroid, featuresBounds, findBuilding } from "@/src/lib/geo";
import { createMockApi } from "@/src/lib/mock/mock-api";
import { extractWalkingHighlight } from "@/src/lib/walking";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("extractWalkingHighlight", () => {
  const healthy: ToolCall = {
    name: "walking_distance",
    input: { from_building: "IKB", to_building: "ICCS" },
    result: { from: "IKB", to: "ICCS", meters: 790, minutes: 10 },
  };

  it("extracts the highlight from a healthy call", () => {
    expect(extractWalkingHighlight(healthy)).toEqual({ from: "IKB", to: "ICCS", meters: 790, minutes: 10 });
  });

  it("returns null for other tools, error results, and malformed payloads", () => {
    expect(extractWalkingHighlight({ ...healthy, name: "search_courses" })).toBeNull();
    expect(extractWalkingHighlight({ ...healthy, result: { status: "error", message: "no such building" } })).toBeNull();
    expect(extractWalkingHighlight({ ...healthy, result: { from: "IKB", to: "ICCS", meters: "790", minutes: 10 } })).toBeNull();
    expect(extractWalkingHighlight({ ...healthy, result: undefined })).toBeNull();
  });

  it("keeps the asked direction when the backend result swaps from/to (api-spec's own example)", () => {
    const call: ToolCall = {
      name: "walking_distance",
      input: { from_building: "IKB", to_building: "ICCS" },
      result: { from: "ICCS", to: "IKB", meters: 460, minutes: 6 },
    };
    expect(extractWalkingHighlight(call)).toEqual({ from: "IKB", to: "ICCS", meters: 460, minutes: 6 });
  });

  it("falls back to result codes when the input is malformed", () => {
    const call: ToolCall = {
      name: "walking_distance",
      input: {},
      result: { from: "NEST", to: "BUCH", meters: 500, minutes: 7 },
    };
    expect(extractWalkingHighlight(call)).toEqual({ from: "NEST", to: "BUCH", meters: 500, minutes: 7 });
  });

  it("never fabricates a highlight without both endpoints and numeric measures (property)", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constantFrom("walking_distance", "search_courses", "get_course"),
          input: fc.dictionary(fc.constantFrom("from_building", "to_building", "x"), fc.string()),
          result: fc.oneof(
            fc.constant(undefined),
            fc.dictionary(fc.constantFrom("from", "to", "meters", "minutes", "status"), fc.anything()),
          ),
        }),
        (call) => {
          const highlight = extractWalkingHighlight(call as ToolCall);
          if (highlight === null) return true;
          return (
            call.name === "walking_distance" &&
            typeof highlight.meters === "number" &&
            typeof highlight.minutes === "number" &&
            highlight.from.length > 0 &&
            highlight.to.length > 0
          );
        },
      ),
    );
  });
});

describe("mock-mode journey: chat → highlight → map geometry", () => {
  it("resolves the answered route to two footprints, centroids, and camera bounds", async () => {
    const api = createMockApi({ getToken: async () => "token", latencyMs: 0, seed: false });
    const sessionId = crypto.randomUUID();

    // 1) Ask the walking question (as the suggestion chip does).
    const response = await api.chat(sessionId, [{ role: "user", content: "How long is the walk from IKB to ICCS?" }]);

    // 2) The renderer extracts highlight state for the map.
    const call = response.tool_calls.find((c) => c.name === "walking_distance");
    if (!call) throw new Error("expected a walking_distance call");
    const highlight = extractWalkingHighlight(call);
    if (!highlight) throw new Error("expected a highlight from the healthy walking_distance result");

    // 3) The map resolves both buildings from /api/geo/buildings…
    const buildings = await api.getGeo("buildings");
    const from = findBuilding(buildings, highlight.from);
    const to = findBuilding(buildings, highlight.to);
    if (!from || !to) throw new Error("both highlighted buildings must exist in the geo data");

    // …computes centroid-to-centroid route endpoints…
    const fromCenter = featureCentroid(from);
    const toCenter = featureCentroid(to);
    expect(fromCenter).not.toBeNull();
    expect(toCenter).not.toBeNull();

    // …and camera bounds that contain both endpoints.
    const bounds = featuresBounds([from, to]);
    if (!bounds || !fromCenter || !toCenter) throw new Error("bounds and centroids must resolve");
    for (const [lng, lat] of [fromCenter, toCenter]) {
      expect(lng).toBeGreaterThanOrEqual(bounds.west);
      expect(lng).toBeLessThanOrEqual(bounds.east);
      expect(lat).toBeGreaterThanOrEqual(bounds.south);
      expect(lat).toBeLessThanOrEqual(bounds.north);
    }

    // 4) Session reload returns the exchange for the sidebar flow.
    const history = await api.getSession(sessionId);
    expect(history[0]).toEqual({ role: "user", content: "How long is the walk from IKB to ICCS?" });
    expect(history[1].role).toBe("assistant");
  });

  it("clears the route when the latest response has no walking_distance call", async () => {
    const api = createMockApi({ getToken: async () => "token", latencyMs: 0, seed: false });
    const sessionId = crypto.randomUUID();
    const response = await api.chat(sessionId, [{ role: "user", content: "Find CPSC courses about software" }]);
    // The chat panel clears the highlight exactly when this predicate is false.
    expect(response.tool_calls.some((call) => extractWalkingHighlight(call))).toBe(false);
  });
});
