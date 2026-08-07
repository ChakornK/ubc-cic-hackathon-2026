"use client";

// Auth context for the whole app: `useAppAuth()`.
// Stores JWT in localStorage. Login/register call /api/auth/* endpoints.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const TOKEN_KEY = "reogent.auth.token";
const USER_KEY = "reogent.auth.user";

export type AppAuthStatus = "initializing" | "signedOut" | "signedIn";

export interface AppAuthUser {
  username: string;
  userId: string;
}

export interface AppAuth {
  status: AppAuthStatus;
  user: AppAuthUser | null;
  configured: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  register: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  getToken: () => Promise<string | null>;
}

const INITIALIZING: AppAuth = {
  status: "initializing",
  user: null,
  configured: true,
  signIn: async () => ({}),
  register: async () => ({}),
  signOut: () => {},
  getToken: async () => null,
};

const AppAuthContext = createContext<AppAuth>(INITIALIZING);

export function useAppAuth(): AppAuth {
  return useContext(AppAuthContext);
}

function loadStoredUser(): AppAuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppAuthUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(loadStoredUser());
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const body = await res.json();
    if (!res.ok) return { error: body.error ?? "Login failed" };
    localStorage.setItem(TOKEN_KEY, body.token);
    const authUser: AppAuthUser = { username: body.username, userId: body.userId };
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return {};
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const body = await res.json();
    if (!res.ok) return { error: body.error ?? "Registration failed" };
    localStorage.setItem(TOKEN_KEY, body.token);
    const authUser: AppAuthUser = { username: body.username, userId: body.userId };
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return {};
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(async () => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const value = useMemo<AppAuth>(
    () => ({
      status: user === undefined ? "initializing" : user ? "signedIn" : "signedOut",
      user: user ?? null,
      configured: true,
      signIn,
      register,
      signOut,
      getToken,
    }),
    [user, signIn, register, signOut, getToken],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}
