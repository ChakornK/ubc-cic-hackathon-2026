// Cognito hosted-UI (Google IdP) OIDC settings, read from build-time env:
//
//   NEXT_PUBLIC_COGNITO_AUTHORITY  e.g. https://cognito-idp.us-west-2.amazonaws.com/us-west-2_AbC123
//   NEXT_PUBLIC_COGNITO_CLIENT_ID  the user-pool app client id
//   NEXT_PUBLIC_COGNITO_DOMAIN     hosted-UI domain, for /logout (optional)
//   NEXT_PUBLIC_COGNITO_IDP        identity provider name (default "Google")
//   NEXT_PUBLIC_API_MOCK=1         skip Cognito entirely; mock auth + mock API
//
// The Cognito app client must allow `${origin}/chat` as a callback URL and
// `${origin}/` as a sign-out URL.

export interface CognitoConfig {
  authority: string;
  clientId: string;
  domain?: string;
  identityProvider: string;
}

export function readCognitoConfig(): CognitoConfig | null {
  const authority = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  if (!authority || !clientId) return null;
  return {
    authority,
    clientId,
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || undefined,
    identityProvider: process.env.NEXT_PUBLIC_COGNITO_IDP || "Google",
  };
}

/** Where oidc-client-ts persists the signed-in user (localStorage). */
export function oidcUserStorageKey(config: CognitoConfig): string {
  return `oidc.user:${config.authority}:${config.clientId}`;
}

export const MOCK_AUTH_STORAGE_KEY = "campus.mock.auth.v1";

/**
 * Key checked by the landing page's pre-paint script to skip straight to /chat
 * for returning users ("no flash of landing page").
 */
export function storedUserKey(): string | null {
  if (process.env.NEXT_PUBLIC_API_MOCK === "1") return MOCK_AUTH_STORAGE_KEY;
  const config = readCognitoConfig();
  return config ? oidcUserStorageKey(config) : null;
}
