// The landing page's proof section: a live-feeling recreation of the app built
// from the real design tokens — not a screenshot. Decorative (aria-hidden).

export function ProductMock() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-[95vw] overflow-hidden rounded-2xl border border-border-subtle bg-background sm:w-[90vw] lg:w-[min(70vw,900px)]"
      style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.08), 0 16px 40px -12px rgba(0,0,0,0.04)" }}
    >
      {/* Header bar */}
      <div className="flex h-11 items-center justify-between border-b border-border-subtle bg-surface px-4">
        <span className="text-sm font-medium tracking-[-0.02em] text-on-surface">UBC Assistant</span>
        <span className="size-6 rounded-full bg-accent-subtle" />
      </div>

      <div className="flex">
        {/* Chat column */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="ml-auto max-w-[85%] rounded-[16px_16px_4px_16px] bg-accent-subtle px-4 py-3 text-left text-sm text-on-surface">
            How far is it from ICCS to the Nest?
          </div>

          <div className="max-w-[92%]">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary-container text-[10px] font-semibold text-on-primary-container">
                U
              </span>
              <span className="text-xs text-muted">UBC Assistant</span>
            </div>
            <div className="rounded-[16px_16px_16px_4px] border border-border-subtle bg-surface px-4 py-3 text-sm text-on-surface">
              ICCS to the AMS Nest is about 650 meters — roughly an 8 minute walk heading north through campus.
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-container-low px-2 py-1 font-mono text-xs text-on-surface-variant">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a8 8 0 0 1 8 8c0 3.6-2.4 7.2-7.1 10.9a1.5 1.5 0 0 1-1.8 0C6.4 17.2 4 13.6 4 10a8 8 0 0 1 8-8Zm0 5.5A2.5 2.5 0 1 0 12 12.5 2.5 2.5 0 0 0 12 7.5Z" />
                </svg>
                walking_distance(from="ICCS", to="NEST")
              </div>
            </div>
          </div>

          <div className="mt-auto flex h-10 items-center justify-between rounded-full border border-border-subtle bg-surface-container-low pl-4 pr-1 shadow-inset">
            <span className="text-sm text-muted">Ask about courses, campus, or academic rules…</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 4.5 5 11.5l1.4 1.4 4.6-4.6V19.5h2V8.3l4.6 4.6 1.4-1.4-7-7Z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Map inset — a clean graphic representation, not a real map render */}
        <div className="relative hidden w-[38%] shrink-0 border-l border-border-subtle bg-surface-container-low sm:block">
          <svg viewBox="0 0 300 340" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {/* Ground blocks suggesting buildings */}
            <g fill="var(--surface-container-high)" stroke="var(--border)" strokeWidth="1">
              <rect x="30" y="40" width="64" height="40" rx="3" transform="rotate(7 62 60)" />
              <rect x="180" y="60" width="76" height="46" rx="3" transform="rotate(7 218 83)" />
              <rect x="48" y="150" width="52" height="60" rx="3" transform="rotate(7 74 180)" />
              <rect x="196" y="196" width="60" height="42" rx="3" transform="rotate(7 226 217)" />
              <rect x="120" y="120" width="44" height="34" rx="3" transform="rotate(7 142 137)" />
            </g>
            {/* Route */}
            <path
              d="M 72 258 C 100 220 130 190 160 150 C 178 126 200 110 224 96"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 8"
              opacity="0.85"
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
          {/* Route info card */}
          <div className="absolute left-3 top-3 flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface/90 px-3 py-2 shadow-md backdrop-blur-sm">
            <span className="flex size-8 items-center justify-center rounded-md bg-secondary-container text-on-secondary-container">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.5 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM9.9 19.6l-1.8 3-1.7-1 2.4-4.1.9-3.1-2 1.1V19H5.7v-4.6l4.6-2.6a2 2 0 0 1 2.7.8l1 1.8a4.9 4.9 0 0 0 3.4 2.3v2a6.9 6.9 0 0 1-4.7-2.4l-.7 2.7 2 2.1V23h-2v-2.2l-2.1-1.2Z" />
              </svg>
            </span>
            <span>
              <span className="block text-base font-medium leading-tight text-on-surface">8 min</span>
              <span className="block text-xs text-muted">650 m</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
