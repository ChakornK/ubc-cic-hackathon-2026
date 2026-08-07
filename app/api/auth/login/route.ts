import { signToken } from "@/src/server/auth";
import { getUserByUsername } from "@/src/server/sessions/store";
import bcrypt from "bcryptjs";
import { json, serverError } from "../../http";

export async function POST(request: Request): Promise<Response> {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return json({ error: "Username and password required" }, 400);

    const user = await getUserByUsername(username);
    if (!user) return json({ error: "Invalid credentials" }, 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return json({ error: "Invalid credentials" }, 401);

    const token = await signToken(user.id, username);
    return json({ token, userId: user.id, username });
  } catch (e) {
    return serverError(e);
  }
}
