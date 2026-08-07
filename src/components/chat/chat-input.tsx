"use client";

// The recessed chat composer. Enter sends; Shift+Enter adds a line;
// Cmd/Ctrl+Enter always sends. Submit locks while a request is in flight.
import { Icon } from "@/src/components/icons";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";

export interface ChatInputHandle {
  focus: () => void;
}

interface ChatInputProps {
  disabled: boolean;
  thinking: boolean;
  onSend: (text: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  { disabled, thinking, onSend },
  ref,
) {
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
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (event.metaKey || event.ctrlKey || !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="shrink-0 bg-transparent px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4">
      <form
        data-thinking={thinking}
        aria-busy={thinking}
        className="chat-composer neu-inset bg-surface-container-low focus-within:border-primary border-border-subtle relative flex items-end rounded-2xl border p-1.5 transition-[border-color,box-shadow] duration-150"
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
          placeholder="Ask about courses, campus…"
          aria-label="Message the assistant"
          className="text-on-surface placeholder:text-muted relative z-10 block max-h-24 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="neu-primary-button bg-primary text-on-primary relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl disabled:pointer-events-none disabled:opacity-45 sm:size-9"
        >
          <Icon name="arrowUp" size={18} />
        </button>
      </form>
      <p className="text-muted mt-2 text-center text-xs">AI can make mistakes. Verify important information.</p>
    </div>
  );
});
