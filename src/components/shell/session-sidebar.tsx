"use client";

// Session sidebar: list from GET /api/sessions grouped by recency,
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

interface SessionSidebarProps {
  onCollapse?: () => void;
}

export function SessionSidebar({ onCollapse }: SessionSidebarProps = {}) {
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
    <div className="glass-neu-inset flex h-full w-full flex-col overflow-hidden rounded-2xl border p-2">
      <div className="flex items-center gap-3 px-2 pt-2 pb-4">
        <span className="bg-surface text-primary border-border-subtle flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <Icon name="school" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-on-surface block text-lg leading-tight font-medium tracking-[-0.02em]">Sessions</span>
          <span className="text-body-sm text-muted block truncate">Your conversation history</span>
        </span>
        {onCollapse && (
          <button
            id="desktop-session-collapse"
            type="button"
            onClick={onCollapse}
            aria-label="Collapse session history"
            title="Collapse sessions"
            className="glass-neu-compact text-on-surface-variant hover:text-primary border-border-subtle flex size-9 shrink-0 items-center justify-center rounded-xl border"
          >
            <Icon name="left" size={18} />
          </button>
        )}
      </div>

      <div className="pb-3">
        <button
          type="button"
          onClick={newConversation}
          className="neu-primary-button bg-primary text-on-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium"
        >
          <Icon name="add" size={18} />
          New conversation
        </button>
      </div>

      <nav
        aria-label="Chat sessions"
        className="bg-surface-container-low/60 border-border-subtle min-h-0 flex-1 overflow-y-auto rounded-xl border p-2"
      >
        {sessionsLoading && (
          <div className="flex flex-col gap-2" role="status" aria-label="Loading sessions">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {!sessionsLoading && sessionsError && (
          <div className="text-body-sm text-on-surface-variant px-1 py-2">
            <p>Couldn&apos;t load your conversations.</p>
            <button
              type="button"
              onClick={refreshSessions}
              className="neu-button bg-surface text-on-surface mt-3 flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium"
            >
              <Icon name="refresh2" size={14} />
              Try again
            </button>
          </div>
        )}

        {!sessionsLoading && !sessionsError && sessions.length === 0 && (
          <p className="text-body-sm text-muted px-2 py-3">
            No conversations yet. Start one and it will be saved here.
          </p>
        )}

        {!sessionsLoading &&
          !sessionsError &&
          grouped.map(([group, items]) => (
            <div key={group} className="pt-2 first:pt-0">
              <h3 className="text-muted px-2 pb-1.5 text-xs font-medium tracking-[0.05em] uppercase">{group}</h3>
              <ul className="flex flex-col gap-1">
                {items.map((session) => {
                  const active = session.session_id === activeId;
                  return (
                    <li key={session.session_id}>
                      <button
                        type="button"
                        onClick={() => openSession(session.session_id)}
                        aria-current={active ? "page" : undefined}
                        title={session.title}
                        className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
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
