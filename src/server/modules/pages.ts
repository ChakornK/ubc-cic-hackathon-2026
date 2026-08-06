import type { DatasetModule } from "../core/types";
import { stripHtml } from "./html";

export interface PageDoc {
  source: string;
  title: string;
  url: string;
  text: string;
  date: string | null;
}

// biome-ignore lint/suspicious/noExplicitAny: raw dataset rows
type Row = Record<string, any>;

export type TaggedPage = { source: string; shape: "drupal" | "wordpress" | "report"; row: Row };

const CAL_BASE = "https://vancouver.calendar.ubc.ca";
const MAX_TEXT = 20_000; // Elementor blobs get huge; the tool returns snippets, not bodies

/** WordPress-shaped collections: title/content nest under `.rendered`. */
const WP_SOURCES: [source: string, key: string][] = [
  ["admissions", "admissions/pages.json"],
  ["student-services", "campus-services/student_services_pages.json"],
  ["facilities", "campus-services/facilities_resources.json"],
  ["recreation", "campus-services/recreation_pages.json"],
  ["food", "campus-services/food_outlets.json"],
  ["news", "campus-services/news.json"],
];

export function transformPage(tagged: TaggedPage): { _id: string; doc: PageDoc } | null {
  const { source, shape, row } = tagged;
  if (shape === "drupal") {
    if (!row.title || !row.id) return null;
    return {
      _id: `${source}#${row.id}`,
      doc: {
        source,
        title: String(row.title),
        url: row.alias ? CAL_BASE + row.alias : CAL_BASE,
        text: stripHtml(row.body?.processed).slice(0, MAX_TEXT),
        date: row.changed != null ? String(row.changed) : null,
      },
    };
  }
  if (shape === "wordpress") {
    const title = stripHtml(row.title?.rendered);
    if (!title || !row.id) return null;
    const text = [stripHtml(row.excerpt?.rendered), stripHtml(row.content?.rendered)]
      .filter(Boolean)
      .join(" ")
      .slice(0, MAX_TEXT);
    return {
      _id: `${source}#${row.id}`,
      doc: { source, title, url: String(row.link ?? ""), text, date: row.modified_gmt ?? row.date_gmt ?? null },
    };
  }
  // report: an index entry for a published PDF — searchable title, direct download URL
  if (!row.url) return null;
  return {
    _id: `${source}#${row.url}`,
    doc: {
      source,
      title: String(row.page_title || row.filename),
      url: String(row.url),
      text: [row.filename, row.page_title, row.site].filter(Boolean).join(" "),
      date: row.page_modified ?? null,
    },
  };
}

export const pages: DatasetModule = {
  name: "pages",
  indices: [
    {
      index: "pages",
      mappings: {
        properties: {
          source: { type: "keyword" },
          title: { type: "text" },
          url: { type: "keyword" },
          text: { type: "text" },
          date: { type: "keyword" },
        },
      },
      async *read(s3) {
        for (const row of (await s3.getJson("academic-calendar/vancouver/pages.json")) as Row[]) {
          yield { source: "calendar", shape: "drupal", row } satisfies TaggedPage;
        }
        for (const [source, key] of WP_SOURCES) {
          for (const row of (await s3.getJson(key)) as Row[]) {
            yield { source, shape: "wordpress", row } satisfies TaggedPage;
          }
        }
        for (const row of (await s3.getJson("reports/documents.json")) as Row[]) {
          yield { source: "reports", shape: "report", row } satisfies TaggedPage;
        }
      },
      transform: transformPage,
    },
  ],
  tools: [
    {
      spec: {
        name: "search_ubc_pages",
        description:
          "Full-text search across official UBC Vancouver web pages: academic calendar (policies, regulations, degree requirements), admissions/you.ubc.ca (costs, financial assistance, how to apply), student services, campus facilities, recreation, food outlets, news, and published reports. Returns page titles, URLs, and matching text snippets — cite the URL in answers.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keywords to search page titles and text for" },
              source: {
                type: "string",
                description:
                  'Optional source filter: "calendar", "admissions", "student-services", "facilities", "recreation", "food", "news", or "reports"',
              },
              limit: { type: "number", description: "Max results (default 5)" },
            },
            required: ["query"],
          },
        },
      },
      async execute(input, os) {
        const filter = input.source ? [{ term: { source: String(input.source) } }] : [];
        const res = await os.search({
          index: "pages",
          body: {
            query: {
              bool: {
                must: [{ multi_match: { query: String(input.query), fields: ["title^2", "text"] } }],
                filter,
              },
            },
            size: Math.min(Number(input.limit) || 5, 20),
            _source: ["source", "title", "url", "date"], // bodies stay out of the model context
            highlight: { fields: { text: { fragment_size: 250, number_of_fragments: 3 } } },
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No UBC pages matched "${input.query}"`);
        return { pages: hits.map((h) => ({ ...(h._source as PageDoc), snippets: h.highlight?.text ?? [] })) };
      },
    },
  ],
};
