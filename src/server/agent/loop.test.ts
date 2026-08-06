import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { ConverseMessage, DatasetModule, OsClient } from "../core/types";
import { ITERATION_LIMIT, runAgentLoop, SYSTEM_PROMPT } from "./loop";

const os = {} as OsClient;

interface ToolUseStep {
  stop: "tool_use";
  uses: { name: string; input: Record<string, unknown> }[];
}
interface EndStep {
  stop: "end_turn";
}
type Step = ToolUseStep | EndStep;

const stepArb: fc.Arbitrary<Step> = fc.oneof(
  { weight: 2, arbitrary: fc.constant({ stop: "end_turn" } as EndStep) },
  {
    weight: 3,
    arbitrary: fc
      .array(
        fc.record({
          name: fc.constantFrom("alpha", "beta", "gamma"),
          input: fc.dictionary(fc.string({ minLength: 1, maxLength: 5 }), fc.string(), { maxKeys: 3 }),
        }),
        { minLength: 1, maxLength: 3 },
      )
      .map((uses) => ({ stop: "tool_use", uses }) as ToolUseStep),
  },
);

// Scripts always long enough that the loop, not the script, decides when to stop.
const scriptArb = fc.array(stepArb, { minLength: ITERATION_LIMIT, maxLength: ITERATION_LIMIT + 4 });

/** A converse mock that replays the script and asserts every pending toolUse
 *  got a matching toolResult before the next call. */
function makeScriptedConverse(script: Step[]) {
  let call = 0;
  let pendingIds: string[] = [];
  const converse = async ({ messages }: { messages: ConverseMessage[] }) => {
    if (pendingIds.length > 0) {
      const last = messages[messages.length - 1];
      expect(last.role).toBe("user");
      const resultIds = last.content.map((b) => b.toolResult?.toolUseId);
      expect(resultIds).toEqual(pendingIds);
    }
    const step = script[call];
    const message: ConverseMessage =
      step.stop === "end_turn"
        ? { role: "assistant", content: [{ text: `answer ${call}` }] }
        : {
            role: "assistant",
            content: step.uses.map((u, j) => ({
              toolUse: { toolUseId: `id-${call}-${j}`, name: u.name, input: u.input },
            })),
          };
    pendingIds = step.stop === "tool_use" ? step.uses.map((_, j) => `id-${call}-${j}`) : [];
    call++;
    return { stopReason: step.stop, message };
  };
  return { converse, calls: () => call };
}

const modules: DatasetModule[] = [
  {
    name: "m",
    indices: [],
    tools: ["alpha", "beta", "gamma"].map((name) => ({
      spec: { name, description: "d", inputSchema: { json: { type: "object", properties: {} } } },
      execute: async (input) => ({ echoed: input }),
    })),
  },
];

const userMessages = [{ role: "user" as const, content: "q" }];

describe("Agent_Loop", () => {
  // Feature: campus-ai-assistant, Property 2: Agent loop terminates with the correct call count
  it("Property 2: makes exactly min(firstEndTurn+1, 8) converse calls; warning iff no end_turn", async () => {
    await fc.assert(
      fc.asyncProperty(scriptArb, async (script) => {
        const scripted = makeScriptedConverse(script);
        const result = await runAgentLoop(userMessages, { converse: scripted.converse, modules, os });
        const firstEnd = script.findIndex((s) => s.stop === "end_turn");
        const expectedCalls = firstEnd === -1 || firstEnd >= ITERATION_LIMIT ? ITERATION_LIMIT : firstEnd + 1;
        expect(scripted.calls()).toBe(expectedCalls);
        const limitHit = firstEnd === -1 || firstEnd >= ITERATION_LIMIT;
        expect(result.warning !== undefined).toBe(limitHit);
      }),
      { numRuns: 150 },
    );
  });

  // Feature: campus-ai-assistant, Property 3: Every requested tool call is executed and reported
  it("Property 3: every toolUse gets a matching toolResult and tool_calls lists them in order", async () => {
    await fc.assert(
      fc.asyncProperty(scriptArb, async (script) => {
        const scripted = makeScriptedConverse(script); // asserts toolResult ids per call
        const result = await runAgentLoop(userMessages, { converse: scripted.converse, modules, os });
        const requested = script.slice(0, scripted.calls()).flatMap((s) => (s.stop === "tool_use" ? s.uses : []));
        expect(result.tool_calls.map(({ name, input }) => ({ name, input }))).toEqual(requested);
        for (const call of result.tool_calls) expect(call.result).toEqual({ echoed: call.input });
      }),
      { numRuns: 150 },
    );
  });

  describe("system prompt (Requirement 2.7)", () => {
    it("instructs tool use", () => {
      expect(SYSTEM_PROMPT).toMatch(/use the provided tools/i);
    });
    it("instructs citing the source tool", () => {
      expect(SYSTEM_PROMPT).toMatch(/cite the tool/i);
    });
    it("instructs human units: minutes, CAD", () => {
      expect(SYSTEM_PROMPT).toMatch(/minutes/i);
      expect(SYSTEM_PROMPT).toContain("CAD");
    });
  });
});
