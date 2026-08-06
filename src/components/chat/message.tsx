"use client";

// Message bubbles per DESIGN.md: user right-aligned on Accent Subtle; assistant
// left-aligned on Surface with avatar row, inline warning, and tool-call views.
// Interstitial blocks (thinking + tool calls) render inline before the final text.
import { ToolCallsView } from "@/src/components/chat/tool-renderers";
import { Icon } from "@/src/components/icons";
import type { ToolCall } from "@/src/lib/api-types";
import type { InterstitialBlock } from "@/src/shared/types";
import { useState } from "react";

export type { InterstitialBlock };

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
  // Use the first sentence/line of thinking as the summary label
  const label = content.split(/[.\n]/)[0]?.trim().slice(0, 80) || "Thinking…";
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-border-subtle bg-surface-container-low mb-2 rounded-lg border"
    >
      <summary className="text-muted flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium select-none">
        <Icon name="bling" size={14} className="text-outline shrink-0" />
        <span className="truncate">{label}</span>
        <Icon name="down" size={12} className="ml-auto shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      {open && (
        <div className="border-border-subtle border-t px-3 py-2">
          <p className="text-muted text-xs leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </details>
  );
}

/** Humanize a tool call into a short readable label. */
function humanizeToolCall(name: string, input?: Record<string, unknown>): string {
  const q = input?.query as string | undefined;
  const slug = (key: string) => (input?.[key] as string | undefined) ?? "";
  switch (name) {
    case "search_courses":
      return q ? `Searched courses for "${q}"` : "Searched courses";
    case "get_course":
      return `Looking up ${slug("course_code") || "course"}`;
    case "get_tuition":
      return `Checking tuition for ${slug("program_slug") || "program"}`;
    case "walking_distance":
      return `Calculating walk from ${slug("from_building")} to ${slug("to_building")}`;
    case "find_building":
      return `Finding building ${slug("query") || slug("code") || ""}`.trim();
    case "search_programs":
      return q ? `Searched programs for "${q}"` : "Searched programs";
    case "get_admission_requirements":
      return `Checking admission requirements`;
    case "get_key_dates":
      return "Looking up key dates";
    case "get_cost_estimate":
      return `Estimating costs for ${slug("program_slug") || "program"}`;
    case "get_living_costs":
      return "Looking up living costs";
    case "search_student_fees":
      return q ? `Searched fees for "${q}"` : "Searched student fees";
    case "search_events":
      return q ? `Searched events for "${q}"` : "Searched events";
    case "search_ubc_pages":
      return q ? `Searched UBC pages for "${q}"` : "Searched UBC pages";
    case "find_parking":
      return "Finding parking";
    case "find_places":
      return q ? `Searched places for "${q}"` : "Searched places";
    case "search_study_spaces":
      return "Searching study spaces";
    case "find_free_rooms":
      return "Finding free rooms";
    case "get_room_schedule":
      return `Checking room schedule`;
    default:
      return name.replace(/_/g, " ");
  }
}

function ToolCallBlock({ name, input, result }: { name: string; input?: Record<string, unknown>; result?: unknown }) {
  const [open, setOpen] = useState(false);
  const isLoading = result === undefined;
  const label = humanizeToolCall(name, input);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-border-subtle bg-surface-container-low mb-2 rounded-lg border"
    >
      <summary className="text-on-surface-variant flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium select-none">
        <Icon name="search" size={14} className="text-primary shrink-0" />
        <span className="truncate">{label}</span>
        {isLoading && (
          <span className="border-primary ml-auto size-3 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
        )}
        {!isLoading && (
          <Icon name="down" size={12} className="ml-auto shrink-0 transition-transform group-open:rotate-180" />
        )}
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
            {interstitial.map((block, idx) =>
              block.type === "thinking" ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
                <ThinkingBlock key={`t-${idx}`} content={block.content} />
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
                <ToolCallBlock key={`tc-${idx}`} name={block.content} input={block.input} result={block.result} />
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
