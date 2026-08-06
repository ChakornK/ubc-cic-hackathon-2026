"use client";

// Header avatar + animated dropdown: signed-in email, contained theme preference,
// and sign out. The menu stays mounted so closing can fade cleanly.
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
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
        className="neu-button bg-surface text-primary flex size-9 items-center justify-center rounded-xl text-sm font-medium"
      >
        <span className="bg-primary-container text-on-primary-container flex size-6 items-center justify-center rounded-lg">
          {initial}
        </span>
      </button>

      <div
        inert={!open}
        aria-hidden={!open}
        role="dialog"
        aria-label="Account"
        className={`profile-menu-surface neu-panel glass-neu bg-surface absolute top-12 right-0 z-50 w-64 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border p-2.5 ${
          open
            ? "blur-0 visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1.5 scale-[0.97] opacity-0 blur-[2px]"
        }`}
      >
        <div className="rounded-xl px-2.5 py-2">
          <p className="text-muted text-xs font-medium">Signed in as</p>
          <p className="text-body-sm text-on-surface mt-0.5 truncate" title={auth.user?.email}>
            {auth.user?.email ?? "Signed in"}
          </p>
        </div>

        <div className="bg-border-subtle my-1 h-px" />

        <div className="px-1 py-2">
          <div className="text-on-surface mb-2 flex items-center gap-2 px-1 text-sm font-medium">
            <Icon name={mode === "dark" ? "moon" : "sun"} size={16} className="text-primary" />
            Appearance
          </div>
          <div className="neu-inset bg-surface-container-low grid grid-cols-3 gap-1 rounded-xl border p-1">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => setMode(option.mode)}
                aria-pressed={mode === option.mode}
                className={`h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                  mode === option.mode
                    ? "neu-raised border-border-subtle bg-surface text-primary border"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-border-subtle my-1 h-px" />

        <button
          type="button"
          onClick={() => auth.signOut()}
          className="text-on-surface hover:bg-surface-container flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm transition-colors duration-150"
        >
          <Icon name="exit" size={16} className="text-on-surface-variant" />
          Sign out
        </button>
      </div>
    </div>
  );
}
