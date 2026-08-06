import type { DatasetModule, OsClient } from "../core/types";
import { type BuildingDoc, haversineMeters, resolveBuilding } from "./buildings";

export interface PoiDoc {
  id: string;
  name: string;
  abbreviation: string | null;
  service_type: string | null; // cafe, restaurant, library, grocery, bank, ...
  url: string | null;
  contact: string | null;
  hours: string | null; // free text — return verbatim, never parse
  lat: number;
  lon: number;
}

// biome-ignore lint/suspicious/noExplicitAny: raw GeoJSON features
type Feature = Record<string, any>;

export function transformPoi(f: Feature): { _id: string; doc: PoiDoc } | null {
  const p = f?.properties ?? {};
  const coords = f?.geometry?.coordinates;
  if (!p.PLACENAME || !Array.isArray(coords)) return null;
  if (p.STATUS && p.STATUS !== "Current") return null;
  return {
    _id: String(p.POI_ID ?? p.OBJECTID),
    doc: {
      id: String(p.POI_ID ?? p.OBJECTID),
      name: String(p.PLACENAME),
      abbreviation: p.ABBREVIATEDPLACENAME ?? null,
      service_type: p.SERVICE_TYPE ?? null,
      url: p.URL ?? null,
      contact: p.CONTACT ?? null,
      hours: p.HOURS ?? null,
      lon: coords[0],
      lat: coords[1],
    },
  };
}

/** Straight-line walk estimate to each item, nearest first — same detour
 *  factor and speed as the routing fallback (src/server/routing.ts). Ranking
 *  stays on haversine deliberately; only walking_distance/api-route use the
 *  path network. */
// ponytail: haversine over ≤500 docs sorted in JS, no geo_point mapping; move to OpenSearch geo queries if datasets grow
export function nearestFirst<T extends { lat: number; lon: number }>(
  items: T[],
  from: BuildingDoc,
): (T & { walk_meters: number; walk_minutes: number })[] {
  return items
    .map((item) => {
      const walk_meters = Math.round(haversineMeters(from, item) * 1.3);
      return { ...item, walk_meters, walk_minutes: Math.ceil(walk_meters / 80) };
    })
    .sort((a, b) => a.walk_meters - b.walk_meters);
}

export async function searchNearable<T extends { lat: number; lon: number }>(
  os: OsClient,
  index: string,
  must: Record<string, unknown>[],
  filter: Record<string, unknown>[],
  nearBuilding: unknown,
  limit: number,
): Promise<{ results: T[]; near?: BuildingDoc }> {
  const res = await os.search({
    index,
    body: {
      query: { bool: { must: must.length > 0 ? must : [{ match_all: {} }], filter } },
      size: nearBuilding ? 500 : limit, // fetch all candidates, sort by walk in JS
    },
  });
  let results = res.body.hits.hits.map((h) => h._source as T);
  if (!nearBuilding) return { results };
  const near = await resolveBuilding(os, String(nearBuilding));
  results = nearestFirst(results, near).slice(0, limit);
  return { results, near };
}

export const places: DatasetModule = {
  name: "places",
  indices: [
    {
      index: "poi",
      mappings: {
        properties: {
          id: { type: "keyword" },
          name: { type: "text" },
          abbreviation: { type: "text" },
          service_type: { type: "keyword" },
          url: { type: "keyword" },
          contact: { type: "text" },
          hours: { type: "text" },
          lat: { type: "float" },
          lon: { type: "float" },
        },
      },
      async *read(s3) {
        yield* ((await s3.getJson("geospatial/ubcv/locations/geojson/ubcv_poi.geojson")) as { features: Feature[] })
          .features;
      },
      transform: transformPoi,
    },
  ],
  tools: [
    {
      spec: {
        name: "find_places",
        description:
          "Find points of interest on UBC Vancouver campus: cafes, restaurants, libraries, groceries, banks, medical services, child care, transit. Optionally sorted by walking distance from a building. Hours are free text — quote them as-is.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: 'Optional name keywords, e.g. "Tim Hortons"' },
              service_type: {
                type: "string",
                description:
                  'Optional type filter: "cafe", "restaurant", "library", "grocery", "bank", "medical", "child_care", "transit", "campus_services", "commercial_services", "academic"',
              },
              near_building: {
                type: "string",
                description: "Optional building code or name to sort results by walking distance from",
              },
              limit: { type: "number", description: "Max results (default 10)" },
            },
            required: [],
          },
        },
      },
      async execute(input, os) {
        const must: Record<string, unknown>[] = [];
        if (input.query) must.push({ multi_match: { query: String(input.query), fields: ["name^2", "abbreviation"] } });
        const filter: Record<string, unknown>[] = [];
        if (input.service_type) filter.push({ term: { service_type: String(input.service_type) } });
        const limit = Math.min(Number(input.limit) || 10, 30);
        const { results, near } = await searchNearable<PoiDoc>(os, "poi", must, filter, input.near_building, limit);
        if (results.length === 0) throw new Error(`No places matched "${input.query ?? input.service_type ?? ""}"`);
        return { ...(near ? { near_building: near.code } : {}), places: results };
      },
    },
  ],
};
