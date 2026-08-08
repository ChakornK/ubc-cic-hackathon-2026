"use client";

// Header avatar + animated dropdown: signed-in email, contained theme preference,
// and sign out. The menu stays mounted so closing can fade cleanly.
import { useAppAuth } from "@/src/components/auth/app-auth";
import { Icon } from "@/src/components/icons";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const auth = useAppAuth();
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

  const initial = (auth.user?.username ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="neu-button bg-surface text-primary flex size-9 items-center justify-center rounded-xl text-sm font-medium"
      >
        <span className="bg-primary-container text-on-primary-container flex size-6 items-center justify-center rounded-lg">
          {initial}
        </span>
      </button>

      {/* Scrim overlay — click to close */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <div
        inert={!open}
        aria-hidden={!open}
        role="menu"
        aria-label="Account"
        className={`profile-menu-surface neu-panel absolute top-12 right-0 z-50 w-64 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl p-3 ${
          open
            ? "blur-0 visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1.5 scale-[0.97] opacity-0 blur-[2px]"
        }`}
      >
        <div className="px-3 py-2">
          <p className="text-muted text-xs font-medium">Signed in as</p>
          <p className="text-body-sm text-on-surface mt-0.5 truncate" title={auth.user?.username}>
            {auth.user?.username ?? "Signed in"}
          </p>
        </div>

        <div className="bg-border-subtle my-1 h-px" />

        <button
          type="button"
          onClick={() => auth.signOut()}
          className="text-on-surface hover:bg-error/10 hover:text-error flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-150"
        >
          <Icon name="exit" size={16} className="text-on-surface-variant" />
          Sign out
        </button>
      </div>
    </div>
  );
}
