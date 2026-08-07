import type { BuildingDetails } from "@/src/lib/api-types";
import { pointInFeature, type BuildingFeature } from "@/src/lib/geo";
import { requireUser } from "@/src/server/auth";
import { summarizeAvailability, toPoiCard, toRoomCard } from "@/src/server/building-details";
import { getBuildingsGeoJson, resolveBuilding } from "@/src/server/modules/buildings";
import type { PoiDoc } from "@/src/server/modules/places";
import type { AvailabilityDoc, LibRoomDoc, StudySpaceDoc } from "@/src/server/modules/spaces";
import { getSearch } from "@/src/server/search";
import { json, serverError } from "../../http";

/** GET /api/building/{code} — rooms, POIs, and library-room availability for the map popup. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    const { code: query } = await params;

    const search = getSearch();
    let building: Awaited<ReturnType<typeof resolveBuilding>>;
    try {
      building = await resolveBuilding(search, query);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Unknown building" }, 404);
    }

    // A missing index degrades that section to empty instead of failing the popup.
    const searchByBuilding = async <T>(index: string, limit: number): Promise<T[]> => {
      try {
        const res = await search.index(index).search("", {
          filter: `building_code = '${building.code}'`,
          limit,
        });
        return res.hits as T[];
      } catch {
        return [];
      }
    };

    const [rooms, libRooms, avail, poisRes, geo] = await Promise.all([
      searchByBuilding<StudySpaceDoc>("study_spaces", 50),
      searchByBuilding<LibRoomDoc>("lib_rooms", 50),
      searchByBuilding<AvailabilityDoc>("room_availability", 1000),
      search
        .index("poi")
        .search("", { limit: 500 })
        .catch(() => ({ hits: [] })),
      getBuildingsGeoJson().catch(() => null),
    ]);

    const footprint = geo?.features.find(
      (f) => String((f.properties as Record<string, unknown> | null)?.BLDG_CODE ?? "").toUpperCase() === building.code,
    ) as BuildingFeature | undefined;
    const pois = footprint ? (poisRes.hits as PoiDoc[]).filter((p) => pointInFeature(footprint, [p.lon, p.lat])) : [];

    const details: BuildingDetails = {
      code: building.code,
      name: building.name,
      rooms: rooms.map(toRoomCard),
      pois: pois.map(toPoiCard),
      availability: summarizeAvailability(libRooms, avail, new Date()),
    };
    return json(details);
  } catch (e) {
    return serverError(e);
  }
}
