// Product mock for the landing page. Mirrors the actual app-shell structure:
// neu-panel chat panel + neu-panel map panel, no borders,
// same bubble radii, same composer, same tool badge styling.

import { Icon } from "@/src/components/icons";

export function ProductMock() {
  return (
    <div aria-hidden="true" className="app-shell-canvas mx-auto flex w-full max-w-[960px] gap-3 rounded-[1.75rem] p-3">
      {/* Chat panel */}
      <div className="neu-panel flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-transparent px-4 py-3">
          <span className="text-on-surface text-sm font-medium tracking-[-0.01em]">Walking to the Nest</span>
        </div>

        {/* Message well */}
        <div className="chat-message-well flex min-h-[280px] flex-1 flex-col gap-6 overflow-hidden p-4 sm:min-h-[340px] sm:p-6">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-accent-subtle text-on-surface max-w-[85%] rounded-[16px_16px_5px_16px] px-4 py-3 text-sm leading-relaxed">
              How far is ICCS to the Nest?
            </div>
          </div>

          {/* Assistant message */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="bg-primary-container text-on-primary-container flex size-7 items-center justify-center rounded-lg text-[0.6875rem] font-medium">
                R
              </span>
              <span className="text-muted text-xs font-medium">Reogent</span>
            </div>
            <div className="bg-surface max-w-[88%] rounded-[16px_16px_16px_5px] px-4 py-3">
              <p className="text-on-surface text-sm leading-relaxed">
                ICCS to the AMS Nest is about <span className="font-mono">650 m</span>, roughly an{" "}
                <span className="font-medium">8 minute walk</span> heading north through campus.
              </p>
              {/* Walking distance card */}
              <div className="bg-surface-container-low mt-3 flex items-center gap-3 rounded-lg p-3">
                <span className="bg-secondary-container text-on-secondary-container flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon name="walk" size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-on-surface block text-base font-medium">8 min walk</span>
                  <span className="text-on-surface-variant block truncate text-xs">650 m · ICCS → Nest</span>
                </span>
                <span className="border-primary text-primary shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium">
                  Show on map
                </span>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="chat-composer neu-inset bg-surface-container-low mt-auto flex items-center rounded-2xl p-1.5">
            <span className="text-muted min-w-0 flex-1 truncate px-3 py-2 text-sm">Ask about courses, campus…</span>
            <span className="neu-primary-button bg-primary text-on-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
              <Icon name="arrowUp" size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Map panel */}
      <div className="neu-panel relative hidden flex-1 overflow-hidden rounded-2xl sm:flex">
        {/* Map illustration (decorative SVG — not an icon) */}
        <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="var(--surface-container-high)" stroke="var(--border)" strokeWidth="0.8">
            <rect x="40" y="50" width="70" height="45" rx="4" transform="rotate(5 75 72)" />
            <rect x="240" y="70" width="85" height="50" rx="4" transform="rotate(5 282 95)" />
            <rect x="60" y="180" width="55" height="65" rx="4" transform="rotate(5 87 212)" />
            <rect x="260" y="240" width="65" height="45" rx="4" transform="rotate(5 292 262)" />
            <rect x="150" y="140" width="50" height="38" rx="4" transform="rotate(5 175 159)" />
            <rect x="320" y="150" width="40" height="55" rx="4" transform="rotate(5 340 177)" />
          </g>
          <path
            d="M 90 310 C 120 270 160 220 200 170 C 230 130 270 110 300 90"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="10 6"
            opacity="0.85"
          />
          <circle cx="90" cy="310" r="8" fill="var(--primary)" stroke="var(--surface-bright)" strokeWidth="3" />
          <circle cx="300" cy="90" r="8" fill="var(--primary)" stroke="var(--surface-bright)" strokeWidth="3" />
          <circle cx="300" cy="90" r="3" fill="var(--surface-bright)" />
          <text
            x="108"
            y="326"
            fontSize="12"
            fontWeight="500"
            fontFamily="var(--font-mono)"
            fill="var(--on-surface-variant)"
          >
            ICCS
          </text>
          <text
            x="314"
            y="86"
            fontSize="12"
            fontWeight="500"
            fontFamily="var(--font-mono)"
            fill="var(--on-surface-variant)"
          >
            Nest
          </text>
        </svg>

        {/* Collapse button */}
        <span className="neu-panel text-on-surface-variant absolute top-3 left-3 flex size-9 items-center justify-center rounded-xl">
          <Icon name="right" size={15} />
        </span>

        {/* Route info card */}
        <div className="neu-panel absolute top-3 right-3 flex items-center gap-2 rounded-lg px-3 py-2">
          <span className="bg-secondary-container text-on-secondary-container flex size-8 items-center justify-center rounded-lg">
            <Icon name="walk" size={16} />
          </span>
          <span>
            <span className="text-on-surface block text-base leading-tight font-medium">8 min</span>
            <span className="text-on-surface-variant block text-xs">650 m</span>
          </span>
        </div>
      </div>
    </div>
  );
}
