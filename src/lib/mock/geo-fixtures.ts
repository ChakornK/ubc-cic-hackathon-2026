// Mock stand-ins for /api/geo/* — plausible UBC Vancouver footprints so map work
// proceeds without the deployed stack. Replaced by real ubcv_buildings.geojson via task 5.1.

import type { FeatureCollection, LineString, Polygon } from "geojson";

interface MockBuilding {
  code: string;
  name: string;
  /** Footprint centroid. */
  lngLat: [number, number];
  /** Footprint size in meters (width along campus grid, depth across). */
  size: [number, number];
  /** Rotation in degrees off north-south, matching UBC's slightly tilted grid. */
  rotation?: number;
}

const CAMPUS_GRID_ROTATION = 7;

const MOCK_BUILDINGS: MockBuilding[] = [
  { code: "ICCS", name: "Institute for Computing, Information and Cognitive Systems", lngLat: [-123.24887, 49.26118], size: [80, 55] },
  { code: "IKB", name: "Irving K. Barber Learning Centre", lngLat: [-123.25255, 49.26765], size: [95, 60] },
  { code: "NEST", name: "AMS Student Nest", lngLat: [-123.2496, 49.26643], size: [75, 65] },
  { code: "BUCH", name: "Buchanan", lngLat: [-123.25453, 49.26937], size: [90, 45] },
  { code: "ESB", name: "Earth Sciences Building", lngLat: [-123.25219, 49.26259], size: [70, 50] },
  { code: "MATH", name: "Mathematics", lngLat: [-123.25546, 49.26641], size: [55, 40] },
  { code: "ANGU", name: "Henry Angus", lngLat: [-123.25376, 49.26486], size: [85, 55] },
  { code: "LSK", name: "Leonard S. Klinck", lngLat: [-123.25522, 49.26618], size: [60, 45] },
  { code: "WOOD", name: "Woodward Instructional Resources Centre", lngLat: [-123.24765, 49.26456], size: [80, 60] },
  { code: "HEBB", name: "Hebb", lngLat: [-123.25189, 49.26622], size: [45, 40] },
  { code: "FSC", name: "Forest Sciences Centre", lngLat: [-123.24773, 49.26056], size: [85, 60] },
  { code: "CHBE", name: "Chemical and Biological Engineering", lngLat: [-123.24699, 49.26264], size: [70, 50] },
  { code: "ALRD", name: "Allard Hall", lngLat: [-123.25327, 49.26991], size: [75, 50] },
  { code: "KAIS", name: "Fred Kaiser", lngLat: [-123.24911, 49.26198], size: [60, 45] },
];

const METERS_PER_DEG_LAT = 111_320;

function metersToDegrees([lng, lat]: [number, number], dxMeters: number, dyMeters: number): [number, number] {
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  return [lng + dxMeters / metersPerDegLng, lat + dyMeters / METERS_PER_DEG_LAT];
}

function footprint({ lngLat, size, rotation = CAMPUS_GRID_ROTATION }: MockBuilding): Polygon {
  const [w, d] = size;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners: [number, number][] = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ];
  const ring = corners.map(([x, y]) => metersToDegrees(lngLat, x * cos - y * sin, x * sin + y * cos));
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

export const mockBuildingsGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: MOCK_BUILDINGS.map((b) => ({
    type: "Feature",
    properties: { BLDG_CODE: b.code, NAME: b.name },
    geometry: footprint(b),
  })),
};

// A few pedestrian spines: Main Mall, East Mall, University Boulevard, Agronomy Road.
const MOCK_ROUTES: [number, number][][] = [
  // Main Mall, north–south
  [
    [-123.25604, 49.27091],
    [-123.25522, 49.26837],
    [-123.25443, 49.26599],
    [-123.25352, 49.26324],
    [-123.25279, 49.26102],
    [-123.25219, 49.25921],
  ],
  // East Mall
  [
    [-123.25156, 49.27113],
    [-123.25075, 49.26868],
    [-123.24994, 49.26625],
    [-123.24906, 49.26362],
    [-123.24836, 49.26148],
  ],
  // University Boulevard, east–west
  [
    [-123.24601, 49.26618],
    [-123.24905, 49.26643],
    [-123.25214, 49.26668],
    [-123.25517, 49.26694],
  ],
  // Agronomy Road
  [
    [-123.24581, 49.26094],
    [-123.24902, 49.26119],
    [-123.25234, 49.26146],
  ],
  // Diagonal connector past ICCS toward the Nest
  [
    [-123.24887, 49.26155],
    [-123.24919, 49.26332],
    [-123.24943, 49.26506],
    [-123.2496, 49.26612],
  ],
];

export const mockWalkingRoutesGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: MOCK_ROUTES.map((coordinates) => ({
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates } satisfies LineString,
  })),
};
