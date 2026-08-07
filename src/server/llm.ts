import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import type { ContentBlock, ConverseFn, ConverseMessage, ToolSpec } from "./core/types";

let client: OpenAI | undefined;

function getClient(): OpenAI {
  client ??= new OpenAI({
    baseURL: process.env.LLM_BASE_URL || "http://localhost:11434/v1",
    apiKey: process.env.LLM_API_KEY || "unused",
  });
  return client;
}

function getModel(): string {
  return process.env.LLM_MODEL || "llama3.1";
}

/** Maps internal ConverseMessage to OpenAI ChatCompletionMessageParam. */
function toOpenAIMessages(messages: ConverseMessage[], system: string): ChatCompletionMessageParam[] {
  const out: ChatCompletionMessageParam[] = [{ role: "system", content: system }];

  for (const m of messages) {
    if (m.role === "user") {
      // Collect tool_result blocks as tool messages, text as user message
      for (const block of m.content) {
        if (block.toolResult) {
          out.push({
            role: "tool",
            tool_call_id: block.toolResult.toolUseId,
            content: JSON.stringify(block.toolResult.content.map((c) => c.json)),
          });
        } else if (block.text) {
          out.push({ role: "user", content: block.text });
        }
      }
    } else {
      // Assistant: text + tool_use blocks
      const textParts = m.content
        .filter((b) => b.text)
        .map((b) => b.text!)
        .join("");
      const toolCalls = m.content
        .filter((b) => b.toolUse)
        .map((b) => ({
          id: b.toolUse!.toolUseId,
          type: "function" as const,
          function: { name: b.toolUse!.name, arguments: JSON.stringify(b.toolUse!.input) },
        }));

      out.push({
        role: "assistant",
        content: textParts || null,
        ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
      });
    }
  }

  return out;
}

function toOpenAITools(specs: ToolSpec[]): ChatCompletionTool[] {
  return specs.map((s) => ({
    type: "function",
    function: {
      name: s.name,
      description: s.description,
      parameters: s.inputSchema.json,
    },
  }));
}

/** Non-streaming completion mapped back to the internal ConverseFn signature. */
export const converse: ConverseFn = async ({ messages, system, toolSpecs }) => {
  const res = await getClient().chat.completions.create({
    model: getModel(),
    messages: toOpenAIMessages(messages, system),
    tools: toolSpecs.length ? toOpenAITools(toolSpecs) : undefined,
  });

  const choice = res.choices[0];
  const content: ContentBlock[] = [];

  if (choice.message.content) {
    content.push({ text: choice.message.content });
  }
  if (choice.message.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      if (tc.type !== "function") continue;
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(tc.function.arguments || "{}");
      } catch {
        /* pass */
      }
      content.push({
        toolUse: { toolUseId: tc.id, name: tc.function.name, input },
      });
    }
  }

  const stopReason = choice.finish_reason === "tool_calls" ? "tool_use" : "end_turn";
  return { stopReason, message: { role: "assistant", content } };
};

// --- Streaming support ---

export type ConverseStreamEvent =
  | { type: "thinking"; delta: string }
  | { type: "text"; delta: string }
  | { type: "tool_use"; toolUseId: string; name: string; input: Record<string, unknown> }
  | { type: "stop"; reason: string };

/** Streaming completion; yields events as they arrive. */
export async function* converseStream(req: {
  messages: ConverseMessage[];
  system: string;
  toolSpecs: ToolSpec[];
}): AsyncGenerator<ConverseStreamEvent> {
  const stream = await getClient().chat.completions.create({
    model: getModel(),
    messages: toOpenAIMessages(req.messages, req.system),
    tools: req.toolSpecs.length ? toOpenAITools(req.toolSpecs) : undefined,
    stream: true,
  });

  // Track tool calls being assembled from deltas
  const toolCalls = new Map<number, { id: string; name: string; args: string }>();

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    // Reasoning/thinking tokens (provider-dependent field name)
    const reasoning =
      (delta as Record<string, unknown>).reasoning_content ?? (delta as Record<string, unknown>).reasoning;
    if (typeof reasoning === "string" && reasoning) {
      yield { type: "thinking", delta: reasoning };
    }

    if (delta.content) {
      yield { type: "text", delta: delta.content };
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index;
        if (!toolCalls.has(idx)) {
          toolCalls.set(idx, { id: tc.id || "", name: tc.function?.name || "", args: "" });
        }
        const entry = toolCalls.get(idx)!;
        if (tc.id) entry.id = tc.id;
        if (tc.function?.name) entry.name = tc.function.name;
        if (tc.function?.arguments) entry.args += tc.function.arguments;
      }
    }

    const finishReason = chunk.choices[0]?.finish_reason;
    if (finishReason) {
      // Emit assembled tool calls
      for (const [, tc] of toolCalls) {
        let input: Record<string, unknown> = {};
        try {
          input = JSON.parse(tc.args || "{}");
        } catch {
          /* pass */
        }
        yield { type: "tool_use", toolUseId: tc.id, name: tc.name, input };
      }
      toolCalls.clear();

      const reason = finishReason === "tool_calls" ? "tool_use" : "end_turn";
      yield { type: "stop", reason };
    }
  }
}
