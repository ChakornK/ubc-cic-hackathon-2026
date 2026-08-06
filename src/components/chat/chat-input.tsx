"use client";

// The pill-shaped, recessed chat input. Enter sends; Shift+Enter adds a line;
// Cmd/Ctrl+Enter always sends. Submit is disabled while a request is in flight
// (responses can take 10–30 s) and while the input is empty.

import { Icon } from "@/src/components/icons";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";

export interface ChatInputHandle {
  focus: () => void;
}

interface ChatInputProps {
  disabled: boolean;
  onSend: (text: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({ disabled, onSend }, ref) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), []);

  const autosize = useCallback(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 96)}px`;
  }, []);

  const canSend = !disabled && value.trim().length > 0;

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    requestAnimationFrame(autosize);
    onSend(text);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter during IME composition commits the candidate, not the message.
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (event.metaKey || event.ctrlKey || !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border-subtle bg-surface-bright px-4 py-3">
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            autosize();
          }}
          onKeyDown={onKeyDown}
          placeholder="Ask about courses, campus, or academic rules…"
          aria-label="Message the assistant"
          className="block max-h-24 w-full resize-none rounded-3xl border border-border-subtle bg-surface-container-low py-2.5 pl-4 pr-12 text-sm text-on-surface shadow-inset outline-none transition-all duration-150 placeholder:text-muted focus:border-primary focus:bg-surface-bright focus:shadow-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="absolute bottom-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-primary text-on-primary transition-all duration-150 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon name="arrowUp" size={18} />
        </button>
      </form>
      <p className="mt-2 text-center text-xs text-muted">AI can make mistakes. Verify important information.</p>
    </div>
  );
});
