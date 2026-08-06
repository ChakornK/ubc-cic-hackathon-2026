"use client";

// Chat panel (task 3.1): history load, optimistic send with in-flight lock,
// error banner with retry resending the same message, inline iteration warning,
// and highlight publication for the map via the walking_distance renderer.
import { ChatInput, type ChatInputHandle } from "@/src/components/chat/chat-input";
import { useChatShell } from "@/src/components/chat/chat-shell-context";
import { AssistantMessage, TypingIndicator, UserMessage, type DisplayMessage } from "@/src/components/chat/message";
import { Icon } from "@/src/components/icons";
import { useApi } from "@/src/components/providers";
import { ApiError, type ChatMessage } from "@/src/lib/api-types";
import { extractWalkingHighlight } from "@/src/lib/walking";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type HistoryState = "loading" | "ready" | "failed";

const SUGGESTIONS = [
  "How long is the walk from IKB to ICCS?",
  "Find 3-credit CPSC courses with no prerequisites",
  "What's tuition per credit for international Science students?",
];

let messageSeq = 0;
function nextId(): string {
  messageSeq += 1;
  return `m${messageSeq}`;
}

function toConversation(messages: DisplayMessage[]): ChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

export function ChatPanel({ sessionId }: { sessionId: string }) {
  const api = useApi();
  const router = useRouter();
  const { setHighlight, sessions, refreshSessions } = useChatShell();

  const [historyState, setHistoryState] = useState<HistoryState>("loading");
  const [historyNonce, setHistoryNonce] = useState(0);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [slowResponse, setSlowResponse] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const inputRef = useRef<ChatInputHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingRetry = useRef<{ conversation: ChatMessage[] } | null>(null);

  // The panel is remounted per session; a response landing after unmount must
  // not touch shared shell state (map highlight, session list) for the session
  // the user switched to.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sessionTitle = useMemo(() => {
    const summary = sessions.find((s) => s.session_id === sessionId);
    if (summary) return summary.title;
    const firstUser = messages.find((m) => m.role === "user");
    return firstUser ? firstUser.content : "New conversation";
  }, [sessions, sessionId, messages]);

  // Fresh session context: clear any route from a previous session, load history.
  // historyNonce re-runs the load for the failed-state "Try again" button.
  useEffect(() => {
    void historyNonce;
    setHighlight(null);
    let cancelled = false;
    setHistoryState("loading");
    api
      .getSession(sessionId)
      .then((history) => {
        if (cancelled) return;
        setMessages(history.map((m) => ({ id: nextId(), role: m.role, content: m.content })));
        setHistoryState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          // Not found = a brand-new session id; start empty.
          setMessages([]);
          setHistoryState("ready");
        } else {
          setHistoryState("failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [api, sessionId, setHighlight, historyNonce]);

  // Keep the newest message in view as the conversation and typing state change.
  const messageCount = messages.length;
  useEffect(() => {
    void messageCount;
    void sending;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messageCount, sending]);

  // Focus the input when the conversation is ready and after each response.
  useEffect(() => {
    if (historyState === "ready" && !sending) inputRef.current?.focus();
  }, [historyState, sending]);

  // Honest expectations: flag responses that pass 8 s (multi-tool calls run 10–30 s).
  useEffect(() => {
    if (!sending) {
      setSlowResponse(false);
      return;
    }
    const timer = setTimeout(() => setSlowResponse(true), 8000);
    return () => clearTimeout(timer);
  }, [sending]);

  const runExchange = useCallback(
    (conversation: ChatMessage[]) => {
      setSending(true);
      setSendError(null);
      api
        .chat(sessionId, conversation)
        .then((response) => {
          if (!alive.current) return;
          pendingRetry.current = null;
          setMessages((current) => [
            ...current,
            {
              id: nextId(),
              role: "assistant",
              content: response.message,
              toolCalls: response.tool_calls,
              warning: response.warning,
            },
          ]);
          // The walking_distance renderer emits the new highlight; if the latest
          // response has none, the previous route no longer reflects the answer.
          if (!response.tool_calls.some((call) => extractWalkingHighlight(call))) setHighlight(null);
          setAnnouncement("New response from assistant");
          refreshSessions();
        })
        .catch((error: unknown) => {
          if (!alive.current) return;
          pendingRetry.current = { conversation };
          const message =
            error instanceof ApiError && error.status !== 500
              ? error.message
              : "Couldn't get a response. Please try again.";
          setSendError(message);
          setAnnouncement(`Error: ${message}`);
        })
        .finally(() => {
          if (alive.current) setSending(false);
        });
    },
    [api, sessionId, setHighlight, refreshSessions],
  );

  const send = useCallback(
    (text: string) => {
      if (sending) return;
      const userMessage: DisplayMessage = { id: nextId(), role: "user", content: text };
      const conversation = toConversation([...messagesRef.current, userMessage]);
      setMessages((current) => [...current, userMessage]);
      setAnnouncement("Message sent");
      runExchange(conversation);
    },
    [sending, runExchange],
  );

  const retry = useCallback(() => {
    const pending = pendingRetry.current;
    if (pending) runExchange(pending.conversation);
  }, [runExchange]);

  const latestAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  return (
    <section
      aria-label="Conversation"
      className="neu-panel glass-neu-strong bg-surface flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border"
    >
      <div className="border-border-subtle flex shrink-0 items-center justify-between border-b bg-transparent px-4 py-3.5">
        <div className="min-w-0">
          <h1 className="text-on-surface truncate text-base font-medium tracking-[-0.01em]">{sessionTitle}</h1>
          <p className="text-body-sm text-muted mt-0.5">Grounded in UBC data</p>
        </div>
        <span className="neu-inset bg-surface-container-low text-on-surface-variant ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
          <span className="bg-secondary size-1.5 rounded-full" aria-hidden="true" />
          Active
        </span>
      </div>

      <div ref={scrollRef} className="chat-message-well min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {historyState === "loading" && (
          <output aria-label="Loading conversation" className="flex flex-col gap-5">
            <div className="neu-inset bg-surface-container h-12 w-3/5 animate-pulse self-end rounded-[16px_16px_5px_16px]" />
            <div className="neu-inset bg-surface-container h-20 w-4/5 animate-pulse rounded-[16px_16px_16px_5px]" />
          </output>
        )}

        {historyState === "failed" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <span className="neu-raised bg-surface text-error flex size-16 items-center justify-center rounded-2xl border">
              <Icon name="alert" size={30} />
            </span>
            <div>
              <p className="text-on-surface text-xl font-medium">Couldn&apos;t load this conversation</p>
              <p className="text-on-surface-variant mt-1 text-sm">Try again, or start with a fresh chat.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setHistoryNonce((n) => n + 1)}
                className="neu-button bg-surface text-on-surface flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-medium"
              >
                <Icon name="refresh2" size={16} />
                Try again
              </button>
              <button
                type="button"
                onClick={() => router.push(`/chat/${crypto.randomUUID()}`)}
                className="neu-primary-button bg-primary text-on-primary flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-medium"
              >
                Start new chat
              </button>
            </div>
          </div>
        )}

        {historyState === "ready" && messages.length === 0 && !sending && (
          <div className="flex h-full flex-col items-center justify-center px-3 text-center sm:px-6">
            <span className="neu-raised bg-surface text-primary flex size-16 items-center justify-center rounded-2xl border">
              <Icon name="chat1" size={30} />
            </span>
            <h2 className="text-on-surface mt-6 text-2xl font-medium tracking-[-0.025em]">Ask me about UBC</h2>
            <p className="text-on-surface-variant mt-2 max-w-80 text-sm leading-relaxed">
              I can help with courses, prerequisites, tuition costs, and walking routes between campus buildings.
            </p>
            <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="neu-button bg-surface text-primary rounded-xl px-3.5 py-2 text-left text-xs font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {historyState === "ready" && messages.length > 0 && (
          <div role="log" aria-label="Conversation" aria-live="polite" className="flex flex-col gap-6">
            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} isLatest={message.id === latestAssistantId} />
              ),
            )}
            {sending && <TypingIndicator slow={slowResponse} />}
            {sendError && (
              <div className="neu-raised border-error/30 bg-error-container/40 flex flex-col items-start justify-between gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center">
                <p className="text-on-surface flex items-center gap-2 text-sm">
                  <Icon name="alert" size={16} className="text-error shrink-0" />
                  {sendError}
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="neu-button bg-surface text-on-surface flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium"
                >
                  <Icon name="refresh2" size={14} />
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>

      <ChatInput ref={inputRef} disabled={sending || historyState !== "ready"} thinking={sending} onSend={send} />
    </section>
  );
}
