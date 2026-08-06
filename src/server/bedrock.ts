import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
  type ContentBlock as SdkContentBlock,
  type Tool,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import type { ContentBlock, ConverseFn, ConverseMessage, ToolSpec } from "./core/types";

let client: BedrockRuntimeClient | undefined;

/** Converts our flat ContentBlock to the SDK's discriminated union. */
function toSdkBlock(b: ContentBlock): SdkContentBlock {
  if (b.text != null) return { text: b.text };
  if (b.toolUse) return { toolUse: { toolUseId: b.toolUse.toolUseId, name: b.toolUse.name, input: b.toolUse.input } };
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
  return { toolSpec: { name: spec.name, description: spec.description, inputSchema: { json: spec.inputSchema.json } } };
}

/** Non-streaming Converse call; model ID from BEDROCK_MODEL_ID env var. */
export const converse: ConverseFn = async ({ messages, system, toolSpecs }) => {
  client ??= new BedrockRuntimeClient({});
  const res = await client.send(
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
