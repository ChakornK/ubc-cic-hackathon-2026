import { streamAgent } from "@/src/server/agent/stream";
import { requireUser } from "@/src/server/auth";
import { validateChatRequest } from "@/src/server/core/validate";
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
    const lastUser = parsed.value.messages.findLast((m) => m.role === "user");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let doneEvent: {
            message: string;
            tool_calls: { name: string; input: Record<string, unknown>; result?: unknown }[];
            warning?: string;
          } | null = null;

          for await (const event of streamAgent(parsed.value.messages, { modules, os: getOsClient() })) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
            if (event.type === "done") {
              doneEvent = event;
            }
          }

          // Persist after streaming completes
          if (doneEvent && lastUser) {
            await appendExchange(user.sub, sessionId, lastUser.content, doneEvent.message, doneEvent.tool_calls);
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : "Internal server error";
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message }) + "\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
