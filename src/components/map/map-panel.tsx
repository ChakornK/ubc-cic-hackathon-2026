"use client";

// Map chrome: the neumorphic desktop/tablet card (collapsible to a rail, per the
// design sketches) and the mobile bottom sheet. Floating glass overlays carry
// the route info and map controls; a text fallback covers map failures.

import { useChatShell } from "@/src/components/chat/chat-shell-context";
import { Icon } from "@/src/components/icons";
import { CampusMap, type MapControls, type MapStatus } from "@/src/components/map/campus-map";
import { formatMeters, formatMinutes } from "@/src/lib/format";
import { useEffect, useRef, useState } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function GlassButton({
  label,
  icon,
  onClick,
  pressed,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`flex size-10 items-center justify-center rounded-lg border border-border-subtle bg-surface/90 shadow-sm backdrop-blur-sm transition-colors duration-150 ${
        pressed ? "text-primary" : "text-on-surface-variant hover:text-primary"
      }`}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

function RouteInfoCard() {
  const { highlight } = useChatShell();
  if (!highlight) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface/90 px-3 py-2 shadow-md backdrop-blur-sm">
      <span className="flex size-8 items-center justify-center rounded-md bg-secondary-container text-on-secondary-container">
        <Icon name="walk" size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-medium leading-tight text-on-surface">
          {formatMinutes(highlight.minutes)}
        </span>
        <span className="block truncate text-xs text-on-surface-variant">
          {formatMeters(highlight.meters)} · {highlight.from} → {highlight.to}
        </span>
      </span>
    </div>
  );
}

function MapFallback() {
  const { highlight } = useChatShell();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface-container-low px-6 text-center">
      <Icon name="wifiOff" size={32} className="text-outline" />
      <p className="text-body-sm text-on-surface-variant">Map unavailable</p>
      {highlight && (
        <p className="max-w-60 text-sm text-on-surface">
          {formatMeters(highlight.meters)}, about {formatMinutes(highlight.minutes)} walking from {highlight.from} to{" "}
          {highlight.to}.
        </p>
      )}
    </div>
  );
}

function MapSurface() {
  const { highlight, focusNonce } = useChatShell();
  const [showRoutes, setShowRoutes] = useState(false);
  const [status, setStatus] = useState<MapStatus>("loading");
  const controls = useRef<MapControls | null>(null);

  return (
    <div className="relative h-full w-full">
      {status === "error" ? (
        <MapFallback />
      ) : (
        <>
          <CampusMap
            highlight={highlight}
            focusNonce={focusNonce}
            showRoutes={showRoutes}
            onStatus={setStatus}
            controls={controls}
          />
          {status === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-surface-container-low" aria-hidden="true" />
          )}

          {/* Route info — floating top-left */}
          <div className="absolute left-3 top-3 z-10 max-w-[75%]">
            <RouteInfoCard />
          </div>

          {/* Layer + view controls — floating top-right */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <GlassButton
              label={showRoutes ? "Hide walking paths" : "Show walking paths"}
              icon="layer"
              pressed={showRoutes}
              onClick={() => setShowRoutes((v) => !v)}
            />
            <GlassButton label="Reset view" icon="aiming" onClick={() => controls.current?.resetView()} />
          </div>

          {/* Zoom — floating bottom-right */}
          <div className="absolute bottom-6 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface/90 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => controls.current?.zoomIn()}
              className="flex size-10 items-center justify-center text-on-surface-variant transition-colors duration-150 hover:text-primary"
            >
              <Icon name="add" size={20} />
            </button>
            <div className="mx-2 border-t border-border-subtle" />
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => controls.current?.zoomOut()}
              className="flex size-10 items-center justify-center text-on-surface-variant transition-colors duration-150 hover:text-primary"
            >
              <Icon name="minimize" size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Desktop/tablet: side-by-side neumorphic card, collapsible to a slim rail. */
export function MapPanel() {
  const { mapOpen, setMapOpen, highlight } = useChatShell();
  const isMobile = useMediaQuery("(max-width: 639px)");

  // A fresh route is the moment the map earns attention — reopen the rail.
  useEffect(() => {
    if (highlight) setMapOpen(true);
  }, [highlight, setMapOpen]);

  if (isMobile) return null;

  if (!mapOpen) {
    return (
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        aria-label="Expand campus map"
        title="Expand campus map"
        className="flex h-full w-12 flex-col items-center gap-3 rounded-xl border border-border-subtle bg-surface pt-3 text-on-surface-variant shadow-sm transition-colors duration-150 hover:text-primary"
      >
        <Icon name="fullscreen" size={18} />
        <Icon name="map" size={20} />
        <span className="text-xs font-medium tracking-[0.05em] [writing-mode:vertical-rl]">Campus map</span>
      </button>
    );
  }

  return (
    <section
      aria-label="Campus map"
      className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm"
    >
      <MapSurface />
      <button
        type="button"
        onClick={() => setMapOpen(false)}
        aria-label="Collapse map"
        title="Collapse map"
        className="absolute left-3 top-1/2 z-10 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-lg border border-border-subtle bg-surface/90 text-on-surface-variant shadow-sm backdrop-blur-sm transition-colors duration-150 hover:text-primary"
      >
        <Icon name="right" size={16} />
      </button>
    </section>
  );
}

/** Mobile: 80vh bottom sheet with drag-to-dismiss. */
export function MapBottomSheet() {
  const { mobileMapOpen, setMobileMapOpen, highlight } = useChatShell();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ startY: number; delta: number } | null>(null);

  useEffect(() => {
    if (!mobileMapOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMapOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMapOpen, setMobileMapOpen]);

  if (!isMobile) return null;

  function onPointerDown(event: React.PointerEvent) {
    drag.current = { startY: event.clientY, delta: 0 };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!drag.current || !sheetRef.current) return;
    drag.current.delta = Math.max(0, event.clientY - drag.current.startY);
    sheetRef.current.style.transform = `translateY(${drag.current.delta}px)`;
  }

  function onPointerUp() {
    const sheet = sheetRef.current;
    const state = drag.current;
    drag.current = null;
    if (!sheet || !state) return;
    sheet.style.transform = "";
    if (state.delta > sheet.offsetHeight * 0.2) setMobileMapOpen(false);
  }

  return (
    <div inert={!mobileMapOpen} className={mobileMapOpen ? "" : "pointer-events-none"}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close map"
        onClick={() => setMobileMapOpen(false)}
        className={`fixed inset-0 z-40 bg-scrim transition-opacity duration-300 ${
          mobileMapOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Campus map"
        className={`fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col overflow-hidden rounded-t-2xl border-t border-border-subtle bg-surface shadow-lg transition-transform duration-300 ease-out ${
          mobileMapOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 px-4 pb-3 pt-2"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <span className="h-1 w-8 rounded-full bg-border" aria-hidden="true" />
          <div className="flex w-full items-center justify-between">
            <span className="min-w-0">
              <span className="block truncate text-base font-medium text-on-surface">
                {highlight ? `${highlight.from} → ${highlight.to}` : "Campus map"}
              </span>
              {highlight && (
                <span className="block text-sm text-on-surface-variant">
                  {formatMeters(highlight.meters)} · {formatMinutes(highlight.minutes)} walk
                </span>
              )}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setMobileMapOpen(false)}
              aria-label="Close map"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1">{mobileMapOpen && <MapSurface />}</div>
      </div>
    </div>
  );
}
