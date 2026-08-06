import type { ChatRequest } from "./types";

type Result = { ok: true; value: ChatRequest } | { ok: false; error: string };

const err = (error: string): Result => ({ ok: false, error });

/** Validates an already-JSON-parsed chat request body (Requirement 2.8). */
export function validateChatRequest(body: unknown): Result {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return err("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  if (!("messages" in b)) return err('Missing "messages" field');
  if (!Array.isArray(b.messages)) return err('"messages" must be an array');
  if (b.messages.length === 0) return err('"messages" must not be empty');
  for (const m of b.messages) {
    if (typeof m !== "object" || m === null) return err("Each message must be an object");
    const msg = m as Record<string, unknown>;
    if (msg.role !== "user" && msg.role !== "assistant") {
      return err('Each message role must be "user" or "assistant"');
    }
    if (typeof msg.content !== "string") return err("Each message content must be a string");
  }
  if (b.session_id !== undefined && typeof b.session_id !== "string") {
    return err('"session_id" must be a string');
  }
  return { ok: true, value: { session_id: b.session_id as string | undefined, messages: b.messages } };
}
