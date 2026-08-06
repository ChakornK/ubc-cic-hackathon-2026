import type { DatasetModule } from "../core/types";
import { stripHtml } from "./html";

export interface EventDoc {
  id: string;
  title: string;
  text: string;
  url: string | null;
  start_date: string | null; // "yyyy-MM-dd HH:mm:ss"
  end_date: string | null;
  all_day: boolean;
  venue: string | null;
  venue_address: string | null;
  categories: string[];
}

// biome-ignore lint/suspicious/noExplicitAny: raw dataset rows
type Row = Record<string, any>;

export function transformEvent(row: Row): { _id: string; doc: EventDoc } | null {
  const id = row.global_id ?? row.id;
  if (id == null || !row.title) return null;
  const venue = Array.isArray(row.venue) ? row.venue[0] : row.venue; // TEC API: object, array, or absent
  return {
    _id: String(id),
    doc: {
      id: String(id),
      title: stripHtml(row.title),
      text: stripHtml(row.description).slice(0, 5000),
      url: row.url ?? null,
      start_date: row.start_date ?? null,
      end_date: row.end_date ?? null,
      all_day: Boolean(row.all_day),
      venue: venue?.venue ?? venue?.title ?? null,
      venue_address: venue?.address ?? null,
      categories: (Array.isArray(row.categories) ? row.categories : [])
        .map((c: Row) => c?.name ?? c?.slug)
        .filter(Boolean),
    },
  };
}

export const events: DatasetModule = {
  name: "events",
  indices: [
    {
      index: "events",
      mappings: {
        properties: {
          id: { type: "keyword" },
          title: { type: "text" },
          text: { type: "text" },
          url: { type: "keyword" },
          start_date: { type: "date", format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd", ignore_malformed: true },
          end_date: { type: "date", format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd", ignore_malformed: true },
          all_day: { type: "boolean" },
          venue: { type: "text" },
          venue_address: { type: "text" },
          categories: { type: "keyword" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("events/events.json")) as Row[];
      },
      transform: transformEvent,
    },
  ],
  tools: [
    {
      spec: {
        name: "search_events",
        description:
          "Search UBC Vancouver events (events.ubc.ca) by keyword and date range. The archive goes back years — filter by date for current events. Venues have no map coordinates.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Optional keywords for title and description" },
              from_date: { type: "string", description: "Optional earliest start date, ISO e.g. 2026-08-01" },
              to_date: { type: "string", description: "Optional latest start date, ISO e.g. 2026-09-01" },
              category: { type: "string", description: 'Optional category filter, e.g. "Lectures & Talks"' },
              limit: { type: "number", description: "Max results (default 10)" },
            },
            required: [],
          },
        },
      },
      async execute(input, os) {
        const must: Record<string, unknown>[] = [];
        if (input.query)
          must.push({ multi_match: { query: String(input.query), fields: ["title^2", "text", "venue"] } });
        const filter: Record<string, unknown>[] = [];
        if (input.from_date || input.to_date) {
          filter.push({
            range: {
              start_date: {
                ...(input.from_date ? { gte: String(input.from_date) } : {}),
                ...(input.to_date ? { lte: String(input.to_date) } : {}),
                format: "yyyy-MM-dd",
              },
            },
          });
        }
        if (input.category) filter.push({ term: { categories: String(input.category) } });
        const res = await os.search({
          index: "events",
          body: {
            query: { bool: { must: must.length > 0 ? must : [{ match_all: {} }], filter } },
            size: Math.min(Number(input.limit) || 10, 30),
            // upcoming-first when a window is given; otherwise newest-first (the archive is mostly past events)
            sort: [{ start_date: { order: input.from_date ? "asc" : "desc", missing: "_last" } }],
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No events matched "${input.query ?? ""}"`);
        return {
          events: hits.map((h) => {
            const e = h._source as EventDoc;
            return { ...e, text: e.text.slice(0, 400) };
          }),
        };
      },
    },
  ],
};
