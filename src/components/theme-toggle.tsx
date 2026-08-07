"use client";

import { Icon, type IconName } from "@/src/components/icons";
import { useTheme, type ThemeMode } from "@/src/components/providers";
import { useCallback, useRef } from "react";

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: IconName }> = [
  { mode: "light", label: "Light", icon: "sun" },
  { mode: "system", label: "Auto", icon: "computer" },
  { mode: "dark", label: "Dark", icon: "moon" },
];

/**
 * Compact segmented theme toggle with proper ARIA radiogroup semantics
 * and roving tabindex for keyboard navigation.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = OPTIONS.findIndex((o) => o.mode === mode);
      let next = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (idx + 1) % OPTIONS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (idx - 1 + OPTIONS.length) % OPTIONS.length;
      } else {
        return;
      }
      e.preventDefault();
      setMode(OPTIONS[next].mode);
      // Move focus to the newly active radio
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[next]?.focus();
    },
    [mode, setMode],
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Appearance"
      onKeyDown={handleKeyDown}
      className={`bg-surface-container-low grid grid-cols-3 gap-0.5 rounded-xl p-0.5 ${className}`}
    >
      {OPTIONS.map((option) => {
        const selected = mode === option.mode;
        return (
          // biome-ignore lint/a11y/useSemanticElements: APG radio group pattern on styled buttons
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => setMode(option.mode)}
            className={`flex h-7 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 ${
              selected
                ? "bg-surface text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <Icon name={option.icon} size={15} />
          </button>
        );
      })}
    </div>
  );
}
