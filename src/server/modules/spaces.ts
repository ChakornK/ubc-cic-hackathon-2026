import type { DatasetModule } from "../core/types";

export interface StudySpaceDoc {
  id: string;
  title: string;
  name: string | null; // short label, e.g. "AERL 120"
  building_code: string | null;
  building_name: string | null;
  room_number: string | null;
  capacity: number | null;
  space_type: string | null; // "classroom" | "study space"
  furniture: string | null;
  layout: string | null;
  floor: number | null;
  photo: string | null; // cover thumbnail (signed URL — may go stale; the preview proxy refreshes from `link`)
  link: string | null; // Find a Space room page
}

/** Bookable library room (LibCal catalog) — joins room_availability by eid. */
export interface LibRoomDoc {
  eid: number;
  building_code: string | null;
  location: string | null;
  title: string;
  capacity: number | null;
  url: string | null;
  thumbnail: string | null;
}

export interface AvailabilityDoc {
  eid: number;
  location: string | null; // the library publishing the space
  building_code: string | null;
  room: string;
  capacity: number | null;
  state: "free" | "booked" | "unavailable";
  date: string | null;
  start: string;
  end: string | null;
  minutes: number | null;
  collected_at: string | null; // snapshot time — always surface as "as of"
}

// biome-ignore lint/suspicious/noExplicitAny: raw dataset rows
type Row = Record<string, any>;

export function transformStudySpace(row: Row): { _id: string; doc: StudySpaceDoc } | null {
  if (row.id == null || !row.Title) return null;
  const capacity = Number(row.Capacity); // source carries it as a string
  const floor = Number(row.floor);
  return {
    _id: String(row.id),
    doc: {
      id: String(row.id),
      title: String(row.Title),
      name: row.Name != null ? String(row.Name) : null,
      building_code: row["Building Code"] ?? null,
      building_name: row["Buildings - Building Name (override)"] ?? row["Buildings - Building Name"] ?? null,
      room_number: row["Room Number"] != null ? String(row["Room Number"]) : null,
      capacity: Number.isFinite(capacity) ? capacity : null,
      space_type: row.space_type ?? null,
      furniture: row.Formatted_Furniture ?? null,
      layout: row.Formatted_Room_Layout_Type ?? null,
      floor: Number.isFinite(floor) ? floor : null,
      photo: row.cover_photo_thumbnail_url ?? null,
      link: row["Room Link"] ?? null,
    },
  };
}

export function transformLibRoom(row: Row): { _id: string; doc: LibRoomDoc } | null {
  if (row.eid == null || !row.title) return null;
  return {
    _id: String(row.eid),
    doc: {
      eid: row.eid,
      building_code: row.building_code ?? null,
      location: row.location ?? null,
      title: String(row.title),
      capacity: typeof row.capacity === "number" ? row.capacity : null,
      url: row.url ?? null,
      thumbnail: row.thumbnail ?? null,
    },
  };
}

export function transformAvailability(row: Row): { _id: string; doc: AvailabilityDoc } | null {
  if (row.eid == null || !row.room || !row.start || !row.state) return null;
  return {
    _id: `${row.eid}#${row.start}`,
    doc: {
      eid: row.eid,
      location: row.location ?? null,
      building_code: row.building_code ?? null,
      room: String(row.room),
      capacity: typeof row.capacity === "number" ? row.capacity : null,
      state: row.state,
      date: row.date ?? null,
      start: String(row.start),
      end: row.end != null ? String(row.end) : null,
      minutes: typeof row.minutes === "number" ? row.minutes : null,
      collected_at: row.collected_at ?? null,
    },
  };
}

const asOf = (rows: AvailabilityDoc[]) => rows.find((r) => r.collected_at)?.collected_at ?? null;

export const spaces: DatasetModule = {
  name: "spaces",
  indices: [
    {
      index: "study_spaces",
      mappings: {
        properties: {
          id: { type: "keyword" },
          title: { type: "text" },
          name: { type: "text" },
          building_code: { type: "keyword" },
          building_name: { type: "text" },
          room_number: { type: "keyword" },
          capacity: { type: "integer" },
          space_type: { type: "keyword" },
          furniture: { type: "text" },
          layout: { type: "text" },
          floor: { type: "integer" },
          photo: { type: "keyword", index: false },
          link: { type: "keyword", index: false },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("learning-spaces/rooms.json")) as Row[];
      },
      transform: transformStudySpace,
    },
    {
      index: "lib_rooms",
      mappings: {
        properties: {
          eid: { type: "integer" },
          building_code: { type: "keyword" },
          location: { type: "text" },
          title: { type: "text" },
          capacity: { type: "integer" },
          url: { type: "keyword", index: false },
          thumbnail: { type: "keyword", index: false },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("room-bookings/rooms.json")) as Row[];
      },
      transform: transformLibRoom,
    },
    {
      index: "room_availability",
      mappings: {
        properties: {
          eid: { type: "integer" },
          location: { type: "text" },
          building_code: { type: "keyword" },
          room: { type: "text" },
          capacity: { type: "integer" },
          state: { type: "keyword" },
          date: { type: "keyword" },
          start: { type: "keyword" }, // ISO timestamps — sort correctly as strings
          end: { type: "keyword" },
          minutes: { type: "integer" },
          collected_at: { type: "keyword" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("room-bookings/availability.json")) as Row[];
      },
      transform: transformAvailability,
    },
  ],
  tools: [
    {
      spec: {
        name: "search_study_spaces",
        description:
          "Search UBC Vancouver classrooms and informal study spaces by keyword, building, type, and capacity — furniture, layout, and seat counts from UBC's Find a Space.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Optional keywords for the room or building name" },
              building: { type: "string", description: 'Optional building code or name filter, e.g. "IKB"' },
              space_type: { type: "string", description: 'Optional filter: "classroom" or "study space"' },
              min_capacity: { type: "number", description: "Minimum seat count" },
              limit: { type: "number", description: "Max results (default 10)" },
            },
            required: [],
          },
        },
      },
      async execute(input, os) {
        const must: Record<string, unknown>[] = [];
        if (input.query)
          must.push({ multi_match: { query: String(input.query), fields: ["title^2", "building_name"] } });
        const filter: Record<string, unknown>[] = [];
        if (input.building) {
          filter.push({
            bool: {
              should: [
                { term: { building_code: String(input.building).toUpperCase() } },
                { match: { building_name: String(input.building) } },
              ],
              minimum_should_match: 1,
            },
          });
        }
        if (input.space_type) filter.push({ term: { space_type: String(input.space_type) } });
        if (input.min_capacity !== undefined) filter.push({ range: { capacity: { gte: Number(input.min_capacity) } } });
        const res = await os.search({
          index: "study_spaces",
          body: {
            query: { bool: { must: must.length > 0 ? must : [{ match_all: {} }], filter } },
            size: Math.min(Number(input.limit) || 10, 30),
            sort: [{ capacity: { order: "desc", missing: "_last" } }],
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error("No study spaces matched those filters");
        return { spaces: hits.map((h) => h._source as StudySpaceDoc) };
      },
    },
    {
      spec: {
        name: "find_free_rooms",
        description:
          "Find bookable UBC library rooms that are currently free, from the latest availability snapshot (covers library spaces only, not classrooms). Always tell the user the as_of time — availability changes.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              min_minutes: { type: "number", description: "Minimum free stretch in minutes, e.g. 120" },
              min_capacity: { type: "number", description: "Minimum seat count" },
              location: { type: "string", description: 'Optional library filter, e.g. "Irving K. Barber"' },
            },
            required: [],
          },
        },
      },
      async execute(input, os) {
        const filter: Record<string, unknown>[] = [{ term: { state: "free" } }];
        if (input.min_minutes !== undefined) filter.push({ range: { minutes: { gte: Number(input.min_minutes) } } });
        if (input.min_capacity !== undefined) filter.push({ range: { capacity: { gte: Number(input.min_capacity) } } });
        const must: Record<string, unknown>[] = input.location
          ? [{ match: { location: String(input.location) } }]
          : [{ match_all: {} }];
        const res = await os.search({
          index: "room_availability",
          body: {
            query: { bool: { must, filter } },
            size: 20,
            sort: [{ capacity: { order: "desc", missing: "_last" } }],
          },
        });
        const rows = res.body.hits.hits.map((h) => h._source as AvailabilityDoc);
        if (rows.length === 0) throw new Error("No free library rooms matched those filters in the latest snapshot");
        return { as_of: asOf(rows), rooms: rows };
      },
    },
    {
      spec: {
        name: "get_room_schedule",
        description:
          "The full booking timeline for one bookable UBC library room — every free, booked, and unavailable interval in chronological order, from the latest snapshot. Always tell the user the as_of time.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              room: { type: "string", description: 'Room name as listed by the library, e.g. "IKB 461"' },
              date: { type: "string", description: "Optional ISO date filter, e.g. 2026-08-06" },
            },
            required: ["room"],
          },
        },
      },
      async execute(input, os) {
        const filter: Record<string, unknown>[] = input.date ? [{ term: { date: String(input.date) } }] : [];
        const res = await os.search({
          index: "room_availability",
          body: {
            query: { bool: { must: [{ match: { room: { query: String(input.room), operator: "and" } } }], filter } },
            size: 100,
            sort: [{ start: "asc" }],
          },
        });
        const rows = res.body.hits.hits.map((h) => h._source as AvailabilityDoc);
        if (rows.length === 0) throw new Error(`No library room matched "${input.room}" in the latest snapshot`);
        return {
          room: rows[0].room,
          location: rows[0].location,
          as_of: asOf(rows),
          intervals: rows.map(({ state, date, start, end, minutes }) => ({ state, date, start, end, minutes })),
        };
      },
    },
  ],
};
