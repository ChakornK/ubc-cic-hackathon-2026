// Typed client for the /api/* contract (api-spec.md). `createChatApi` returns the
// HTTP implementation, or the in-memory mock when NEXT_PUBLIC_API_MOCK=1 so all UI
// work runs without a deployed backend. GeoJSON responses are cached client-side
// after the first fetch.

import {
  ApiError,
  type ChatMessage,
  type ChatResponse,
  type GeoName,
  type Profile,
  type SessionSummary,
} from "@/src/lib/api-types";
import { createMockApi } from "@/src/lib/mock/mock-api";
import type { FeatureCollection } from "geojson";

export interface ChatApi {
  /** POST /api/chat — one exchange; `messages` is the full conversation so far. */
  chat(sessionId: string, messages: ChatMessage[]): Promise<ChatResponse>;
  /** GET /api/sessions — caller's sessions, most recently updated first. */
  listSessions(): Promise<SessionSummary[]>;
  /** GET /api/sessions/{id} — messages in chronological order; 404 if not the caller's. */
  getSession(id: string): Promise<ChatMessage[]>;
  /** GET /api/profile */
  getProfile(): Promise<Profile>;
  /** PUT /api/profile */
  putProfile(profile: Profile): Promise<void>;
  /** GET /api/geo/{name} — GeoJSON FeatureCollection. */
  getGeo(name: GeoName): Promise<FeatureCollection>;
}

export interface ChatApiOptions {
  /** Returns the Cognito ID token, or null when signed out. */
  getToken: () => Promise<string | null>;
  /** Called once per 401 so the app can redirect to sign-in. */
  onUnauthorized?: () => void;
  baseUrl?: string;
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCK === "1";
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  try {
    const body = (await response.json()) as { error?: string };
    if (typeof body.error === "string" && body.error) message = body.error;
  } catch {
    // Non-JSON error body; keep the status message.
  }
  return new ApiError(response.status, message);
}

function createHttpApi({ getToken, onUnauthorized, baseUrl = "/api" }: ChatApiOptions): ChatApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    if (!token) {
      onUnauthorized?.();
      throw new ApiError(401, "Not signed in");
    }
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const error = await parseError(response);
      if (error.status === 401) onUnauthorized?.();
      throw error;
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    chat: (sessionId, messages) =>
      request<ChatResponse>("/chat", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, messages }),
      }),
    listSessions: () => request<SessionSummary[]>("/sessions"),
    getSession: (id) => request<ChatMessage[]>(`/sessions/${encodeURIComponent(id)}`),
    getProfile: () => request<Profile>("/profile"),
    putProfile: (profile) => request<void>("/profile", { method: "PUT", body: JSON.stringify(profile) }),
    getGeo: (name) => request<FeatureCollection>(`/geo/${name}`),
  };
}

/** Memoizes `getGeo` per dataset; a failed fetch is evicted so it can be retried. */
export function withGeoCache(api: ChatApi): ChatApi {
  const cache = new Map<GeoName, Promise<FeatureCollection>>();
  return {
    ...api,
    getGeo(name) {
      const hit = cache.get(name);
      if (hit) return hit;
      const pending = api.getGeo(name).catch((error) => {
        cache.delete(name);
        throw error;
      });
      cache.set(name, pending);
      return pending;
    },
  };
}

export function createChatApi(options: ChatApiOptions): ChatApi {
  // NEXT_PUBLIC_API_MOCK is inlined at build time, so the unused branch
  // (mock fixtures included) is eliminated from production bundles.
  if (isMockMode()) {
    return withGeoCache(createMockApi({ getToken: options.getToken }));
  }
  return withGeoCache(createHttpApi(options));
}
