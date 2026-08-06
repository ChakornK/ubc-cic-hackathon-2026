import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
  type Message,
  type ContentBlock as SdkContentBlock,
  type Tool,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import type { ContentBlock, ConverseFn, ConverseMessage, ToolSpec } from "./core/types";

let client: BedrockRuntimeClient | undefined;

function getClient(): BedrockRuntimeClient {
  client ??= new BedrockRuntimeClient({});
  return client;
}

/** Converts our flat ContentBlock to the SDK's discriminated union. */
function toSdkBlock(b: ContentBlock): SdkContentBlock {
  if (b.text != null) return { text: b.text };
  if (b.toolUse)
    return {
      toolUse: {
        toolUseId: b.toolUse.toolUseId,
        name: b.toolUse.name,
        input: b.toolUse.input as any, // ponytail: SDK type mismatch
      },
    };
  if (b.toolResult) {
    return {
      toolResult: {
        toolUseId: b.toolResult.toolUseId,
        content: b.toolResult.content.map((c) => ({ json: c.json }) as ToolResultContentBlock),
        status: b.toolResult.status,
      },
    };
  }
  return { text: "" };
}

function toSdkMessage(m: ConverseMessage): Message {
  return { role: m.role, content: m.content.map(toSdkBlock) };
}

function fromSdkBlock(b: SdkContentBlock): ContentBlock {
  if ("text" in b && b.text != null) return { text: b.text };
  if ("toolUse" in b && b.toolUse) {
    return {
      toolUse: {
        toolUseId: b.toolUse.toolUseId ?? "",
        name: b.toolUse.name ?? "",
        input: (b.toolUse.input as Record<string, unknown>) ?? {},
      },
    };
  }
  return { text: "" };
}

function toSdkTool(spec: ToolSpec): Tool {
  return {
    toolSpec: {
      name: spec.name,
      description: spec.description,
      inputSchema: { json: spec.inputSchema.json as any }, // ponytail: SDK type mismatch
    },
  };
}

/** Non-streaming Converse call; model ID from BEDROCK_MODEL_ID env var. */
export const converse: ConverseFn = async ({ messages, system, toolSpecs }) => {
  const res = await getClient().send(
    new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      messages: messages.map(toSdkMessage),
      system: [{ text: system }],
      toolConfig: { tools: toolSpecs.map(toSdkTool) },
    }),
  );
  const msg = res.output?.message;
  return {
    stopReason: res.stopReason ?? "end_turn",
    message: {
      role: (msg?.role ?? "assistant") as ConverseMessage["role"],
      content: (msg?.content ?? []).map(fromSdkBlock),
    },
  };
};

// --- Streaming support ---

export type ConverseStreamEvent =
  | { type: "thinking"; delta: string }
  | { type: "text"; delta: string }
  | { type: "tool_use"; toolUseId: string; name: string; input: Record<string, unknown> }
  | { type: "stop"; reason: string };

/** Streaming Converse call with extended thinking enabled; yields events as they arrive. */
export async function* converseStream(req: {
  messages: ConverseMessage[];
  system: string;
  toolSpecs: ToolSpec[];
}): AsyncGenerator<ConverseStreamEvent> {
  const res = await getClient().send(
    new ConverseStreamCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      messages: req.messages.map(toSdkMessage),
      system: [{ text: req.system }],
      toolConfig: { tools: req.toolSpecs.map(toSdkTool) },
      additionalModelRequestFields: {
        thinking: { type: "enabled", budget_tokens: 4096 },
      },
      inferenceConfig: { maxTokens: 16384 },
    }),
  );

  if (!res.stream) return;

  let currentToolUseId = "";
  let currentToolName = "";
  let currentToolInput = "";

  for await (const event of res.stream) {
    if (event.contentBlockStart?.start?.toolUse) {
      const tu = event.contentBlockStart.start.toolUse;
      currentToolUseId = tu.toolUseId ?? "";
      currentToolName = tu.name ?? "";
      currentToolInput = "";
    }

    if (event.contentBlockDelta?.delta) {
      const delta = event.contentBlockDelta.delta;
      if ("reasoningContent" in delta && (delta as unknown as Record<string, unknown>).reasoningContent) {
        const rc = (delta as unknown as Record<string, { text?: string }>).reasoningContent;
        if (rc.text) {
          yield { type: "thinking", delta: rc.text };
        }
      } else if (delta.text) {
        yield { type: "text", delta: delta.text };
      } else if (delta.toolUse?.input) {
        currentToolInput += delta.toolUse.input;
      }
    }

    if (event.contentBlockStop && currentToolUseId) {
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(currentToolInput || "{}");
      } catch {
        // malformed input from model; pass empty
      }
      yield { type: "tool_use", toolUseId: currentToolUseId, name: currentToolName, input };
      currentToolUseId = "";
      currentToolName = "";
      currentToolInput = "";
    }

    if (event.messageStop?.stopReason) {
      yield { type: "stop", reason: event.messageStop.stopReason };
    }
  }
}
