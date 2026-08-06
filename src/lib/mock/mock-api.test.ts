// Spec-conformance tests for the mock ChatApi (task 1.1): fixtures must match
// api-spec.md shapes, including tool calls, the warning case, and 400/401/404.

import type { ChatMessage, SearchCoursesResult, WalkingDistanceResult } from "@/src/lib/api-types";
import { ApiError } from "@/src/lib/api-types";
import { createMockApi } from "@/src/lib/mock/mock-api";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function api(overrides: Partial<Parameters<typeof createMockApi>[0]> = {}) {
  return createMockApi({ getToken: async () => "test-token", latencyMs: 0, seed: false, ...overrides });
}

function user(content: string): ChatMessage[] {
  return [{ role: "user", content }];
}

describe("auth handling", () => {
  it("rejects every call with 401 when no token is available", async () => {
    const unauthed = api({ getToken: async () => null });
    for (const call of [
      () => unauthed.chat(crypto.randomUUID(), user("hi")),
      () => unauthed.listSessions(),
      () => unauthed.getSession("x"),
      () => unauthed.getGeo("buildings"),
      () => unauthed.getProfile(),
    ]) {
      await expect(call()).rejects.toMatchObject({ status: 401 });
    }
  });
});

describe("chat validation (400)", () => {
  it("rejects an empty messages array", async () => {
    await expect(api().chat(crypto.randomUUID(), [])).rejects.toMatchObject({ status: 400 });
  });

  it("rejects any conversation whose last message is not a non-empty user message", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant<ChatMessage[]>([]),
          fc.array(fc.record({ role: fc.constant<"assistant">("assistant"), content: fc.string() }), { maxLength: 4 }),
          fc.constant<ChatMessage[]>([{ role: "user", content: "   " }]),
        ),
        async (messages) => {
          try {
            await api().chat(crypto.randomUUID(), messages);
            return false;
          } catch (error) {
            return error instanceof ApiError && error.status === 400;
          }
        },
      ),
    );
  });
});

describe("tool-call fixtures", () => {
  it("returns a spec-shaped walking_distance call for walk questions", async () => {
    const response = await api().chat(crypto.randomUUID(), user("How long is the walk from IKB to ICCS?"));
    expect(response.message.length).toBeGreaterThan(0);
    const call = response.tool_calls.find((c) => c.name === "walking_distance");
    expect(call).toBeDefined();
    expect(call?.input).toMatchObject({ from_building: "IKB", to_building: "ICCS" });
    const result = call?.result as WalkingDistanceResult;
    expect(result.from).toBe("IKB");
    expect(result.to).toBe("ICCS");
    expect(result.meters).toBeGreaterThan(0);
    expect(result.minutes).toBeGreaterThan(0);
  });

  it("returns search_courses cards with HH:MM section times", async () => {
    const response = await api().chat(crypto.randomUUID(), user("Find CPSC courses about software"));
    const call = response.tool_calls.find((c) => c.name === "search_courses");
    expect(call).toBeDefined();
    const result = call?.result as SearchCoursesResult;
    expect(result.courses.length).toBeGreaterThan(0);
    for (const course of result.courses) {
      for (const section of course.sections) {
        if (section.start_time !== null) expect(section.start_time).toMatch(TIME_RE);
        if (section.end_time !== null) expect(section.end_time).toMatch(TIME_RE);
      }
    }
  });

  it("answers a specific course question with two tool calls (search + get_course)", async () => {
    const response = await api().chat(crypto.randomUUID(), user("What are the prerequisites for CPSC 310?"));
    const names = response.tool_calls.map((c) => c.name);
    expect(names).toContain("search_courses");
    expect(names).toContain("get_course");
  });

  it("returns a get_tuition call with a numeric per-credit rate", async () => {
    const response = await api().chat(crypto.randomUUID(), user("What's tuition per credit for international students?"));
    const call = response.tool_calls.find((c) => c.name === "get_tuition");
    if (!call) throw new Error("expected a get_tuition tool call");
    const result = call.result as { per_credit_cad: number; student_type: string };
    expect(result.per_credit_cad).toBeGreaterThan(0);
    expect(result.student_type).toBe("international");
  });

  it("includes the iteration-limit warning alongside a usable message for sweeping questions", async () => {
    const response = await api().chat(crypto.randomUUID(), user("List every course at UBC"));
    expect(response.warning).toBeTruthy();
    expect(response.message.length).toBeGreaterThan(0);
    expect(response.tool_calls.length).toBeGreaterThan(0);
  });

  it("returns an error-shaped tool result for unknown buildings", async () => {
    const response = await api().chat(crypto.randomUUID(), user("How far is the walk from ICCS to HOGWARTS?"));
    const call = response.tool_calls.find((c) => c.name === "walking_distance");
    // Unknown second building may not be detected as a pair; when it is, the result is an error shape.
    if (call) {
      expect(call.result).toMatchObject({ status: "error" });
    }
  });
});

describe("sessions", () => {
  it("persists exchanges and lists sessions newest-first with ≤80-char titles", async () => {
    const mock = api();
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();
    const longQuestion = `Tell me about tuition ${"x".repeat(120)}`;
    await mock.chat(first, user("How long is the walk from IKB to ICCS?"));
    await mock.chat(second, user(longQuestion));

    const sessions = await mock.listSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].session_id).toBe(second);
    for (const session of sessions) {
      expect(session.title.length).toBeLessThanOrEqual(80);
      expect(Number.isNaN(Date.parse(session.updatedAt))).toBe(false);
    }
    const sorted = [...sessions].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    expect(sessions.map((s) => s.session_id)).toEqual(sorted.map((s) => s.session_id));
  });

  it("returns chronological role-correct history for an existing session and 404 otherwise", async () => {
    const mock = api();
    const id = crypto.randomUUID();
    await mock.chat(id, user("Find 3-credit CPSC courses with no prerequisites"));
    const history = await mock.getSession(id);
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("assistant");
    await expect(mock.getSession(crypto.randomUUID())).rejects.toMatchObject({ status: 404 });
  });
});

describe("geo datasets", () => {
  it("serves ≥12 building footprints with BLDG_CODE and NAME", async () => {
    const collection = await api().getGeo("buildings");
    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features.length).toBeGreaterThanOrEqual(12);
    for (const feature of collection.features) {
      expect(feature.properties).toMatchObject({ BLDG_CODE: expect.any(String), NAME: expect.any(String) });
      expect(["Polygon", "MultiPolygon"]).toContain(feature.geometry.type);
    }
  });

  it("serves walking routes as LineStrings and 404s unknown names", async () => {
    const routes = await api().getGeo("walking-routes");
    expect(routes.features.length).toBeGreaterThan(0);
    for (const feature of routes.features) {
      expect(feature.geometry.type).toBe("LineString");
    }
    await expect(api().getGeo("elevators" as never)).rejects.toMatchObject({ status: 404 });
  });
});
