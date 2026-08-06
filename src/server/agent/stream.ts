// Streaming agent loop: yields NDJSON events as the model generates text
// and executes tools. The non-streaming loop in loop.ts remains for property tests.

import { converseStream } from "../bedrock";
import type { ChatMessage, ContentBlock, ConverseMessage, DatasetModule, OsClient, ToolCall } from "../core/types";
import { executeTool, isToolError } from "./executor";
import { ITERATION_LIMIT, systemPrompt } from "./loop";

// Stream event types sent as NDJSON lines to the client
export type StreamEvent =
  | { type: "thinking"; delta: string }
  | { type: "text"; delta: string }
  | { type: "tool_start"; name: string; input: Record<string, unknown> }
  | { type: "tool_end"; name: string; result: unknown }
  | { type: "turn_start" }
  | { type: "done"; message: string; tool_calls: ToolCall[]; warning?: string }
  | { type: "error"; message: string };

export interface StreamAgentDeps {
  modules: DatasetModule[];
  os: OsClient;
}

/** Runs the agent loop, yielding StreamEvents via an async generator. */
export async function* streamAgent(messages: ChatMessage[], deps: StreamAgentDeps): AsyncGenerator<StreamEvent> {
  const toolSpecs = deps.modules.flatMap((m) => m.tools.map((t) => t.spec));
  const convo: ConverseMessage[] = messages.map((m) => ({
    role: m.role,
    content: [{ text: m.content }],
  }));
  const toolCalls: ToolCall[] = [];
  let fullText = "";

  for (let i = 0; i < ITERATION_LIMIT; i++) {
    if (i > 0) yield { type: "turn_start" as const };

    let iterText = "";
    const toolUses: { toolUseId: string; name: string; input: Record<string, unknown> }[] = [];
    let stopReason = "end_turn";

    // Stream thinking and text deltas immediately as they arrive
    for await (const event of converseStream({ messages: convo, system: systemPrompt(), toolSpecs })) {
      if (event.type === "thinking") {
        yield { type: "thinking", delta: event.delta };
      } else if (event.type === "text") {
        iterText += event.delta;
        yield { type: "text", delta: event.delta };
      } else if (event.type === "tool_use") {
        toolUses.push(event);
      } else if (event.type === "stop") {
        stopReason = event.reason;
      }
    }

    if (iterText) fullText = iterText;

    // Build the assistant message for conversation history
    const assistantContent: ContentBlock[] = [];
    if (iterText) assistantContent.push({ text: iterText });
    for (const tu of toolUses) {
      assistantContent.push({ toolUse: { toolUseId: tu.toolUseId, name: tu.name, input: tu.input } });
    }
    convo.push({ role: "assistant", content: assistantContent });

    if (stopReason !== "tool_use") {
      yield { type: "done", message: fullText, tool_calls: toolCalls };
      return;
    }

    // Execute tools
    const results: ContentBlock[] = [];
    for (const { toolUseId, name, input } of toolUses) {
      yield { type: "tool_start", name, input };
      const result = await executeTool(deps.modules, name, input, deps.os);
      toolCalls.push({ name, input, result });
      yield { type: "tool_end", name, result };
      results.push({
        toolResult: {
          toolUseId,
          content: [{ json: result }],
          ...(isToolError(result) ? { status: "error" as const } : {}),
        },
      });
    }
    convo.push({ role: "user", content: results });
  }

  yield {
    type: "done",
    message: fullText,
    tool_calls: toolCalls,
    warning: `Stopped after ${ITERATION_LIMIT} model calls without a final answer.`,
  };
}
