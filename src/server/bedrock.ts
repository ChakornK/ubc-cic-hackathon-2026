import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import type { ConverseFn, ConverseMessage } from "./core/types";

let client: BedrockRuntimeClient | undefined;

/** Non-streaming Converse call; model ID from BEDROCK_MODEL_ID (2.6, 8.3). */
export const converse: ConverseFn = async ({ messages, system, toolSpecs }) => {
  client ??= new BedrockRuntimeClient({});
  const res = await client.send(
    new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      // biome-ignore lint/suspicious/noExplicitAny: our structural ConverseMessage matches the SDK wire shape
      messages: messages as any,
      system: [{ text: system }],
      // biome-ignore lint/suspicious/noExplicitAny: our JSON-schema records are valid SDK DocumentType
      toolConfig: { tools: toolSpecs.map((spec) => ({ toolSpec: spec }) as any) },
    }),
  );
  return {
    stopReason: res.stopReason ?? "end_turn",
    message: (res.output?.message ?? { role: "assistant", content: [] }) as ConverseMessage,
  };
};
