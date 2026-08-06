import { requireUser } from "@/src/server/auth";
import type { Profile } from "@/src/server/core/types";
import { getProfile, putProfile } from "@/src/server/sessions/store";
import { json, serverError } from "../http";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    return json(await getProfile(user.sub));
  } catch (e) {
    return serverError(e);
  }
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
    await putProfile(user.sub, body as Profile);
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}
