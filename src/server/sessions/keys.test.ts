import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { messageSk, sessionSk, userPk } from "./keys";

describe("session keys", () => {
  // Feature: reogent, Property 7: Session keys enforce ownership and order
  it("Property 7: PKs are scoped to the caller's sub and message SKs sort chronologically", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.integer({ min: 0, max: 999999 }), { minLength: 1, maxLength: 30 }),
        (subA, subB, sessionId, seqs) => {
          fc.pre(subA !== subB);
          // ownership: the PK embeds exactly the caller's sub
          expect(userPk(subA)).toBe(`USER#${subA}`);
          expect(userPk(subA)).not.toBe(userPk(subB));
          expect(userPk(subA).startsWith("USER#")).toBe(true);
          // order: lexicographic SK order equals numeric seq order
          const lexicographic = seqs.map((s) => messageSk(sessionId, s)).sort();
          const numeric = [...seqs].sort((a, b) => a - b).map((s) => messageSk(sessionId, s));
          expect(lexicographic).toEqual(numeric);
          // message SKs live under their session's SK prefix
          expect(messageSk(sessionId, seqs[0]).startsWith(`${sessionSk(sessionId)}#MSG#`)).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });
});
