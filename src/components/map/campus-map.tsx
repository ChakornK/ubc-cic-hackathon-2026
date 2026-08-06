"use client";

// Campus_Map (tasks 4.1/4.2): deck.gl v9 layers over a MapLibre basemap.
// Buildings come from /api/geo/buildings (cached client-side by the api layer)
// with a pick-tooltip showing NAME / BLDG_CODE; walking routes are an optional
// context layer; a walking_distance highlight tints both footprints and draws
// the centroid-to-centroid route labeled with meters / minutes.
//
// maplibre + deck are imported dynamically inside the init effect so the ~1 MB
// of map code stays out of the initial bundle (and out of SSR).

import type { WalkingHighlight } from "@/src/components/chat/chat-shell-context";
import { useApi } from "@/src/components/providers";
import { useTheme, type ResolvedTheme } from "@/src/components/providers";
import { formatMeters, formatMinutes } from "@/src/lib/format";
import {
  featureCentroid,
  featuresBounds,
  findBuilding,
  type BuildingFeature,
  type LngLat,
} from "@/src/lib/geo";
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
  highlight: WalkingHighlight | null;
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

const MAP_COLORS: Record<ResolvedTheme, Record<"fill" | "line" | "fillHighlight" | "lineHighlight" | "route" | "routeCasing" | "label" | "labelBg" | "walkway", Rgba>> = {
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

const BUILDING_HEIGHT = 13;

interface MapHandles {
  map: import("maplibre-gl").Map;
  overlay: import("@deck.gl/mapbox").MapboxOverlay;
  layerModules: {
    GeoJsonLayer: typeof import("@deck.gl/layers").GeoJsonLayer;
    PathLayer: typeof import("@deck.gl/layers").PathLayer;
    ScatterplotLayer: typeof import("@deck.gl/layers").ScatterplotLayer;
    TextLayer: typeof import("@deck.gl/layers").TextLayer;
    PathStyleExtension: typeof import("@deck.gl/extensions").PathStyleExtension;
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Resolve the highlighted pair to features + centroids; null when unmatchable. */
function resolveRoute(buildings: FeatureCollection | null, highlight: WalkingHighlight | null) {
  if (!buildings || !highlight) return null;
  const from = findBuilding(buildings, highlight.from);
  const to = findBuilding(buildings, highlight.to);
  if (!from || !to) return null;
  const fromCenter = featureCentroid(from);
  const toCenter = featureCentroid(to);
  if (!fromCenter || !toCenter) return null;
  return { from, to, fromCenter, toCenter };
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
        const [maplibre, { MapboxOverlay }, layers, extensions] = await Promise.all([
          import("maplibre-gl"),
          import("@deck.gl/mapbox"),
          import("@deck.gl/layers"),
          import("@deck.gl/extensions"),
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
            PathStyleExtension: extensions.PathStyleExtension,
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

  // ---- Theme: swap basemap style (appliedStyleRef is seeded at init, so a
  // toggle that lands while the first style is still loading applies at ready) ----
  useEffect(() => {
    const handles = handlesRef.current;
    if (!handles || status !== "ready") return;
    if (appliedStyleRef.current !== theme) {
      appliedStyleRef.current = theme;
      handles.map.setStyle(STYLE_URLS[theme]);
    }
  }, [theme, status]);

  // ---- Layers ----
  useEffect(() => {
    // `status` gates the pass so layers apply once the map reports ready.
    const handles = handlesRef.current;
    if (!handles || !buildings || status === "error") return;
    const { GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer, PathStyleExtension } = handles.layerModules;
    const colors = MAP_COLORS[theme];
    const route = resolveRoute(buildings, highlight);
    const highlightedCodes = new Set(
      [route?.from, route?.to]
        .map((f) => (f?.properties?.BLDG_CODE ?? "").toString().toUpperCase())
        .filter(Boolean),
    );

    const isHighlighted = (feature: BuildingFeature) =>
      highlightedCodes.has((feature.properties?.BLDG_CODE ?? "").toString().toUpperCase());

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
        getElevation: BUILDING_HEIGHT,
        getFillColor: (feature) => (isHighlighted(feature as BuildingFeature) ? colors.fillHighlight : colors.fill),
        getLineColor: (feature) => (isHighlighted(feature as BuildingFeature) ? colors.lineHighlight : colors.line),
        stroked: true,
        getLineWidth: 1,
        lineWidthUnits: "pixels" as const,
        pickable: true,
        autoHighlight: true,
        highlightColor: [124, 158, 178, 120],
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
        onClick: (info) => {
          const properties = (info.object as BuildingFeature | undefined)?.properties;
          setPicked(
            properties?.NAME || properties?.BLDG_CODE
              ? {
                  name: String(properties.NAME ?? ""),
                  code: String(properties.BLDG_CODE ?? ""),
                  x: info.x,
                  y: info.y,
                }
              : null,
          );
        },
        updateTriggers: {
          getFillColor: [theme, ...highlightedCodes],
          getLineColor: [theme, ...highlightedCodes],
        },
      }),
      route
        ? new PathLayer({
            id: "route-line",
            data: [{ path: [route.fromCenter, route.toCenter] }],
            getPath: (d: { path: LngLat[] }) => d.path,
            getColor: colors.route,
            getWidth: 4,
            widthUnits: "pixels" as const,
            capRounded: true,
            jointRounded: true,
            // Dash units are relative to path width (4 px) → 12 px dash, 8 px gap.
            getDashArray: [3, 2],
            dashJustified: true,
            extensions: [new PathStyleExtension({ dash: true })],
          })
        : null,
      route
        ? new ScatterplotLayer({
            id: "route-endpoints",
            data: [
              { position: [...route.fromCenter, BUILDING_HEIGHT + 4], radius: 5 },
              { position: [...route.toCenter, BUILDING_HEIGHT + 4], radius: 6 },
            ],
            getPosition: (d: { position: [number, number, number] }) => d.position,
            getRadius: (d: { radius: number }) => d.radius,
            radiusUnits: "pixels" as const,
            getFillColor: colors.route,
            stroked: true,
            getLineColor: colors.routeCasing,
            getLineWidth: 3,
            lineWidthUnits: "pixels" as const,
          })
        : null,
      route && highlight
        ? new TextLayer({
            id: "route-labels",
            data: [
              { position: [...route.fromCenter, BUILDING_HEIGHT + 10], text: highlight.from },
              { position: [...route.toCenter, BUILDING_HEIGHT + 10], text: highlight.to },
            ],
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
  }, [buildings, walkingRoutes, showRoutes, highlight, theme, status]);

  // ---- Camera: focus the highlighted route (re-runs on "Show on map" bumps) ----
  useEffect(() => {
    void focusNonce;
    const handles = handlesRef.current;
    if (!handles || status !== "ready") return;
    const route = resolveRoute(buildings, highlight);
    if (!route) return;
    const bounds = featuresBounds([route.from, route.to]);
    if (!bounds) return;
    handles.map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: 90, duration: prefersReducedMotion() ? 0 : 700, maxZoom: 16.6 },
    );
  }, [buildings, highlight, focusNonce, status]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {picked && (picked.name || picked.code) && (
        <div
          className="pointer-events-none absolute z-10 max-w-60 rounded-lg border border-border bg-surface-bright px-3 py-2 shadow-md"
          style={{ left: picked.x + 12, top: picked.y + 12 }}
          role="status"
        >
          {picked.name && <p className="text-sm font-medium leading-snug text-on-surface">{picked.name}</p>}
          {picked.code && <p className="mt-0.5 font-mono text-xs text-on-surface-variant">{picked.code}</p>}
        </div>
      )}
      {highlight && (
        <p className="sr-only" role="status">
          Route displayed on map: {highlight.from} to {highlight.to}, {formatMeters(highlight.meters)},{" "}
          {formatMinutes(highlight.minutes)} walk.
        </p>
      )}
    </div>
  );
}
