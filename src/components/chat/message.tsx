"use client";

// Message bubbles per DESIGN.md: user right-aligned on Accent Subtle; assistant
// left-aligned on Surface with avatar row, inline warning, and tool-call views.
// Interstitial blocks (thinking + tool calls) render inline before the final text.
import { ToolCallsView } from "@/src/components/chat/tool-renderers";
import { Icon } from "@/src/components/icons";
import type { ToolCall } from "@/src/lib/api-types";
import { useState } from "react";

export interface InterstitialBlock {
  type: "thinking" | "tool_call";
  /** For thinking: the accumulated thinking text. For tool_call: the tool name. */
  content: string;
  /** For tool_call: the input params. */
  input?: Record<string, unknown>;
  /** For tool_call: the result (set when tool completes). */
  result?: unknown;
}

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  warning?: string;
  /** Interstitial blocks shown before the final answer (thinking + tool calls). */
  interstitial?: InterstitialBlock[];
}

export function UserMessage({ message }: { message: DisplayMessage }) {
  return (
    <div className="animate-message-in flex flex-col items-end">
      <div className="bg-accent-subtle text-on-surface max-w-[80%] rounded-[16px_16px_4px_16px] px-4 py-3 text-sm whitespace-pre-wrap">
        {message.content}
      </div>
      <span className="text-muted mt-1 text-xs">You</span>
    </div>
  );
}

function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-border-subtle bg-surface-container-low mb-2 rounded-lg border"
    >
      <summary className="text-muted flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium select-none">
        <Icon name="bling" size={14} className="text-outline shrink-0" />
        <span>Thinking…</span>
        <Icon name="down" size={12} className="ml-auto transition-transform group-open:rotate-180" />
      </summary>
      {open && (
        <div className="border-border-subtle border-t px-3 py-2">
          <p className="text-muted text-xs leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </details>
  );
}

function ToolCallBlock({ name, input, result }: { name: string; input?: Record<string, unknown>; result?: unknown }) {
  const [open, setOpen] = useState(false);
  const isLoading = result === undefined;
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-border-subtle bg-surface-container-low mb-2 rounded-lg border"
    >
      <summary className="text-on-surface-variant flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium select-none">
        <Icon name="search" size={14} className="text-primary shrink-0" />
        <span className="font-mono">{name}</span>
        {input && Object.keys(input).length > 0 && (
          <span className="text-muted">
            (
            {Object.entries(input)
              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
              .join(", ")}
            )
          </span>
        )}
        {isLoading && (
          <span className="border-primary ml-auto size-3 animate-spin rounded-full border-2 border-t-transparent" />
        )}
        {!isLoading && <Icon name="down" size={12} className="ml-auto transition-transform group-open:rotate-180" />}
      </summary>
      {open && result !== undefined && (
        <div className="border-border-subtle border-t px-3 py-2">
          <pre className="text-muted max-h-40 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </details>
  );
}

export function AssistantMessage({ message, isLatest }: { message: DisplayMessage; isLatest: boolean }) {
  const tools = message.toolCalls ?? [];
  const interstitial = message.interstitial ?? [];
  return (
    <div className="animate-message-in">
      <div className="mb-2 flex items-center gap-2">
        <span className="bg-primary-container text-on-primary-container flex size-6 items-center justify-center rounded-full text-[11px] font-semibold">
          U
        </span>
        <span className="text-muted text-xs">UBC Assistant</span>
      </div>
      <div className="border-border-subtle bg-surface max-w-[85%] rounded-[16px_16px_16px_4px] border px-4 py-3">
        {message.warning && (
          <div className="bg-tertiary-container text-body-sm text-on-tertiary-container mb-3 flex items-start gap-2 rounded-lg px-3 py-2">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            <span>{message.warning}</span>
          </div>
        )}
        {interstitial.length > 0 && (
          <div className="mb-3">
            {interstitial.map((block) =>
              block.type === "thinking" ? (
                <ThinkingBlock key={`t-${block.content.slice(0, 20)}`} content={block.content} />
              ) : (
                <ToolCallBlock
                  key={`tc-${block.content}-${JSON.stringify(block.input).slice(0, 30)}`}
                  name={block.content}
                  input={block.input}
                  result={block.result}
                />
              ),
            )}
          </div>
        )}
        {message.content && (
          <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
        {!interstitial.length && <ToolCallsView calls={tools} isLatest={isLatest} />}
      </div>
    </div>
  );
}

export function TypingIndicator({ slow }: { slow: boolean }) {
  return (
    <div role="status" aria-label="Waiting for the assistant's response">
      <div className="mb-2 flex items-center gap-2">
        <span className="bg-primary-container text-on-primary-container flex size-6 items-center justify-center rounded-full text-[11px] font-semibold">
          U
        </span>
        <span className="text-muted text-xs">UBC Assistant</span>
      </div>
      <div className="border-border-subtle bg-surface inline-flex min-w-15 items-center gap-1.5 rounded-[16px_16px_16px_4px] border px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-on-surface-variant size-1.5 rounded-full"
            style={{ animation: `typing-dot 900ms ease-in-out ${i * 150}ms infinite` }}
          />
        ))}
      </div>
      {slow && <p className="text-muted mt-2 text-xs">Still working — multi-tool answers can take up to 30 seconds.</p>}
    </div>
  );
}
