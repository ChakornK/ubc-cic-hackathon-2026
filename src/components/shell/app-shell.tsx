"use client";

// The /chat workspace: header, recessed sidebar (drawer below lg), chat panel
// (route children), and the map panel — side-by-side and collapsible on desktop,
// bottom sheet on mobile.

import { useAppAuth } from "@/src/components/auth/app-auth";
import { useChatShell } from "@/src/components/chat/chat-shell-context";
import { Icon } from "@/src/components/icons";
import { MapBottomSheet, MapPanel } from "@/src/components/map/map-panel";
import { SessionSidebar } from "@/src/components/shell/session-sidebar";
import { UserMenu } from "@/src/components/shell/user-menu";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

function Splash({ label }: { label: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="animate-pulse text-xl font-medium tracking-[-0.02em] text-primary">UBC Assistant</span>
        <span className="text-body-sm text-muted">{label}</span>
      </div>
    </div>
  );
}

/** Gate: initializing → splash; signed out on arrival → straight to sign-in
 * (Requirement 1.4 flow); signed out mid-session (sign-out) → back home. */
function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAppAuth();
  const router = useRouter();
  const redirected = useRef(false);
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (auth.status === "signedIn") {
      wasSignedIn.current = true;
      return;
    }
    if (auth.status !== "signedOut") return;
    if (wasSignedIn.current) {
      router.replace("/");
    } else if (auth.configured && !redirected.current) {
      redirected.current = true;
      auth.signIn();
    }
  }, [auth, router]);

  if (auth.status === "signedIn") return <>{children}</>;

  if (auth.status === "signedOut" && !auth.configured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h1 className="text-base font-medium text-on-surface">Sign-in isn&apos;t configured</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Set <code className="font-mono text-body-sm">NEXT_PUBLIC_COGNITO_AUTHORITY</code> and{" "}
            <code className="font-mono text-body-sm">NEXT_PUBLIC_COGNITO_CLIENT_ID</code> to use the deployed stack, or
            run with <code className="font-mono text-body-sm">NEXT_PUBLIC_API_MOCK=1</code> for the offline demo.
          </p>
        </div>
      </div>
    );
  }

  return <Splash label={auth.status === "signedOut" ? "Redirecting to sign-in…" : "Loading…"} />;
}

function SidebarDrawer() {
  const { sidebarOpen, setSidebarOpen } = useChatShell();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div inert={!sidebarOpen} className={sidebarOpen ? "lg:hidden" : "pointer-events-none lg:hidden"}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close sessions"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-scrim transition-opacity duration-250 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat sessions"
        className={`fixed inset-y-0 left-0 z-50 w-70 transition-transform duration-250 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <SessionSidebar />
          <button
            ref={closeRef}
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sessions"
            className="absolute right-2 top-4 flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { setSidebarOpen, mapOpen, setMobileMapOpen } = useChatShell();

  return (
    <RequireAuth>
      <div className="flex h-svh flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sessions"
              className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high lg:hidden"
            >
              <Icon name="menu" size={22} />
            </button>
            <span className="text-xl font-medium tracking-[-0.02em] text-primary">UBC Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMapOpen(true)}
              aria-label="Open campus map"
              className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high sm:hidden"
            >
              <Icon name="map" size={20} />
            </button>
            <UserMenu />
          </div>
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          <aside className="hidden shrink-0 lg:block">
            <SessionSidebar />
          </aside>
          <SidebarDrawer />

          <main className="flex min-w-0 flex-1 gap-3 p-3">
            {/* Chat panel card (route children) */}
            <div className="flex min-w-0 flex-1 lg:max-w-[640px]">{children}</div>

            {/* Map: side-by-side card, collapsible to a rail (≥sm) */}
            <div className={`hidden sm:flex ${mapOpen ? "min-w-0 flex-1" : ""}`}>
              <MapPanel />
            </div>
          </main>
        </div>

        {/* Mobile map bottom sheet */}
        <MapBottomSheet />
      </div>
    </RequireAuth>
  );
}
