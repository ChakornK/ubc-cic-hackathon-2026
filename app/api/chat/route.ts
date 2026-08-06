import { requireUser } from "@/src/server/auth";
import { runAgentLoop } from "@/src/server/agent/loop";
import { validateChatRequest } from "@/src/server/core/validate";
import { converse } from "@/src/server/bedrock";
import { modules } from "@/src/server/modules";
import { getOsClient } from "@/src/server/search";
import { appendExchange } from "@/src/server/sessions/store";
import { json, serverError } from "../http";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }
    const parsed = validateChatRequest(body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);

    const sessionId = parsed.value.session_id ?? crypto.randomUUID();
    const result = await runAgentLoop(parsed.value.messages, { converse, modules, os: getOsClient() });

    const lastUser = parsed.value.messages.findLast((m) => m.role === "user");
    if (lastUser) {
      await appendExchange(user.sub, sessionId, lastUser.content, result.message, result.tool_calls);
    }
    return json(result);
  } catch (e) {
    return serverError(e);
  }
}
