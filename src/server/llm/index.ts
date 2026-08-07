import type { ConverseFn, ConverseMessage, ToolSpec } from "../core/types";
import type { ConverseStreamEvent, LlmAdapter } from "./types";

export type { ConverseStreamEvent };

let adapter: LlmAdapter | undefined;

function getAdapter(): LlmAdapter {
  if (adapter) return adapter;

  const apiType = (process.env.LLM_API_TYPE || "openai").toLowerCase();

  switch (apiType) {
    case "openai": {
      const { createOpenAIAdapter } = require("./openai") as typeof import("./openai");
      adapter = createOpenAIAdapter();
      break;
    }
    case "anthropic": {
      const { createAnthropicAdapter } = require("./anthropic") as typeof import("./anthropic");
      adapter = createAnthropicAdapter();
      break;
    }
    case "google": {
      const { createGoogleAdapter } = require("./google") as typeof import("./google");
      adapter = createGoogleAdapter();
      break;
    }
    default:
      throw new Error(`Unsupported LLM_API_TYPE: "${apiType}". Valid values: openai, anthropic, google`);
  }

  return adapter!;
}

export const converse: ConverseFn = (req) => getAdapter().converse(req);

export function converseStream(req: {
  messages: ConverseMessage[];
  system: string;
  toolSpecs: ToolSpec[];
}): AsyncGenerator<ConverseStreamEvent> {
  return getAdapter().converseStream(req);
}
