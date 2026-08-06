import { requireUser } from "@/src/server/auth";
import { getSessionMessages } from "@/src/server/sessions/store";
import { json, serverError } from "../../http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const messages = await getSessionMessages(user.sub, id);
    // non-existent and non-owned are indistinguishable by design (5.4)
    if (messages === null) return json({ error: "Session not found" }, 404);
    return json(messages);
  } catch (e) {
    return serverError(e);
  }
}
