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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

function Splash({ label }: { label: string }) {
  return (
    <div className="app-shell-canvas flex min-h-svh items-center justify-center">
      <div className="neu-panel bg-surface flex flex-col items-center gap-3 rounded-2xl border px-10 py-8">
        <span className="bg-primary-container text-on-primary-container shadow-inset flex size-11 items-center justify-center rounded-xl">
          <Icon name="school" size={22} />
        </span>
        <span className="text-primary animate-pulse text-xl font-medium tracking-[-0.02em]">Reogent</span>
        <span className="text-body-sm text-muted">{label}</span>
      </div>
    </div>
  );
}

/** Gate: initializing → splash; signed out → redirect to landing/login. */
function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAppAuth();
  const router = useRouter();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (auth.status === "signedIn") {
      wasSignedIn.current = true;
      return;
    }
    if (auth.status === "signedOut") {
      router.replace("/");
    }
  }, [auth, router]);

  if (auth.status === "signedIn") return <>{children}</>;

  if (auth.status === "signedOut" && !auth.configured) {
    return (
      <div className="app-shell-canvas flex min-h-svh items-center justify-center px-6">
        <div className="neu-panel bg-surface max-w-md rounded-2xl border p-6">
          <h1 className="text-on-surface text-base font-medium">Sign-in isn&apos;t configured</h1>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
            Set <code className="text-body-sm font-mono">NEXT_PUBLIC_COGNITO_AUTHORITY</code> and{" "}
            <code className="text-body-sm font-mono">NEXT_PUBLIC_COGNITO_CLIENT_ID</code> to use the deployed stack, or
            run with <code className="text-body-sm font-mono">NEXT_PUBLIC_API_MOCK=1</code> for the offline demo.
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
        className={`bg-scrim fixed inset-0 z-40 transition-opacity duration-250 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat sessions"
        className={`fixed inset-y-0 left-0 z-50 w-[18.5rem] p-3 transition-transform duration-250 [transition-timing-function:var(--neu-ease)] ${
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
            className="neu-button bg-surface text-on-surface-variant hover:text-primary absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg"
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
  const [sessionsCollapsed, setSessionsCollapsed] = useState(false);
  const sessionsMenuRef = useRef<HTMLButtonElement>(null);

  function collapseSessions() {
    setSessionsCollapsed(true);
    requestAnimationFrame(() => sessionsMenuRef.current?.focus());
  }

  function expandSessions() {
    setSessionsCollapsed(false);
    requestAnimationFrame(() => document.getElementById("desktop-session-collapse")?.focus());
  }

  return (
    <RequireAuth>
      <div className="app-shell-canvas flex h-svh flex-col overflow-hidden">
        <header className="glass-neu relative z-30 mx-3 mt-3 flex h-14 shrink-0 items-center justify-between rounded-2xl border px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sessions"
              className="neu-button bg-surface text-on-surface-variant hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-xl lg:hidden"
            >
              <Icon name="menu" size={21} />
            </button>
            <Link
              href="/"
              aria-label="Go to Reogent homepage"
              className="group flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 focus-visible:outline-offset-4"
            >
              <span className="bg-surface-container-low text-primary border-border-subtle hidden size-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-150 group-hover:-translate-y-0.5 sm:flex">
                <Icon name="school" size={17} />
              </span>
              <span className="text-primary group-hover:text-on-surface truncate text-lg font-medium tracking-[-0.025em] transition-colors duration-150 sm:text-xl">
                Reogent
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMapOpen(true)}
              aria-label="Open campus map"
              className="neu-button bg-surface text-on-surface-variant hover:text-primary flex size-9 items-center justify-center rounded-xl sm:hidden"
            >
              <Icon name="map" size={19} />
            </button>
            <UserMenu />
          </div>
        </header>

        <div data-sessions-state={sessionsCollapsed ? "collapsed" : "expanded"} className="shell-body min-h-0 flex-1">
          <aside aria-label="Chat sessions" className="relative hidden min-h-0 min-w-0 overflow-hidden p-3 lg:block">
            <div
              id="desktop-session-panel"
              inert={sessionsCollapsed}
              aria-hidden={sessionsCollapsed}
              className="sessions-panel-layer h-full w-[17rem]"
            >
              <SessionSidebar onCollapse={collapseSessions} />
            </div>
            <button
              ref={sessionsMenuRef}
              type="button"
              onClick={expandSessions}
              tabIndex={sessionsCollapsed ? 0 : -1}
              aria-label="Expand session history"
              aria-controls="desktop-session-panel"
              aria-expanded={!sessionsCollapsed}
              title="Expand sessions"
              className="sessions-menu-trigger glass-neu-compact text-on-surface-variant hover:text-primary border-border-subtle absolute top-3 left-3 flex size-9 items-center justify-center rounded-xl border"
            >
              <Icon name="menu" size={20} />
            </button>
          </aside>
          <SidebarDrawer />

          <main
            data-map-state={mapOpen ? "open" : "collapsed"}
            className="chat-workspace min-h-0 min-w-0 flex-1 gap-3 p-3 lg:pl-0"
          >
            <div className="flex min-h-0 min-w-0">{children}</div>
            <div className="hidden min-h-0 min-w-0 sm:flex">
              <MapPanel />
            </div>
          </main>
        </div>

        <MapBottomSheet />
      </div>
    </RequireAuth>
  );
}
