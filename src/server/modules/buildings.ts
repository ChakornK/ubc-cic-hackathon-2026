import type { DatasetModule, OsClient, S3Reader } from "../core/types";

export interface BuildingDoc {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export interface WalkingDistanceDoc {
  from: string; // building codes, from < to lexicographically
  to: string;
  meters: number;
  minutes: number;
}

// biome-ignore lint/suspicious/noExplicitAny: raw GeoJSON features
type Feature = Record<string, any>;

const BUILDINGS_KEY = "geospatial/ubcv/locations/geojson/ubcv_buildings.geojson";
const ROUTES_KEY = "geospatial/ubcv/transportation/geojson/ubcv_routes.geojson";
const DISTANCES_KEY = "derived/walking_distances.json";
const WALKING_ROUTES_KEY = "derived/walking-routes.geojson";

/** Average of all footprint vertices — good enough for walking estimates. */
export function centroid(geometry: Feature): { lat: number; lon: number } {
  let latSum = 0;
  let lonSum = 0;
  let n = 0;
  const walk = (c: unknown) => {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === "number" && typeof c[1] === "number") {
      lonSum += c[0];
      latSum += c[1];
      n++;
    } else {
      for (const child of c) walk(child);
    }
  };
  walk(geometry?.coordinates);
  return { lat: latSum / n, lon: lonSum / n };
}

export function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export function transformBuilding(f: Feature): { _id: string; doc: BuildingDoc } | null {
  const code = f?.properties?.BLDG_CODE;
  if (!code) return null;
  const { lat, lon } = centroid(f.geometry);
  return { _id: code, doc: { code, name: f.properties.NAME ?? code, lat, lon } };
}

async function readBuildings(s3: S3Reader): Promise<BuildingDoc[]> {
  const geo = (await s3.getJson(BUILDINGS_KEY)) as { features: Feature[] };
  return geo.features
    .map(transformBuilding)
    .filter((t) => t !== null)
    .map((t) => t.doc);
}

/** All pairs (from < to): haversine × 1.3 detour factor, 80 m/min walking speed. */
export function pairwiseDistances(buildings: BuildingDoc[]): WalkingDistanceDoc[] {
  const sorted = [...buildings].sort((a, b) => (a.code < b.code ? -1 : 1));
  const pairs: WalkingDistanceDoc[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const meters = Math.round(haversineMeters(sorted[i], sorted[j]) * 1.3);
      pairs.push({ from: sorted[i].code, to: sorted[j].code, meters, minutes: Math.ceil(meters / 80) });
    }
  }
  return pairs;
}

export async function resolveBuilding(os: OsClient, query: string): Promise<BuildingDoc> {
  const norm = query.trim().toUpperCase();
  try {
    const res = await os.get({ index: "buildings", id: norm });
    return res.body._source as BuildingDoc;
  } catch {
    const res = await os.search({
      index: "buildings",
      body: { query: { multi_match: { query, fields: ["code^2", "name"] } }, size: 1 },
    });
    const hit = res.body.hits.hits[0];
    if (!hit) throw new Error(`Unknown building: "${query}"`);
    return hit._source as BuildingDoc;
  }
}

export const buildings: DatasetModule = {
  name: "buildings",
  indices: [
    {
      index: "buildings",
      mappings: {
        properties: {
          code: { type: "keyword" },
          name: { type: "text" },
          lat: { type: "float" },
          lon: { type: "float" },
        },
      },
      async *read(s3) {
        yield* ((await s3.getJson(BUILDINGS_KEY)) as { features: Feature[] }).features;
      },
      transform: transformBuilding,
      async derive(s3) {
        // pairwise walking distances, written back to the bucket and then indexed
        await s3.putJson(DISTANCES_KEY, pairwiseDistances(await readBuildings(s3)));
        // pedestrian-only route lines for the map, properties stripped
        const routes = (await s3.getJson(ROUTES_KEY)) as { features: Feature[] };
        await s3.putJson(WALKING_ROUTES_KEY, {
          type: "FeatureCollection",
          features: routes.features
            .filter((f) => f.properties?.PEDESTRIAN_ACCESS === "Y")
            .map((f) => ({ type: "Feature", properties: {}, geometry: f.geometry })),
        });
      },
    },
    {
      index: "walking_distances",
      mappings: {
        properties: {
          from: { type: "keyword" },
          to: { type: "keyword" },
          meters: { type: "float" },
          minutes: { type: "integer" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson(DISTANCES_KEY)) as WalkingDistanceDoc[];
      },
      transform(doc: WalkingDistanceDoc) {
        return { _id: `${doc.from}#${doc.to}`, doc };
      },
    },
  ],
  tools: [
    {
      spec: {
        name: "walking_distance",
        description:
          "Estimated walking distance and time between two UBC Vancouver buildings, by building code or name.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              from_building: {
                type: "string",
                description: 'Building code or name, e.g. "ICCS" or "Irving K. Barber"',
              },
              to_building: { type: "string", description: 'Building code or name, e.g. "BUCH"' },
            },
            required: ["from_building", "to_building"],
          },
        },
      },
      async execute(input, os) {
        const from = await resolveBuilding(os, String(input.from_building ?? ""));
        const to = await resolveBuilding(os, String(input.to_building ?? ""));
        if (from.code === to.code) return { from: from.code, to: to.code, meters: 0, minutes: 0 };
        // pairs are stored once (from < to) — try both orderings
        for (const id of [`${from.code}#${to.code}`, `${to.code}#${from.code}`]) {
          try {
            const res = await os.get({ index: "walking_distances", id });
            const doc = res.body._source as WalkingDistanceDoc;
            return { from: from.code, to: to.code, meters: doc.meters, minutes: doc.minutes };
          } catch {
            // not this ordering
          }
        }
        throw new Error(`No walking distance found between ${from.code} and ${to.code}`);
      },
    },
    {
      spec: {
        name: "find_building",
        description:
          "Resolve a UBC Vancouver building by name or code to its official building code, full name, and coordinates. Use this to get the code other tools need.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: 'Building name or code, e.g. "Irving K. Barber" or "ICCS"' },
            },
            required: ["query"],
          },
        },
      },
      async execute(input, os) {
        return await resolveBuilding(os, String(input.query ?? ""));
      },
    },
  ],
  geo: [
    { name: "buildings", s3Key: BUILDINGS_KEY },
    { name: "walking-routes", s3Key: WALKING_ROUTES_KEY },
  ],
};
