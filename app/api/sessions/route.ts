import { requireUser } from "@/src/server/auth";
import { listSessions } from "@/src/server/sessions/store";
import { json, serverError } from "../http";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    return json(await listSessions(user.sub));
  } catch (e) {
    return serverError(e);
  }
}
