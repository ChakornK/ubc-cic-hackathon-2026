"use client";

// Message bubbles per DESIGN.md: user right-aligned on Accent Subtle; assistant
// left-aligned on Surface with avatar row, inline warning, and tool-call views.

import { ToolCallsView } from "@/src/components/chat/tool-renderers";
import { Icon } from "@/src/components/icons";
import type { ToolCall } from "@/src/lib/api-types";

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  warning?: string;
}

export function UserMessage({ message }: { message: DisplayMessage }) {
  return (
    <div className="animate-message-in flex flex-col items-end">
      <div className="max-w-[80%] whitespace-pre-wrap rounded-[16px_16px_4px_16px] bg-accent-subtle px-4 py-3 text-sm text-on-surface">
        {message.content}
      </div>
      <span className="mt-1 text-xs text-muted">You</span>
    </div>
  );
}

export function AssistantMessage({ message, isLatest }: { message: DisplayMessage; isLatest: boolean }) {
  const tools = message.toolCalls ?? [];
  return (
    <div className="animate-message-in">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-container text-[11px] font-semibold text-on-primary-container">
          U
        </span>
        <span className="text-xs text-muted">UBC Assistant</span>
      </div>
      <div className="max-w-[85%] rounded-[16px_16px_16px_4px] border border-border-subtle bg-surface px-4 py-3">
        {message.warning && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-tertiary-container px-3 py-2 text-body-sm text-on-tertiary-container">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            <span>{message.warning}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">{message.content}</p>
        <ToolCallsView calls={tools} isLatest={isLatest} />
      </div>
    </div>
  );
}

export function TypingIndicator({ slow }: { slow: boolean }) {
  return (
    <div role="status" aria-label="Waiting for the assistant's response">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-container text-[11px] font-semibold text-on-primary-container">
          U
        </span>
        <span className="text-xs text-muted">UBC Assistant</span>
      </div>
      <div className="inline-flex min-w-15 items-center gap-1.5 rounded-[16px_16px_16px_4px] border border-border-subtle bg-surface px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-on-surface-variant"
            style={{ animation: `typing-dot 900ms ease-in-out ${i * 150}ms infinite` }}
          />
        ))}
      </div>
      {slow && (
        <p className="mt-2 text-xs text-muted">Still working — multi-tool answers can take up to 30 seconds.</p>
      )}
    </div>
  );
}
