import { requireUser } from "@/src/server/auth";
import type { Profile } from "@/src/server/core/types";
import { getProfile, putProfile } from "@/src/server/sessions/store";
import { json, serverError } from "../http";

const MAX_PROFILE_BYTES = 8 * 1024; // 8 KB cap on stored preferences

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    return json(await getProfile(user.sub));
  } catch (e) {
    return serverError(e);
  }
}

/** Validates that preferences is a flat string-to-string map and the
 *  total serialized size stays under the cap. */
function validateProfile(body: Record<string, unknown>): string | null {
  const prefs = body.preferences;
  if (prefs !== undefined) {
    if (typeof prefs !== "object" || prefs === null || Array.isArray(prefs)) {
      return '"preferences" must be a plain object';
    }
    for (const [k, v] of Object.entries(prefs)) {
      if (typeof k !== "string" || typeof v !== "string") {
        return 'Each entry in "preferences" must map a string key to a string value';
      }
    }
  }
  if (body.email !== undefined && typeof body.email !== "string") {
    return '"email" must be a string';
  }
  const size = new TextEncoder().encode(JSON.stringify(body)).byteLength;
  if (size > MAX_PROFILE_BYTES) {
    return `Profile payload exceeds ${MAX_PROFILE_BYTES} byte limit`;
  }
  return null;
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return json({ error: "Profile must be a JSON object" }, 400);
    }
    const err = validateProfile(body as Record<string, unknown>);
    if (err) return json({ error: err }, 400);
    await putProfile(user.sub, body as Profile);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
