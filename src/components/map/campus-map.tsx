"use client";

// Campus_Map: deck.gl v9 layers over a MapLibre basemap. Buildings come from
// /api/geo/buildings (cached client-side by the api layer) extruded to their
// real heights (BLDG_HEIGHT / MAX_FLOORS), with a pick-tooltip showing
// NAME / BLDG_CODE; walking routes are an optional context layer.
//
// Agent tool calls drive the highlight: a walking_distance call traces the
// actual pedestrian-network polyline (from /api/route) with a draw-on
// animation, and a find_building call highlights the footprint and flies to it.
//
// maplibre + deck are imported dynamically inside the init effect so the ~1 MB
// of map code stays out of the initial bundle (and out of SSR).
import type { MapHighlight } from "@/src/components/chat/chat-shell-context";
import { BuildingPopup, type SelectedBuilding } from "@/src/components/map/building-popup";
import { useApi, useTheme, type ResolvedTheme } from "@/src/components/providers";
import { formatMeters, formatMinutes } from "@/src/lib/format";
import { featureCentroid, featuresBounds, findBuilding, type BuildingFeature, type LngLat } from "@/src/lib/geo";
import type { FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapStatus = "loading" | "ready" | "error";

export interface MapControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

interface CampusMapProps {
  highlight: MapHighlight | null;
  /** Bumps re-focus the camera on the current highlight. */
  focusNonce: number;
  showRoutes: boolean;
  onStatus?: (status: MapStatus) => void;
  /** Filled with imperative camera controls once the map is up. */
  controls?: React.RefObject<MapControls | null>;
}

interface PickedBuilding {
  name: string;
  code: string;
  x: number;
  y: number;
}

const UBC_CENTER: LngLat = [-123.246, 49.2626];
const INITIAL_VIEW = { center: UBC_CENTER, zoom: 14.4, pitch: 40, bearing: -8 };

const STYLE_URLS: Record<ResolvedTheme, string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

type Rgba = [number, number, number, number];

const MAP_COLORS: Record<
  ResolvedTheme,
  Record<
    "fill" | "line" | "fillHighlight" | "lineHighlight" | "route" | "routeCasing" | "label" | "labelBg" | "walkway",
    Rgba
  >
> = {
  light: {
    fill: [216, 220, 222, 170],
    line: [154, 162, 166, 200],
    fillHighlight: [65, 99, 117, 235],
    lineHighlight: [16, 53, 70, 255],
    route: [65, 99, 117, 230],
    routeCasing: [255, 255, 255, 200],
    label: [16, 53, 70, 255],
    labelBg: [255, 255, 255, 215],
    walkway: [124, 158, 178, 90],
  },
  dark: {
    fill: [58, 58, 64, 190],
    line: [90, 92, 98, 220],
    fillHighlight: [169, 203, 224, 235],
    lineHighlight: [196, 231, 253, 255],
    route: [169, 203, 224, 235],
    routeCasing: [18, 18, 20, 200],
    label: [196, 231, 253, 255],
    labelBg: [26, 26, 30, 215],
    walkway: [124, 158, 178, 70],
  },
};

const ROUTE_DRAW_MS = 2500;

/** Real height where the dataset has one; ~3.5 m per floor otherwise; low default. */
function buildingHeight(feature: BuildingFeature): number {
  const p = feature.properties ?? {};
  return Number(p.BLDG_HEIGHT) || (Number(p.MAX_FLOORS) || 0) * 3.5 || 8;
}

interface MapHandles {
  map: import("maplibre-gl").Map;
  overlay: import("@deck.gl/mapbox").MapboxOverlay;
  layerModules: {
    GeoJsonLayer: typeof import("@deck.gl/layers").GeoJsonLayer;
    PathLayer: typeof import("@deck.gl/layers").PathLayer;
    ScatterplotLayer: typeof import("@deck.gl/layers").ScatterplotLayer;
    TextLayer: typeof import("@deck.gl/layers").TextLayer;
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Resolve the highlighted route pair to features + centroids; null when unmatchable. */
function resolveRoute(buildings: FeatureCollection | null, highlight: MapHighlight | null) {
  if (!buildings || highlight?.kind !== "route") return null;
  const from = findBuilding(buildings, highlight.from);
  const to = findBuilding(buildings, highlight.to);
  if (!from || !to) return null;
  const fromCenter = featureCentroid(from);
  const toCenter = featureCentroid(to);
  if (!fromCenter || !toCenter) return null;
  return { from, to, fromCenter, toCenter };
}

/** The first `t` (0..1) of the path, vertex-paced with the tip interpolated —
 *  drives the draw-on animation without TripsLayer. */
function partialPath(path: LngLat[], t: number): LngLat[] {
  if (t >= 1 || path.length < 2) return path;
  const progress = (path.length - 1) * Math.max(0, t);
  const i = Math.floor(progress);
  const frac = progress - i;
  const out = path.slice(0, i + 1);
  if (frac > 0 && i + 1 < path.length) {
    const [x0, y0] = path[i];
    const [x1, y1] = path[i + 1];
    out.push([x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac]);
  }
  return out;
}

export function CampusMap({ highlight, focusNonce, showRoutes, onStatus, controls }: CampusMapProps) {
  const api = useApi();
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const handlesRef = useRef<MapHandles | null>(null);
  const appliedStyleRef = useRef<ResolvedTheme | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [buildings, setBuildings] = useState<FeatureCollection | null>(null);
  const [walkingRoutes, setWalkingRoutes] = useState<FeatureCollection | null>(null);
  const [picked, setPicked] = useState<PickedBuilding | null>(null);
  /** Building whose details popup is open (click/tap on a footprint). */
  const [selected, setSelected] = useState<SelectedBuilding | null>(null);
  /** Pedestrian-network polyline for the current route highlight. */
  const [routePath, setRoutePath] = useState<{ key: string; path: LngLat[] } | null>(null);
  const [drawProgress, setDrawProgress] = useState(1);

  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    onStatusRef.current?.(status);
  }, [status]);

  // ---- Init: map + overlay (once) ----
  useEffect(() => {
    let disposed = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      try {
        const [maplibre, { MapboxOverlay }, layers] = await Promise.all([
          import("maplibre-gl"),
          import("@deck.gl/mapbox"),
          import("@deck.gl/layers"),
        ]);
        if (disposed) return;

        const initialTheme: ResolvedTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        appliedStyleRef.current = initialTheme;
        const map = new maplibre.Map({
          container,
          style: STYLE_URLS[initialTheme],
          center: INITIAL_VIEW.center,
          zoom: INITIAL_VIEW.zoom,
          pitch: INITIAL_VIEW.pitch,
          bearing: INITIAL_VIEW.bearing,
          minZoom: 13,
          maxZoom: 18,
          attributionControl: false,
        });
        // Bottom-left keeps the required attribution clear of the zoom stack.
        map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-left");

        const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
        map.addControl(overlay);

        if (process.env.NODE_ENV === "development") {
          (window as unknown as { __campusMap?: unknown }).__campusMap = map;
        }

        map.on("error", (event: { error?: Error }) => {
          // Style/tile failures (e.g. offline) → text fallback; transient tile
          // errors after load are ignored.
          if (!map.isStyleLoaded()) {
            setStatus("error");
          }
          console.warn("Map error", event.error?.message);
        });
        map.on("load", () => {
          if (!disposed) setStatus("ready");
        });

        handlesRef.current = {
          map,
          overlay,
          layerModules: {
            GeoJsonLayer: layers.GeoJsonLayer,
            PathLayer: layers.PathLayer,
            ScatterplotLayer: layers.ScatterplotLayer,
            TextLayer: layers.TextLayer,
          },
        };

        if (controls) {
          const duration = () => (prefersReducedMotion() ? 0 : 300);
          controls.current = {
            zoomIn: () => map.zoomIn({ duration: duration() }),
            zoomOut: () => map.zoomOut({ duration: duration() }),
            resetView: () =>
              map.flyTo({ ...INITIAL_VIEW, duration: prefersReducedMotion() ? 0 : 700, essential: true }),
          };
        }
      } catch (error) {
        console.warn("Map init failed", error);
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      const handles = handlesRef.current;
      handlesRef.current = null;
      if (handles) {
        handles.map.removeControl(handles.overlay);
        handles.map.remove();
      }
    };
    // `controls` is a stable ref from the parent; init runs exactly once per mount.
  }, [controls]);

  // ---- Data: buildings (required), walking routes (on demand) ----
  useEffect(() => {
    let cancelled = false;
    api
      .getGeo("buildings")
      .then((collection) => {
        if (!cancelled) setBuildings(collection);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    if (!showRoutes || walkingRoutes) return;
    let cancelled = false;
    api
      .getGeo("walking-routes")
      .then((collection) => {
        if (!cancelled) setWalkingRoutes(collection);
      })
      .catch(() => {
        // Optional layer — buildings and routes still work without it.
      });
    return () => {
      cancelled = true;
    };
  }, [api, showRoutes, walkingRoutes]);

  // ---- Route polyline: fetch the pedestrian-network path for a route highlight;
  // falls back to the straight centroid line if the fetch fails. ----
  useEffect(() => {
    if (highlight?.kind !== "route") {
      setRoutePath(null);
      return;
    }
    const key = `${highlight.from}|${highlight.to}`;
    let cancelled = false;
    api
      .getRoute(highlight.from, highlight.to)
      .then((route) => {
        if (!cancelled && route.polyline.length >= 2) setRoutePath({ key, path: route.polyline });
      })
      .catch(() => {
        if (cancelled) return;
        const route = resolveRoute(buildings, highlight);
        if (route) setRoutePath({ key, path: [route.fromCenter, route.toCenter] });
      });
    return () => {
      cancelled = true;
    };
    // `buildings` is intentionally read fresh only in the fallback; refetching on
    // its arrival is unnecessary — the highlight always changes after sign-in.
  }, [api, highlight, buildings]);

  // ---- Draw-on animation for the route trace ----
  useEffect(() => {
    if (!routePath) return;
    if (prefersReducedMotion()) {
      setDrawProgress(1);
      return;
    }
    setDrawProgress(0);
    let frame = 0;
    let start: number | undefined;
    let frameCount = 0;
    const tick = (now: number) => {
      start ??= now;
      const raw = Math.min(1, (now - start) / ROUTE_DRAW_MS);
      const t = 1 - Math.pow(1 - raw, 3); // ease-out cubic
      // Throttle state updates to every 3rd frame to reduce layer rebuilds
      frameCount++;
      if (frameCount % 3 === 0 || raw >= 1) {
        setDrawProgress(t);
      }
      if (raw < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [routePath]);

  // ---- Layers ----
  useEffect(() => {
    // `status` gates the pass so layers apply once the map reports ready.
    const handles = handlesRef.current;
    if (!handles || !buildings || status === "error") return;
    const { GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer } = handles.layerModules;
    const colors = MAP_COLORS[theme];
    const route = resolveRoute(buildings, highlight);
    const focusedBuildings = highlight?.kind === "buildings" ? highlight.buildings : [];
    const highlightedCodes = new Set(
      [route?.from, route?.to].map((f) => (f?.properties?.BLDG_CODE ?? "").toString().toUpperCase()).filter(Boolean),
    );
    for (const b of focusedBuildings) highlightedCodes.add(b.code.toUpperCase());
    if (selected) highlightedCodes.add(selected.code.toUpperCase());
    // Anchor building of a places search gets the highlight tint too.
    if (highlight?.kind === "places" && highlight.near) highlightedCodes.add(highlight.near.toUpperCase());
    const pins = highlight?.kind === "places" ? highlight.places : [];

    const isHighlighted = (feature: BuildingFeature) =>
      highlightedCodes.has((feature.properties?.BLDG_CODE ?? "").toString().toUpperCase());

    const endpoints = route
      ? [
          { center: route.fromCenter, feature: route.from, text: highlight?.kind === "route" ? highlight.from : "" },
          { center: route.toCenter, feature: route.to, text: highlight?.kind === "route" ? highlight.to : "" },
        ]
      : [];

    const layers = [
      showRoutes && walkingRoutes
        ? new GeoJsonLayer({
            id: "walking-routes",
            data: walkingRoutes,
            stroked: true,
            filled: false,
            getLineColor: colors.walkway,
            getLineWidth: 2,
            lineWidthUnits: "pixels" as const,
            lineCapRounded: true,
            lineJointRounded: true,
          })
        : null,
      new GeoJsonLayer({
        id: "buildings",
        data: buildings,
        extruded: true,
        wireframe: false,
        getElevation: (feature) => buildingHeight(feature as BuildingFeature),
        getFillColor: (feature) => (isHighlighted(feature as BuildingFeature) ? colors.fillHighlight : colors.fill),
        getLineColor: (feature) => (isHighlighted(feature as BuildingFeature) ? colors.lineHighlight : colors.line),
        stroked: true,
        getLineWidth: 1,
        lineWidthUnits: "pixels" as const,
        pickable: true,
        autoHighlight: true,
        highlightColor: [124, 158, 178, 120],
        transitions: { getFillColor: 300 },
        // Hover for pointers, click/tap for touch (Requirement 7.3: selecting a
        // building shows its name and code).
        onHover: (info) => {
          const properties = (info.object as BuildingFeature | undefined)?.properties;
          if (properties?.NAME || properties?.BLDG_CODE) {
            setPicked({
              name: String(properties.NAME ?? ""),
              code: String(properties.BLDG_CODE ?? ""),
              x: info.x,
              y: info.y,
            });
          } else {
            setPicked(null);
          }
        },
        // Click/tap opens the details popup (rooms, study rooms, services).
        onClick: (info) => {
          const properties = (info.object as BuildingFeature | undefined)?.properties;
          if (!properties?.BLDG_CODE) {
            setSelected(null);
            return;
          }
          setPicked(null);
          setSelected({
            code: String(properties.BLDG_CODE),
            name: String(properties.NAME ?? properties.BLDG_CODE),
            usage: properties.BLDG_USAGE != null ? String(properties.BLDG_USAGE) : null,
            floors: properties.MAX_FLOORS != null ? String(properties.MAX_FLOORS) : null,
            address: properties.PRIMARY_ADDRESS != null ? String(properties.PRIMARY_ADDRESS) : null,
          });
        },
        updateTriggers: {
          getFillColor: [theme, ...highlightedCodes],
          getLineColor: [theme, ...highlightedCodes],
        },
      }),
      routePath
        ? new PathLayer({
            id: "route-trace",
            data: [{ path: partialPath(routePath.path, drawProgress) }],
            getPath: (d: { path: LngLat[] }) => d.path,
            getColor: colors.route,
            getWidth: 5,
            widthUnits: "pixels" as const,
            capRounded: true,
            jointRounded: true,
            updateTriggers: { getPath: [routePath.key, drawProgress] },
          })
        : null,
      endpoints.length > 0
        ? new ScatterplotLayer({
            id: "route-endpoints",
            // Dots mark where the walk starts/ends — the entrances the polyline
            // connects, not the building centroids.
            data: (routePath
              ? [routePath.path[0], routePath.path[routePath.path.length - 1]].map((p) => ({ position: [...p, 2] }))
              : endpoints.map((e) => ({ position: [...e.center, buildingHeight(e.feature) + 4] }))) as {
              position: [number, number, number];
            }[],
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getRadius: 5,
            radiusUnits: "pixels" as const,
            getFillColor: colors.route,
            stroked: true,
            getLineColor: colors.routeCasing,
            getLineWidth: 3,
            lineWidthUnits: "pixels" as const,
          })
        : null,
      endpoints.length > 0
        ? new TextLayer({
            id: "route-labels",
            data: endpoints.map((e) => ({ position: [...e.center, buildingHeight(e.feature) + 10], text: e.text })),
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getText: (d: { text: string }) => d.text,
            getSize: 13,
            getColor: colors.label,
            background: true,
            getBackgroundColor: colors.labelBg,
            backgroundPadding: [6, 3],
            fontFamily: "Aspekta, ui-sans-serif, sans-serif",
            fontWeight: 600,
            getPixelOffset: [0, -14],
          })
        : null,
      pins.length > 0
        ? new ScatterplotLayer({
            id: "place-pins",
            data: pins.map((p) => ({ position: [p.lon, p.lat, 2] as [number, number, number] })),
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getRadius: 6,
            radiusUnits: "pixels" as const,
            getFillColor: colors.route,
            stroked: true,
            getLineColor: colors.routeCasing,
            getLineWidth: 2,
            lineWidthUnits: "pixels" as const,
          })
        : null,
      pins.length > 0
        ? new TextLayer({
            id: "place-labels",
            data: pins.map((p) => ({ position: [p.lon, p.lat, 2] as [number, number, number], text: p.name })),
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getText: (d: { text: string }) => d.text,
            getSize: 12,
            getColor: colors.label,
            background: true,
            getBackgroundColor: colors.labelBg,
            backgroundPadding: [5, 2],
            fontFamily: "Aspekta, ui-sans-serif, sans-serif",
            fontWeight: 600,
            getPixelOffset: [0, -16],
          })
        : null,
      focusedBuildings.length > 0
        ? new TextLayer({
            id: "building-labels",
            data: focusedBuildings.map((b) => {
              const feature = findBuilding(buildings, b.code);
              const center = (feature && featureCentroid(feature)) ?? [b.lon, b.lat];
              return {
                position: [...center, feature ? buildingHeight(feature) + 10 : 10] as [number, number, number],
                text: b.name,
              };
            }),
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getText: (d: { text: string }) => d.text,
            getSize: 13,
            getColor: colors.label,
            background: true,
            getBackgroundColor: colors.labelBg,
            backgroundPadding: [6, 3],
            fontFamily: "Aspekta, ui-sans-serif, sans-serif",
            fontWeight: 600,
            getPixelOffset: [0, -14],
          })
        : null,
    ].filter(Boolean);

    handles.overlay.setProps({ layers });
  }, [buildings, walkingRoutes, showRoutes, highlight, theme, status, routePath, drawProgress, selected]);

  // ---- Theme: swap basemap style (appliedStyleRef is seeded at init, so a
  // toggle that lands while the first style is still loading applies at ready) ----
  useEffect(() => {
    const handles = handlesRef.current;
    if (!handles || status !== "ready") return;
    if (appliedStyleRef.current !== theme) {
      appliedStyleRef.current = theme;
      const el = containerRef.current;
      const fade = !prefersReducedMotion() && el;
      if (fade) {
        el.style.transition = "opacity 200ms ease-out";
        el.style.opacity = "0";
      }
      // ponytail: swap after fade-out completes (or immediately if reduced motion)
      const apply = () => {
        handles.map.setStyle(STYLE_URLS[theme]);
        handles.map.once("style.load", () => {
          if (fade) {
            el.style.opacity = "1";
          }
        });
      };
      if (fade) setTimeout(apply, 200);
      else apply();
    }
  }, [theme, status]);

  // ---- Camera: focus the highlight (re-runs on "Show on map" bumps) ----
  useEffect(() => {
    void focusNonce;
    const handles = handlesRef.current;
    if (!handles || status !== "ready" || !highlight) return;
    const duration = prefersReducedMotion() ? 0 : 2000;

    if (highlight.kind === "buildings") {
      if (highlight.buildings.length === 1) {
        const b = highlight.buildings[0];
        handles.map.flyTo({ center: [b.lon, b.lat], zoom: 16.8, pitch: 55, duration, essential: true });
      } else if (highlight.buildings.length > 1) {
        const lons = highlight.buildings.map((b) => b.lon);
        const lats = highlight.buildings.map((b) => b.lat);
        handles.map.fitBounds(
          [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)],
          ],
          { padding: 90, duration: prefersReducedMotion() ? 0 : 700, maxZoom: 16.6 },
        );
      }
      return;
    }

    if (highlight.kind === "places") {
      const anchor = highlight.near && buildings ? findBuilding(buildings, highlight.near) : null;
      const anchorCenter = anchor ? featureCentroid(anchor) : null;
      const points = [...highlight.places.map((p): LngLat => [p.lon, p.lat]), ...(anchorCenter ? [anchorCenter] : [])];
      const lons = points.map((p) => p[0]);
      const lats = points.map((p) => p[1]);
      handles.map.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 90, duration: prefersReducedMotion() ? 0 : 700, maxZoom: 16.6 },
      );
      return;
    }

    const route = resolveRoute(buildings, highlight);
    if (!route) return;
    const bounds = featuresBounds([route.from, route.to]);
    if (!bounds) return;
    // Widen to cover the traced polyline, which can detour outside the
    // footprints' box.
    for (const [x, y] of routePath?.path ?? []) {
      if (x < bounds.west) bounds.west = x;
      if (x > bounds.east) bounds.east = x;
      if (y < bounds.south) bounds.south = y;
      if (y > bounds.north) bounds.north = y;
    }
    handles.map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: 90, duration: prefersReducedMotion() ? 0 : 700, maxZoom: 16.6 },
    );
  }, [buildings, highlight, focusNonce, status, routePath]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Interactive campus map"
        aria-roledescription="map"
      />
      {selected && <BuildingPopup building={selected} onClose={() => setSelected(null)} />}
      {picked && (picked.name || picked.code) && (
        <div
          className="bg-surface-bright pointer-events-none absolute z-10 max-w-60 rounded-lg px-3 py-2 shadow-md"
          style={{ left: picked.x + 12, top: picked.y + 12 }}
          role="status"
        >
          {picked.name && <p className="text-on-surface text-sm leading-snug font-medium">{picked.name}</p>}
          {picked.code && <p className="text-on-surface-variant mt-0.5 font-mono text-xs">{picked.code}</p>}
        </div>
      )}
      {highlight && (
        <p className="sr-only" role="status">
          {highlight.kind === "route"
            ? `Route displayed on map: ${highlight.from} to ${highlight.to}, ${formatMeters(highlight.meters)}, ${formatMinutes(highlight.minutes)} walk.`
            : highlight.kind === "buildings"
              ? `Highlighted on map: ${highlight.buildings.map((b) => `${b.name} (${b.code})`).join(", ")}.`
              : `${highlight.places.length} places marked on map${highlight.near ? ` near ${highlight.near}` : ""}.`}
        </p>
      )}
    </div>
  );
}
