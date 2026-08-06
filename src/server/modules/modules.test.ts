import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatSeconds } from "../core/time";
import { pairwiseDistances, transformBuilding } from "./buildings";
import { hasNoPrereqs } from "./courses";
import { modules } from "./index";
import { transformTuition } from "./tuition";

describe("has_no_prereqs filter", () => {
  // Feature: campus-ai-assistant, Property 6: `has_no_prereqs` filter semantics
  it("Property 6: admits exactly the records whose prerequisite is null, absent, or empty", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ prerequisite: fc.oneof(fc.string(), fc.constant(""), fc.constant(null)) }, { requiredKeys: [] }),
          { maxLength: 20 },
        ),
        (records) => {
          const admitted = records.filter(hasNoPrereqs);
          const expected = records.filter(
            (r) => !("prerequisite" in r) || r.prerequisite === null || r.prerequisite === "",
          );
          expect(admitted).toEqual(expected);
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("ingest document IDs", () => {
  const tuitionRow = fc.record({
    unit: fc.constant("per_credit"),
    amount: fc.double({ min: 0, max: 5000, noNaN: true }),
    program: fc.string({ minLength: 1, maxLength: 40 }),
    student_type: fc.constantFrom("domestic", "international"),
    cohort_year: fc.option(fc.integer({ min: 2000, max: 2030 }), { nil: null }),
    cohort_rule: fc.option(fc.constantFrom("exactly" as const, "or_later" as const), { nil: null }),
  });

  // Feature: campus-ai-assistant, Property 8: Ingest document IDs are deterministic and unique
  it("Property 8: IDs are stable across calls and differ when the natural key differs", () => {
    fc.assert(
      fc.property(tuitionRow, tuitionRow, (a, b) => {
        const ta = transformTuition(a);
        expect(ta?._id).toBe(transformTuition(a)?._id); // deterministic
        const tb = transformTuition(b);
        const keyOf = (r: typeof a) =>
          `${transformTuition(r)?.doc.program_slug}#${r.student_type}#${r.cohort_year}#${r.cohort_rule}`;
        if (ta && tb && keyOf(a) !== keyOf(b)) expect(ta._id).not.toBe(tb._id);
      }),
      { numRuns: 200 },
    );
  });

  it("walking-distance pair IDs are ordered and unique", () => {
    const pairs = pairwiseDistances([
      { code: "B", name: "b", lat: 49.26, lon: -123.25 },
      { code: "A", name: "a", lat: 49.261, lon: -123.251 },
      { code: "C", name: "c", lat: 49.262, lon: -123.249 },
    ]);
    expect(pairs).toHaveLength(3);
    for (const p of pairs) expect(p.from < p.to).toBe(true);
    const ids = pairs.map((p) => `${p.from}#${p.to}`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("building transform keys by BLDG_CODE and skips codeless features", () => {
    const f = {
      properties: { BLDG_CODE: "ICCS", NAME: "ICICS" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-123.25, 49.26],
            [-123.251, 49.261],
            [-123.249, 49.26],
          ],
        ],
      },
    };
    const t = transformBuilding(f);
    expect(t?._id).toBe("ICCS");
    expect(t?.doc.lat).toBeCloseTo(49.2603, 3);
    expect(transformBuilding({ properties: {}, geometry: f.geometry })).toBeNull();
  });
});

describe("module registry consistency", () => {
  it("tool, index, and geo names are unique across modules", () => {
    for (const names of [
      modules.flatMap((m) => m.tools.map((t) => t.spec.name)),
      modules.flatMap((m) => m.indices.map((i) => i.index)),
      modules.flatMap((m) => (m.geo ?? []).map((g) => g.name)),
    ]) {
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("every tool spec has typed, described properties and a required list", () => {
    for (const tool of modules.flatMap((m) => m.tools)) {
      expect(tool.spec.description.length).toBeGreaterThan(0);
      const schema = tool.spec.inputSchema.json as {
        type: string;
        properties: Record<string, { type?: string; description?: string }>;
        required: string[];
      };
      expect(schema.type).toBe("object");
      expect(Array.isArray(schema.required)).toBe(true);
      expect(Object.keys(schema.properties).length).toBeGreaterThan(0);
      for (const prop of Object.values(schema.properties)) {
        expect(prop.type).toBeTruthy();
        expect(prop.description).toBeTruthy();
      }
      for (const req of schema.required) expect(schema.properties[req]).toBeDefined();
    }
  });

  it("formatSeconds(55800) === '15:30'", () => {
    expect(formatSeconds(55800)).toBe("15:30");
  });
});
