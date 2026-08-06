import { CognitoJwtVerifier } from "aws-jwt-verify";

export interface AuthedUser {
  sub: string;
  email?: string;
}

let verifier: { verify(token: string): Promise<{ sub: string; email?: unknown }> } | undefined;

const unauthorized = (error: string) =>
  new Response(JSON.stringify({ error }), { status: 401, headers: { "content-type": "application/json" } });

/** Verifies the bearer ID token (issuer/audience/expiry, JWKS cached across
 *  warm invocations) and returns the claims, or a 401 Response (1.2, 1.3). */
export async function requireUser(request: Request): Promise<AuthedUser | Response> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return unauthorized("Missing bearer token");
  try {
    verifier ??= CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      tokenUse: "id",
    });
    const claims = await verifier.verify(token);
    return { sub: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined };
  } catch {
    return unauthorized("Invalid or expired token");
  }
}
