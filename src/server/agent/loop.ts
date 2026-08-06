import type {
  AgentResult,
  ChatMessage,
  ContentBlock,
  ConverseFn,
  ConverseMessage,
  DatasetModule,
  OsClient,
  ToolCall,
} from "../core/types";
import { executeTool, isToolError } from "./executor";

export const ITERATION_LIMIT = 8;

export const SYSTEM_PROMPT = `You are the UBC Vancouver campus assistant. Answer questions about courses, admissions, tuition and costs, campus buildings and walking routes, study spaces and library room bookings, food and services, parking, events, key dates, and university policies.

Always use the provided tools to look up facts instead of answering from memory. If a tool returns an error or no results, say what you could not find rather than guessing.

When you answer, cite your sources. If a tool result includes a URL (a url, source_url, or payment_link field), cite it as a markdown link, e.g. [UBC Academic Calendar](https://vancouver.calendar.ubc.ca/...). Otherwise cite the tool the data came from (for example, "according to walking_distance").

Present values in human units: walking distances as minutes (with metres if helpful), and money as CAD dollar amounts.

When the user does not specify a year, term, cohort, or date, assume the current or most recent one and say which you assumed — do not ask them to clarify.`;

/** SYSTEM_PROMPT plus the current date and time in campus-local time. */
export function systemPrompt(now = new Date()): string {
  const date = now.toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${SYSTEM_PROMPT}\n\nIt is now ${date} (Vancouver time).`;
}

export interface AgentDeps {
  converse: ConverseFn;
  modules: DatasetModule[];
  os: OsClient;
}

/** The tool-calling loop against the Converse API (Requirements 2.2–2.7). */
export async function runAgentLoop(messages: ChatMessage[], deps: AgentDeps): Promise<AgentResult> {
  const toolSpecs = deps.modules.flatMap((m) => m.tools.map((t) => t.spec));
  const convo: ConverseMessage[] = messages.map((m) => ({
    role: m.role,
    content: [{ text: m.content }],
  }));
  const toolCalls: ToolCall[] = [];
  let lastText = "";

  for (let i = 0; i < ITERATION_LIMIT; i++) {
    const res = await deps.converse({ messages: convo, system: systemPrompt(), toolSpecs });
    convo.push(res.message);
    const text = (res.message.content ?? [])
      .map((b) => b.text)
      .filter(Boolean)
      .join("");
    if (text) lastText = text;

    if (res.stopReason !== "tool_use") {
      return { message: lastText, tool_calls: toolCalls };
    }

    const results: ContentBlock[] = [];
    for (const block of res.message.content ?? []) {
      if (!block.toolUse) continue;
      const { toolUseId, name, input } = block.toolUse;
      const result = await executeTool(deps.modules, name, input, deps.os);
      toolCalls.push({ name, input, result });
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

  return {
    message: lastText,
    tool_calls: toolCalls,
    warning: `Stopped after ${ITERATION_LIMIT} model calls without a final answer.`,
  };
}
