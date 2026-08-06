"use client";

// Session sidebar (task 3.3): list from GET /api/sessions grouped by recency,
// "New Conversation" mints a client-side UUID, selecting a session loads it.

import { useChatShell } from "@/src/components/chat/chat-shell-context";
import { Icon } from "@/src/components/icons";
import type { SessionSummary } from "@/src/lib/api-types";
import { SESSION_GROUP_ORDER, sessionGroup, type SessionGroup } from "@/src/lib/format";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

function groupSessions(sessions: SessionSummary[]): Array<[SessionGroup, SessionSummary[]]> {
  const buckets = new Map<SessionGroup, SessionSummary[]>();
  for (const session of sessions) {
    const group = sessionGroup(session.updatedAt);
    const list = buckets.get(group);
    if (list) list.push(session);
    else buckets.set(group, [session]);
  }
  return SESSION_GROUP_ORDER.filter((g) => buckets.has(g)).map((g) => [g, buckets.get(g) ?? []]);
}

export function SessionSidebar() {
  const router = useRouter();
  const params = useParams<{ session_id?: string }>();
  const { sessions, sessionsLoading, sessionsError, refreshSessions, setSidebarOpen } = useChatShell();
  const activeId = params.session_id;

  const grouped = useMemo(() => groupSessions(sessions), [sessions]);

  function openSession(id: string) {
    setSidebarOpen(false);
    router.push(`/chat/${id}`);
  }

  function newConversation() {
    setSidebarOpen(false);
    router.push(`/chat/${crypto.randomUUID()}`);
  }

  return (
    <div className="flex h-full w-70 flex-col border-r border-border-subtle bg-surface-container-low">
      {/* Sidebar header */}
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon name="school" size={20} />
        </span>
        <span>
          <span className="block text-xl font-medium leading-tight text-primary">Sessions</span>
          <span className="block text-body-sm text-muted">AI Assistant</span>
        </span>
      </div>

      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={newConversation}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-on-primary shadow-glow transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.97] active:shadow-inset"
        >
          <Icon name="add" size={18} />
          New Conversation
        </button>
      </div>

      <nav aria-label="Chat sessions" className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {sessionsLoading && (
          <div className="flex flex-col gap-2 px-1 pt-2" role="status" aria-label="Loading sessions">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-container" />
            ))}
          </div>
        )}

        {!sessionsLoading && sessionsError && (
          <div className="px-2 pt-3 text-body-sm text-on-surface-variant">
            <p>Couldn&apos;t load your conversations.</p>
            <button
              type="button"
              onClick={refreshSessions}
              className="mt-2 flex h-8 items-center gap-1.5 rounded-lg bg-surface-container px-3 text-sm font-medium text-on-surface transition-colors duration-150 hover:bg-surface-container-high"
            >
              <Icon name="refresh2" size={14} />
              Try again
            </button>
          </div>
        )}

        {!sessionsLoading && !sessionsError && sessions.length === 0 && (
          <p className="px-2 pt-3 text-body-sm text-muted">
            No conversations yet. Start one and it will be saved here.
          </p>
        )}

        {!sessionsLoading &&
          !sessionsError &&
          grouped.map(([group, items]) => (
            <div key={group} className="pt-3">
              <h3 className="px-2 pb-1 text-xs font-medium uppercase tracking-[0.05em] text-muted">{group}</h3>
              <ul className="flex flex-col gap-0.5">
                {items.map((session) => {
                  const active = session.session_id === activeId;
                  return (
                    <li key={session.session_id}>
                      <button
                        type="button"
                        onClick={() => openSession(session.session_id)}
                        aria-current={active ? "true" : undefined}
                        title={session.title}
                        className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left transition-colors duration-150 ${
                          active
                            ? "bg-accent-subtle text-primary"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                        }`}
                      >
                        <Icon name="chat1" size={16} className="shrink-0" />
                        <span className="truncate text-sm">{session.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </nav>
    </div>
  );
}
