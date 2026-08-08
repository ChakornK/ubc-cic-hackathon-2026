"use client";

import Link from "next/link";

export default function ChatError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center px-4">
      <div
        role="alert"
        className="neu-panel bg-surface flex w-full max-w-sm flex-col items-center rounded-2xl p-8 text-center"
      >
        <h1 className="text-on-surface mb-2 text-2xl font-medium tracking-[-0.02em]">Conversation failed to load</h1>
        <p className="text-muted mb-6 text-sm">
          {error.message ? error.message.slice(0, 200) : "An unexpected error occurred."}
        </p>
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="neu-primary-button bg-primary text-on-primary rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Try again
          </button>
          <Link
            href="/chat"
            className="neu-button bg-surface text-on-surface inline-block rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            New conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
