import type { BuildingDetails } from "@/src/lib/api-types";
import { pointInFeature, type BuildingFeature } from "@/src/lib/geo";
import { requireUser } from "@/src/server/auth";
import { summarizeAvailability, toPoiCard, toRoomCard } from "@/src/server/building-details";
import { getBuildingsGeoJson, resolveBuilding } from "@/src/server/modules/buildings";
import type { PoiDoc } from "@/src/server/modules/places";
import type { AvailabilityDoc, LibRoomDoc, StudySpaceDoc } from "@/src/server/modules/spaces";
import { getOsClient } from "@/src/server/search";
import { json, serverError } from "../../http";

/** GET /api/building/{code} — everything the map's building popup shows:
 *  learning-space rooms, POIs inside the footprint, and library-room
 *  availability from the latest snapshot. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    const { code: query } = await params;

    const os = getOsClient();
    let building: Awaited<ReturnType<typeof resolveBuilding>>;
    try {
      building = await resolveBuilding(os, query);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Unknown building" }, 404);
    }

    // A missing index (e.g. lib_rooms before the next ingest) degrades that
    // section to empty instead of failing the whole popup.
    const empty = { body: { hits: { hits: [] as { _id: string; _source: unknown }[] } } };
    const byBuilding = (index: string, size: number) =>
      os
        .search({
          index,
          body: { query: { term: { building_code: building.code } }, size },
        })
        .catch(() => empty);

    const [roomsRes, libRoomsRes, availRes, poisRes, geo] = await Promise.all([
      byBuilding("study_spaces", 50),
      byBuilding("lib_rooms", 50),
      byBuilding("room_availability", 1000),
      os.search({ index: "poi", body: { query: { match_all: {} }, size: 500 } }).catch(() => empty),
      getBuildingsGeoJson().catch(() => null), // popup still works without the POI join
    ]);

    const footprint = geo?.features.find(
      (f) => String((f.properties as Record<string, unknown>)?.BLDG_CODE ?? "").toUpperCase() === building.code,
    ) as BuildingFeature | undefined;
    const pois = footprint
      ? poisRes.body.hits.hits
          .map((h) => h._source as PoiDoc)
          .filter((p) => pointInFeature(footprint, [p.lon, p.lat]))
      : [];

    const details: BuildingDetails = {
      code: building.code,
      name: building.name,
      rooms: roomsRes.body.hits.hits.map((h) => toRoomCard(h._source as StudySpaceDoc)),
      pois: pois.map(toPoiCard),
      availability: summarizeAvailability(
        libRoomsRes.body.hits.hits.map((h) => h._source as LibRoomDoc),
        availRes.body.hits.hits.map((h) => h._source as AvailabilityDoc),
        new Date(),
      ),
    };
    return json(details);
  } catch (e) {
    return serverError(e);
  }
}
