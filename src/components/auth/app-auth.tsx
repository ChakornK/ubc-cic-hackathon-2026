"use client";

// One auth surface for the whole app: `useAppAuth()`.
//
// Real mode bridges react-oidc-context against the Cognito hosted UI (Google IdP);
// mock mode (NEXT_PUBLIC_API_MOCK=1) signs in instantly with a demo user so every
// flow works without deployed infrastructure. The bridge only mounts in the
// browser — during SSR the context reports "initializing".

import { isMockMode } from "@/src/lib/api";
import { MOCK_AUTH_STORAGE_KEY, readCognitoConfig } from "@/src/lib/auth-config";
import { WebStorageStateStore, type User } from "oidc-client-ts";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";

export type AppAuthStatus = "initializing" | "signedOut" | "signedIn";

export interface AppAuthUser {
  email?: string;
  name?: string;
}

export interface AppAuth {
  status: AppAuthStatus;
  user: AppAuthUser | null;
  /** False when real mode is missing NEXT_PUBLIC_COGNITO_* config. */
  configured: boolean;
  signIn: () => void;
  signOut: () => void;
  /** Cognito ID token for the Authorization header, or null when signed out. */
  getToken: () => Promise<string | null>;
}

const INITIALIZING: AppAuth = {
  status: "initializing",
  user: null,
  configured: true,
  signIn: () => {},
  signOut: () => {},
  getToken: async () => null,
};

const AppAuthContext = createContext<AppAuth>(INITIALIZING);

export function useAppAuth(): AppAuth {
  return useContext(AppAuthContext);
}

// ---- Mock bridge ----

interface MockStoredUser {
  email: string;
  name: string;
}

function readMockUser(): MockStoredUser | null {
  try {
    const raw = window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockStoredUser) : null;
  } catch {
    return null;
  }
}

function MockAuthBridge({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockStoredUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(readMockUser());
  }, []);

  // State-only: navigation stays with the UI layer (Landing redirects signed-in
  // users to /chat; RequireAuth sends signed-out users home). Mixing a hard
  // location.assign here with router navigations races the two systems.
  const signIn = useCallback(() => {
    const demoUser: MockStoredUser = { email: "student@student.ubc.ca", name: "Demo Student" };
    try {
      window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // Session still works in memory.
    }
    setUser(demoUser);
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    } catch {
      // Ignore.
    }
    setUser(null);
  }, []);

  const userRef = useRef(user);
  userRef.current = user;
  const getToken = useCallback(async () => (userRef.current ? "mock-id-token" : null), []);

  const value = useMemo<AppAuth>(
    () => ({
      status: user === undefined ? "initializing" : user ? "signedIn" : "signedOut",
      user: user ?? null,
      configured: true,
      signIn,
      signOut,
      getToken,
    }),
    [user, signIn, signOut, getToken],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

// ---- Cognito bridge (react-oidc-context) ----

function stripCallbackParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function CognitoAdapter({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const config = readCognitoConfig();

  const userRef = useRef<User | null>(null);
  userRef.current = auth.user ?? null;

  const getToken = useCallback(async () => {
    const user = userRef.current;
    if (user && !user.expired) return user.id_token ?? null;
    // Expired mid-session (e.g. laptop slept past renewal): try one silent
    // refresh before surfacing a 401 → full sign-in redirect.
    try {
      const renewed = await auth.signinSilent();
      return renewed?.id_token ?? null;
    } catch {
      return null;
    }
  }, [auth]);

  const signIn = useCallback(() => {
    void auth.signinRedirect(
      config?.identityProvider ? { extraQueryParams: { identity_provider: config.identityProvider } } : undefined,
    );
  }, [auth, config?.identityProvider]);

  const signOut = useCallback(() => {
    void auth.removeUser().then(() => {
      if (config?.domain) {
        const logout = new URL("/logout", config.domain);
        logout.searchParams.set("client_id", config.clientId);
        logout.searchParams.set("logout_uri", `${window.location.origin}/`);
        window.location.assign(logout.toString());
      } else {
        window.location.assign("/");
      }
    });
  }, [auth, config?.domain, config?.clientId]);

  const status: AppAuthStatus = auth.isLoading ? "initializing" : auth.isAuthenticated ? "signedIn" : "signedOut";

  const value = useMemo<AppAuth>(
    () => ({
      status,
      user: auth.user
        ? { email: auth.user.profile.email ?? undefined, name: (auth.user.profile.name as string | undefined) ?? undefined }
        : null,
      configured: true,
      signIn,
      signOut,
      getToken,
    }),
    [status, auth.user, signIn, signOut, getToken],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function CognitoAuthBridge({ children }: { children: ReactNode }) {
  const config = readCognitoConfig();

  if (!config) {
    return <UnconfiguredBridge>{children}</UnconfiguredBridge>;
  }

  return (
    <AuthProvider
      authority={config.authority}
      client_id={config.clientId}
      redirect_uri={`${window.location.origin}/chat`}
      post_logout_redirect_uri={`${window.location.origin}/`}
      response_type="code"
      scope="openid email profile"
      loadUserInfo={false}
      automaticSilentRenew
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={stripCallbackParams}
    >
      <CognitoAdapter>{children}</CognitoAdapter>
    </AuthProvider>
  );
}

function UnconfiguredBridge({ children }: { children: ReactNode }) {
  const value = useMemo<AppAuth>(
    () => ({
      status: "signedOut",
      user: null,
      configured: false,
      signIn: () => {},
      signOut: () => {},
      getToken: async () => null,
    }),
    [],
  );
  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

/** Mounts the appropriate bridge in the browser; reports "initializing" during SSR. */
export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <AppAuthContext.Provider value={INITIALIZING}>{children}</AppAuthContext.Provider>;
  }
  if (isMockMode()) {
    return <MockAuthBridge>{children}</MockAuthBridge>;
  }
  return <CognitoAuthBridge>{children}</CognitoAuthBridge>;
}
