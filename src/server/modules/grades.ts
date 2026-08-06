import type { DatasetModule, OsClient, S3Reader } from "../core/types";

interface GradeRow {
  subject: string;
  course: string;
  section: string;
  year: number;
  session: string;
  title: string;
  professor: string;
  enrolled: number;
  avg: number | null;
  median: number | null;
  std_dev: number | null;
  percentile_25: number | null;
  percentile_75: number | null;
  high: number | null;
  low: number | null;
  distribution: Record<string, number>;
}

export const grades: DatasetModule = {
  name: "grades",
  indices: [
    {
      index: "grades",
      mappings: {
        properties: {
          subject: { type: "keyword" },
          course: { type: "keyword" },
          section: { type: "keyword" },
          year: { type: "integer" },
          session: { type: "keyword" },
          title: { type: "text" },
          professor: { type: "text", fields: { keyword: { type: "keyword" } } },
          enrolled: { type: "integer" },
          avg: { type: "float" },
          median: { type: "float" },
          std_dev: { type: "float" },
          percentile_25: { type: "float" },
          percentile_75: { type: "float" },
          high: { type: "float" },
          low: { type: "float" },
          distribution: { type: "object", enabled: true },
        },
      },
      async *read(s3: S3Reader) {
        const rows = (await s3.getJson("grades/distributions.json")) as GradeRow[];
        yield* rows;
      },
      transform(raw: GradeRow) {
        if (raw.avg === null) return null;
        const _id = `${raw.subject}-${raw.course}-${raw.section}-${raw.year}${raw.session}`;
        return { _id, doc: raw };
      },
    },
  ],
  tools: [
    {
      spec: {
        name: "get_grades",
        description:
          "Get grade distributions for a specific UBC course. Returns matching grade records sorted by year descending.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              course_code: { type: "string", description: 'Course code, e.g. "CPSC 110"' },
              year: { type: "number", description: "Filter by year, e.g. 2024" },
              session: { type: "string", description: 'Filter by session: "W" or "S"' },
              professor: { type: "string", description: "Filter by professor name" },
            },
            required: ["course_code"],
          },
        },
      },
      async execute(input: Record<string, unknown>, os: OsClient) {
        const code = String(input.course_code ?? "")
          .trim()
          .toUpperCase();
        const [subject, course] = code.split(/\s+/);
        if (!subject || !course) throw new Error(`Invalid course_code "${input.course_code}"`);

        const filter: Record<string, unknown>[] = [{ term: { subject } }, { term: { course } }];
        if (input.year !== undefined) filter.push({ term: { year: input.year } });
        if (input.session) filter.push({ term: { session: String(input.session).toUpperCase() } });
        if (input.professor) filter.push({ match: { professor: String(input.professor) } });

        const res = await os.search({
          index: "grades",
          body: {
            query: { bool: { filter } },
            sort: [{ year: "desc" }],
            size: 50,
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No grade records found for "${input.course_code}"`);
        return { grades: hits.map((h) => h._source) };
      },
    },
    {
      spec: {
        name: "search_grades",
        description: "Search UBC grade data by keyword (matches title/professor) with optional filters.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keywords to match against course title or professor" },
              subject: { type: "string", description: 'Subject code filter, e.g. "CPSC"' },
              min_avg: { type: "number", description: "Minimum class average" },
              max_avg: { type: "number", description: "Maximum class average" },
              year: { type: "number", description: "Filter by year" },
              limit: { type: "number", description: "Max results (default 20)" },
            },
            required: ["query"],
          },
        },
      },
      async execute(input: Record<string, unknown>, os: OsClient) {
        const filter: Record<string, unknown>[] = [];
        if (input.subject) filter.push({ term: { subject: String(input.subject).toUpperCase() } });
        if (input.year !== undefined) filter.push({ term: { year: input.year } });
        if (input.min_avg !== undefined || input.max_avg !== undefined) {
          const range: Record<string, unknown> = {};
          if (input.min_avg !== undefined) range.gte = input.min_avg;
          if (input.max_avg !== undefined) range.lte = input.max_avg;
          filter.push({ range: { avg: range } });
        }

        const res = await os.search({
          index: "grades",
          body: {
            query: {
              bool: {
                must: [{ multi_match: { query: String(input.query), fields: ["title^2", "professor"] } }],
                filter,
              },
            },
            sort: [{ year: "desc" }],
            size: Math.min(Number(input.limit) || 20, 50),
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No grade records matched "${input.query}"`);
        return { grades: hits.map((h) => h._source) };
      },
    },
  ],
};
