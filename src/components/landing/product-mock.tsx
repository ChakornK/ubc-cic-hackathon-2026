// The landing page's proof section: a live-feeling recreation of the app built
// from the real design tokens — not a screenshot. Decorative (aria-hidden).

export function ProductMock() {
  return (
    <div
      aria-hidden="true"
      className="glass-neu-strong mx-auto w-full max-w-[940px] overflow-hidden rounded-[1.75rem] p-2 sm:p-2.5"
    >
      <div className="border-border-subtle bg-surface overflow-hidden rounded-[1.25rem] border">
        <div className="border-border-subtle bg-surface flex h-12 items-center justify-between border-b px-3 sm:px-4">
          <span className="text-on-surface flex items-center gap-2.5 text-sm font-medium tracking-[-0.02em]">
            <span className="bg-surface-container-low text-primary border-border-subtle flex size-7 items-center justify-center rounded-lg border text-[0.6875rem] font-medium">
              R
            </span>
            Reogent
          </span>
          <span className="bg-surface text-primary border-border-subtle flex size-7 items-center justify-center rounded-lg border text-xs font-medium">
            A
          </span>
        </div>

        <div className="flex min-h-[320px] sm:min-h-[390px]">
          <div className="chat-message-well flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6">
            <div className="bg-accent-subtle text-on-surface border-border-subtle ml-auto max-w-[88%] rounded-[16px_16px_5px_16px] border px-4 py-3 text-left text-sm">
              How far is it from ICCS to the Nest?
            </div>

            <div className="max-w-[94%]">
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-primary-container text-on-primary-container border-border-subtle flex size-6 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
                  R
                </span>
                <span className="text-muted text-xs">Reogent</span>
              </div>
              <div className="bg-surface text-on-surface border-border-subtle rounded-[16px_16px_16px_5px] border px-4 py-3 text-sm leading-relaxed">
                ICCS to the AMS Nest is about 650 meters — roughly an 8 minute walk heading north through campus.
                <div className="bg-surface-container-low text-on-surface-variant border-border-subtle mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a8 8 0 0 1 8 8c0 3.6-2.4 7.2-7.1 10.9a1.5 1.5 0 0 1-1.8 0C6.4 17.2 4 13.6 4 10a8 8 0 0 1 8-8Zm0 5.5A2.5 2.5 0 1 0 12 12.5 2.5 2.5 0 0 0 12 7.5Z" />
                  </svg>
                  <span className="truncate">walking_distance(from=&quot;ICCS&quot;, to=&quot;NEST&quot;)</span>
                </div>
              </div>
            </div>

            <div className="neu-inset bg-surface-container-low mt-auto flex min-h-11 items-center justify-between rounded-2xl border py-1 pr-1.5 pl-4">
              <span className="text-muted truncate pr-3 text-sm">Ask about courses, campus, or academic rules…</span>
              <span className="neu-primary-button bg-primary text-on-primary flex size-8 shrink-0 items-center justify-center rounded-xl">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 4.5 5 11.5l1.4 1.4 4.6-4.6V19.5h2V8.3l4.6 4.6 1.4-1.4-7-7Z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="neu-inset border-border-subtle bg-surface-container-low relative hidden w-[40%] shrink-0 overflow-hidden border-l sm:block">
            <svg
              viewBox="0 0 300 340"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <g fill="var(--surface-container-high)" stroke="var(--border)" strokeWidth="1">
                <rect x="30" y="40" width="64" height="40" rx="5" transform="rotate(7 62 60)" />
                <rect x="180" y="60" width="76" height="46" rx="5" transform="rotate(7 218 83)" />
                <rect x="48" y="150" width="52" height="60" rx="5" transform="rotate(7 74 180)" />
                <rect x="196" y="196" width="60" height="42" rx="5" transform="rotate(7 226 217)" />
                <rect x="120" y="120" width="44" height="34" rx="5" transform="rotate(7 142 137)" />
              </g>
              <path
                d="M 72 258 C 100 220 130 190 160 150 C 178 126 200 110 224 96"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 8"
                opacity="0.9"
              />
              <circle cx="72" cy="258" r="7" fill="var(--primary)" stroke="var(--surface-bright)" strokeWidth="3" />
              <circle cx="224" cy="96" r="8" fill="var(--primary)" stroke="var(--surface-bright)" strokeWidth="3" />
              <circle cx="224" cy="96" r="2.5" fill="var(--surface-bright)" />
              <text x="88" y="276" fontSize="13" fontWeight="600" fill="var(--on-surface-variant)">
                ICCS
              </text>
              <text x="238" y="90" fontSize="13" fontWeight="600" fill="var(--on-surface-variant)">
                Nest
              </text>
            </svg>

            <span className="neu-button bg-surface/90 text-on-surface-variant absolute top-3 left-3 flex size-8 items-center justify-center rounded-xl">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="m14 7-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <div className="bg-surface/92 border-border-subtle absolute top-3 right-3 flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-sm">
              <span className="bg-secondary-container text-on-secondary-container border-border-subtle flex size-8 items-center justify-center rounded-lg border">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM9.9 19.6l-1.8 3-1.7-1 2.4-4.1.9-3.1-2 1.1V19H5.7v-4.6l4.6-2.6a2 2 0 0 1 2.7.8l1 1.8a4.9 4.9 0 0 0 3.4 2.3v2a6.9 6.9 0 0 1-4.7-2.4l-.7 2.7 2 2.1V23h-2v-2.2l-2.1-1.2Z" />
                </svg>
              </span>
              <span>
                <span className="text-on-surface block text-base leading-tight font-medium">8 min</span>
                <span className="text-muted block text-xs">650 m</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
