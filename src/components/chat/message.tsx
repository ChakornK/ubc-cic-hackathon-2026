"use client";

// Tactile message surfaces: user messages stay literal, while assistant
// responses render safe GitHub-flavored Markdown without allowing raw HTML.
import { ToolCallsView } from "@/src/components/chat/tool-renderers";
import { Icon } from "@/src/components/icons";
import type { ToolCall } from "@/src/lib/api-types";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  warning?: string;
}

const markdownComponents: Components = {
  a: ({ href, title, children }) => {
    const opensNewTab = typeof href === "string" && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        title={title}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noreferrer" : undefined}
      >
        {children}
        {opensNewTab && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
  img: ({ alt }) => <span className="markdown-image-alt">{alt ? `[Image: ${alt}]` : "[Image omitted]"}</span>,
  table: ({ children }) => (
    <div className="markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
};

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="assistant-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}

export function UserMessage({ message }: { message: DisplayMessage }) {
  return (
    <div className="animate-message-in flex flex-col items-end">
      <div className="neu-raised bg-accent-subtle text-on-surface max-w-[90%] rounded-[16px_16px_5px_16px] border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[80%]">
        {message.content}
      </div>
      <span className="text-muted mt-1.5 px-1 text-xs">You</span>
    </div>
  );
}

export function AssistantMessage({ message, isLatest }: { message: DisplayMessage; isLatest: boolean }) {
  const tools = message.toolCalls ?? [];
  return (
    <div className="animate-message-in">
      <div className="mb-2 flex items-center gap-2">
        <span className="neu-raised bg-primary-container text-on-primary-container flex size-7 items-center justify-center rounded-lg border text-[11px] font-semibold">
          U
        </span>
        <span className="text-muted text-xs font-medium">UBC Assistant</span>
      </div>
      <div className="neu-raised bg-surface max-w-[94%] rounded-[16px_16px_16px_5px] border px-4 py-3.5 sm:max-w-[88%]">
        {message.warning && (
          <div className="neu-inset bg-tertiary-container text-body-sm text-on-tertiary-container mb-3 flex items-start gap-2 rounded-xl border px-3 py-2">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            <span>{message.warning}</span>
          </div>
        )}
        <AssistantMarkdown content={message.content} />
        <ToolCallsView calls={tools} isLatest={isLatest} />
      </div>
    </div>
  );
}

export function TypingIndicator({ slow }: { slow: boolean }) {
  return (
    <div role="status" aria-label="The assistant is thinking">
      <div className="mb-2 flex items-center gap-2">
        <span className="neu-raised bg-primary-container text-on-primary-container flex size-7 items-center justify-center rounded-lg border text-[11px] font-semibold">
          U
        </span>
        <span className="text-muted text-xs font-medium">UBC Assistant</span>
      </div>
      <div className="neu-raised bg-surface inline-flex items-center gap-3 rounded-[16px_16px_16px_5px] border px-3.5 py-3">
        <span className="thinking-orb" aria-hidden="true" />
        <span className="text-on-surface text-sm font-medium">{slow ? "Still working" : "Thinking"}</span>
      </div>
      {slow && <p className="text-muted mt-2 text-xs">Working across data sources — this can take up to 30 seconds.</p>}
    </div>
  );
}
