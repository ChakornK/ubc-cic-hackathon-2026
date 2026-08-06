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
      className={`border-border-subtle bg-surface/90 flex size-10 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors duration-150 ${
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
    <div className="border-border-subtle bg-surface/90 flex items-center gap-2.5 rounded-lg border px-3 py-2 shadow-md backdrop-blur-sm">
      <span className="bg-secondary-container text-on-secondary-container flex size-8 items-center justify-center rounded-md">
        <Icon name="walk" size={18} />
      </span>
      <span className="min-w-0">
        <span className="text-on-surface block text-base leading-tight font-medium">
          {formatMinutes(highlight.minutes)}
        </span>
        <span className="text-on-surface-variant block truncate text-xs">
          {formatMeters(highlight.meters)} · {highlight.from} → {highlight.to}
        </span>
      </span>
    </div>
  );
}

function MapFallback() {
  const { highlight } = useChatShell();
  return (
    <div className="bg-surface-container-low flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <Icon name="wifiOff" size={32} className="text-outline" />
      <p className="text-body-sm text-on-surface-variant">Map unavailable</p>
      {highlight && (
        <p className="text-on-surface max-w-60 text-sm">
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
            <div className="bg-surface-container-low absolute inset-0 animate-pulse" aria-hidden="true" />
          )}

          {/* Route info — floating top-left */}
          <div className="absolute top-3 left-3 z-10 max-w-[75%]">
            <RouteInfoCard />
          </div>

          {/* Layer + view controls — floating top-right */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <GlassButton
              label={showRoutes ? "Hide walking paths" : "Show walking paths"}
              icon="layer"
              pressed={showRoutes}
              onClick={() => setShowRoutes((v) => !v)}
            />
            <GlassButton label="Reset view" icon="aiming" onClick={() => controls.current?.resetView()} />
          </div>

          {/* Zoom — floating bottom-right */}
          <div className="border-border-subtle bg-surface/90 absolute right-3 bottom-6 z-10 flex flex-col overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => controls.current?.zoomIn()}
              className="text-on-surface-variant hover:text-primary flex size-10 items-center justify-center transition-colors duration-150"
            >
              <Icon name="add" size={20} />
            </button>
            <div className="border-border-subtle mx-2 border-t" />
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => controls.current?.zoomOut()}
              className="text-on-surface-variant hover:text-primary flex size-10 items-center justify-center transition-colors duration-150"
            >
              <Icon name="minimize" size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Desktop/tablet: a persistent tool slot that collapses into a passive rail. */
export function MapPanel() {
  const { mapOpen, setMapOpen, highlight } = useChatShell();
  const isMobile = useMediaQuery("(max-width: 639px)");

  // A fresh route is the moment the map earns attention — reopen the tab.
  useEffect(() => {
    if (highlight) setMapOpen(true);
  }, [highlight, setMapOpen]);

  if (isMobile) return null;

  return (
    <div className="relative h-full min-h-0 w-full">
      <section
        inert={!mapOpen}
        aria-hidden={!mapOpen}
        aria-label="Campus map"
        className={`map-surface-layer neu-panel glass-neu-strong bg-surface absolute inset-0 flex min-w-0 overflow-hidden rounded-2xl border ${
          mapOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
        }`}
      >
        <MapSurface />
        <button
          type="button"
          onClick={() => setMapOpen(false)}
          aria-label="Collapse campus map to tab"
          title="Collapse map"
          className="neu-button glass-neu-compact bg-surface/95 text-on-surface-variant hover:text-primary absolute top-3 left-3 z-20 flex size-9 items-center justify-center rounded-xl backdrop-blur-sm"
        >
          <Icon name="right" size={17} />
        </button>
      </section>

      <aside
        inert={mapOpen}
        aria-hidden={mapOpen}
        aria-label="Collapsed campus map"
        className={`map-tab-layer neu-panel glass-neu bg-surface text-on-surface-variant absolute inset-y-0 right-0 flex w-[3.25rem] cursor-default flex-col items-center rounded-2xl border py-2.5 ${
          mapOpen ? "pointer-events-none translate-x-2 opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          tabIndex={mapOpen ? -1 : 0}
          aria-label="Expand campus map"
          title="Expand campus map"
          className="neu-button glass-neu-compact bg-surface text-primary hover:text-on-surface flex size-9 items-center justify-center rounded-xl"
        >
          <Icon name="fullscreen" size={17} />
        </button>
        <span className="bg-border my-3 h-px w-5" aria-hidden="true" />
        <span className="text-xs font-medium tracking-[0.06em] select-none [writing-mode:vertical-rl]">Campus map</span>
        <span
          className="neu-inset bg-surface-container-low text-on-surface-variant mt-auto flex size-8 items-center justify-center rounded-lg border"
          aria-hidden="true"
        >
          <Icon name="map" size={17} />
        </span>
      </aside>
    </div>
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
        className={`bg-scrim fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMapOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Campus map"
        className={`border-border-subtle bg-surface fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col overflow-hidden rounded-t-2xl border-t shadow-lg transition-transform duration-300 ease-out ${
          mobileMapOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 px-4 pt-2 pb-3"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <span className="bg-border h-1 w-8 rounded-full" aria-hidden="true" />
          <div className="flex w-full items-center justify-between">
            <span className="min-w-0">
              <span className="text-on-surface block truncate text-base font-medium">
                {highlight ? `${highlight.from} → ${highlight.to}` : "Campus map"}
              </span>
              {highlight && (
                <span className="text-on-surface-variant block text-sm">
                  {formatMeters(highlight.meters)} · {formatMinutes(highlight.minutes)} walk
                </span>
              )}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setMobileMapOpen(false)}
              aria-label="Close map"
              className="text-on-surface-variant hover:bg-surface-container-high flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
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
