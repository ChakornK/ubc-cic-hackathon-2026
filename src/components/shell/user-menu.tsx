"use client";

// Header avatar + dropdown: signed-in email, theme preference, sign out.

import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { useTheme, type ThemeMode } from "@/src/components/providers";
import { useEffect, useRef, useState } from "react";

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Light" },
  { mode: "system", label: "Auto" },
  { mode: "dark", label: "Dark" },
];

export function UserMenu() {
  const auth = useAppAuth();
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial = (auth.user?.name ?? auth.user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex size-8 items-center justify-center rounded-full border border-border bg-primary-container text-sm font-medium text-on-primary-container transition-transform duration-150 hover:scale-105"
      >
        {initial}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Account"
          className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border-subtle bg-surface-bright p-2 shadow-lg"
        >
          <p className="truncate px-3 py-2 text-body-sm text-on-surface-variant" title={auth.user?.email}>
            {auth.user?.email ?? "Signed in"}
          </p>

          <div className="my-1 border-t border-border-subtle" />

          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-on-surface">
              <Icon name={mode === "dark" ? "moon" : "sun"} size={16} className="text-on-surface-variant" />
              Theme
            </span>
            <div className="flex rounded-lg bg-surface-container-low p-0.5">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => setMode(option.mode)}
                  aria-pressed={mode === option.mode}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 ${
                    mode === option.mode
                      ? "bg-surface-bright text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-1 border-t border-border-subtle" />

          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-on-surface transition-colors duration-150 hover:bg-accent-subtle"
          >
            <Icon name="exit" size={16} className="text-on-surface-variant" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
