import type { DatasetModule, OsClient } from "../core/types";
import { route } from "../routing";

export interface BuildingDoc {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

// biome-ignore lint/suspicious/noExplicitAny: raw GeoJSON features
type Feature = Record<string, any>;

const BUILDINGS_KEY = "geospatial/ubcv/locations/geojson/ubcv_buildings.geojson";
const ROUTES_KEY = "geospatial/ubcv/transportation/geojson/ubcv_routes.geojson";
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

export function transformBuilding(f: Feature): { _id: string; doc: BuildingDoc } | null {
  const code = f?.properties?.BLDG_CODE;
  if (!code) return null;
  const { lat, lon } = centroid(f.geometry);
  return { _id: code, doc: { code, name: f.properties.NAME ?? code, lat, lon } };
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
        // pedestrian-only route lines, properties stripped — serves both the
        // map overlay and the routing graph (src/server/routing.ts)
        const routes = (await s3.getJson(ROUTES_KEY)) as { features: Feature[] };
        await s3.putJson(WALKING_ROUTES_KEY, {
          type: "FeatureCollection",
          features: routes.features
            .filter((f) => f.properties?.PEDESTRIAN_ACCESS === "Y")
            .map((f) => ({ type: "Feature", properties: {}, geometry: f.geometry })),
        });
      },
    },
  ],
  tools: [
    {
      spec: {
        name: "walking_distance",
        description:
          "Walking distance and time between two UBC Vancouver buildings, by building code or name, routed over the campus pedestrian path network.",
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
        // polyline stays out of the model context — /api/route serves it to the map
        const { meters, minutes, method } = await route(from, to);
        return { from: from.code, to: to.code, meters, minutes, method };
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
