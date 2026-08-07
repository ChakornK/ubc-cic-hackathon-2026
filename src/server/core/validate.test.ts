import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { validateChatRequest } from "./validate";

const validMessage = fc.record({
  role: fc.constantFrom("user" as const, "assistant" as const),
  content: fc.string(),
});

describe("chat request validation", () => {
  // Feature: reogent, Property 5: Request validation
  it("Property 5: rejects missing/empty messages, accepts non-empty role/content pairs", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // invalid: anything without a usable messages array
          fc
            .anything()
            .filter(
              (b) =>
                typeof b !== "object" ||
                b === null ||
                Array.isArray(b) ||
                !Array.isArray((b as Record<string, unknown>).messages) ||
                ((b as Record<string, unknown>).messages as unknown[]).length === 0,
            )
            .map((body) => ({ body, valid: false })),
          // valid: non-empty array of role/content pairs
          fc
            .record({
              session_id: fc.option(fc.uuid(), { nil: undefined }),
              messages: fc.array(validMessage, { minLength: 1, maxLength: 10 }),
            })
            .map((body) => ({ body, valid: true })),
        ),
        ({ body, valid }) => {
          const result = validateChatRequest(body);
          expect(result.ok).toBe(valid);
          if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("rejects malformed message entries", () => {
    expect(validateChatRequest({ messages: [{ role: "system", content: "x" }] }).ok).toBe(false);
    expect(validateChatRequest({ messages: [{ role: "user", content: 5 }] }).ok).toBe(false);
    expect(validateChatRequest({ messages: [{ role: "user", content: "hi" }], session_id: 7 }).ok).toBe(false);
  });
});
