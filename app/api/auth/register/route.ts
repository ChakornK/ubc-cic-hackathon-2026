import { signToken } from "@/src/server/auth";
import { createUser, getUserByUsername } from "@/src/server/sessions/store";
import bcrypt from "bcryptjs";
import { json, serverError } from "../../http";

export async function POST(request: Request): Promise<Response> {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return json({ error: "Username and password required" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

    const existing = await getUserByUsername(username);
    if (existing) return json({ error: "Username already taken" }, 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser(username, passwordHash);
    const token = await signToken(userId, username);

    return json({ token, userId, username }, 201);
  } catch (e) {
    return serverError(e);
  }
}
