import { haversineMeters } from "./modules/buildings";
import { dataBucket } from "./s3";

/** Shortest walking routes over the campus pedestrian network
 *  (walking-routes.geojson, derived at ingest from ubcv_routes.geojson). */

export const WALK_SPEED_M_PER_MIN = 80;
const ESTIMATE_DETOUR = 1.3; // fallback when the network can't connect two points

export type LonLat = [number, number];

export interface RouteResult {
  meters: number;
  minutes: number;
  /** "network" = shortest path over walking paths; "estimate" = straight-line fallback */
  method: "network" | "estimate";
  polyline: LonLat[]; // GeoJSON coordinate order, building to building
}

export interface Graph {
  coords: LonLat[]; // node id -> coordinate
  adj: { to: number; w: number }[][]; // node id -> edges
}

// biome-ignore lint/suspicious/noExplicitAny: raw GeoJSON features
type Feature = Record<string, any>;

const key = (c: LonLat) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
const toPoint = (c: LonLat) => ({ lon: c[0], lat: c[1] });

/** Nodes are shared line endpoints/vertices; edges are consecutive vertices. */
export function buildGraph(features: Feature[]): Graph {
  const ids = new Map<string, number>();
  const coords: LonLat[] = [];
  const adj: { to: number; w: number }[][] = [];
  const nodeOf = (c: LonLat): number => {
    const k = key(c);
    let id = ids.get(k);
    if (id === undefined) {
      id = coords.length;
      ids.set(k, id);
      coords.push(c);
      adj.push([]);
    }
    return id;
  };
  for (const f of features) {
    const g = f?.geometry;
    if (!g) continue;
    const lines: LonLat[][] = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
    for (const line of lines) {
      for (let i = 1; i < line.length; i++) {
        const a = nodeOf(line[i - 1]);
        const b = nodeOf(line[i]);
        const w = haversineMeters(toPoint(line[i - 1]), toPoint(line[i]));
        adj[a].push({ to: b, w });
        adj[b].push({ to: a, w });
      }
    }
  }
  return { coords, adj };
}

export function nearestNode(graph: Graph, p: { lat: number; lon: number }): number {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < graph.coords.length; i++) {
    const d = haversineMeters(p, toPoint(graph.coords[i]));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** Dijkstra with a binary heap; returns node path or null if unreachable. */
export function shortestPath(graph: Graph, from: number, to: number): number[] | null {
  const dist = new Array<number>(graph.coords.length).fill(Infinity);
  const prev = new Array<number>(graph.coords.length).fill(-1);
  dist[from] = 0;
  // heap of [dist, node]
  const heap: [number, number][] = [[0, from]];
  const push = (e: [number, number]) => {
    heap.push(e);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): [number, number] | undefined => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0 && last) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  for (;;) {
    const top = pop();
    if (!top) return null;
    const [d, u] = top;
    if (u === to) break;
    if (d > dist[u]) continue; // stale entry
    for (const { to: v, w } of graph.adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        push([nd, v]);
      }
    }
  }
  const path = [to];
  while (path[0] !== from) {
    const p = prev[path[0]];
    if (p === -1) return null;
    path.unshift(p);
  }
  return path;
}

/** Pure routing over a prebuilt graph; falls back to a straight-line estimate
 *  when either endpoint snaps into a disconnected part of the network. */
export function routeOnGraph(
  graph: Graph,
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): RouteResult {
  const estimate = (): RouteResult => {
    const meters = Math.round(haversineMeters(from, to) * ESTIMATE_DETOUR);
    return {
      meters,
      minutes: Math.ceil(meters / WALK_SPEED_M_PER_MIN),
      method: "estimate",
      polyline: [
        [from.lon, from.lat],
        [to.lon, to.lat],
      ],
    };
  };
  if (graph.coords.length === 0) return estimate();
  const a = nearestNode(graph, from);
  const b = nearestNode(graph, to);
  const path = shortestPath(graph, a, b);
  if (!path) return estimate();
  let meters = haversineMeters(from, toPoint(graph.coords[a])) + haversineMeters(to, toPoint(graph.coords[b]));
  for (let i = 1; i < path.length; i++) {
    meters += haversineMeters(toPoint(graph.coords[path[i - 1]]), toPoint(graph.coords[path[i]]));
  }
  meters = Math.round(meters);
  return {
    meters,
    minutes: Math.ceil(meters / WALK_SPEED_M_PER_MIN),
    method: "network",
    polyline: [[from.lon, from.lat], ...path.map((n) => graph.coords[n]), [to.lon, to.lat]],
  };
}

let graphPromise: Promise<Graph> | undefined;

/** Preload the graph from raw features — local dev/tests without S3. */
export function primeGraph(features: Feature[]): void {
  graphPromise = Promise.resolve(buildGraph(features));
}

/** Lazy singleton graph from the derived walking-routes artifact in S3. */
export function getGraph(): Promise<Graph> {
  graphPromise ??= dataBucket()
    .getJson("derived/walking-routes.geojson")
    .then((geo) => buildGraph((geo as { features: Feature[] }).features))
    .catch((e) => {
      graphPromise = undefined; // don't cache a failed load
      throw e;
    });
  return graphPromise;
}

export async function route(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): Promise<RouteResult> {
  return routeOnGraph(await getGraph(), from, to);
}
