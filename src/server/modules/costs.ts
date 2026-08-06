import type { DatasetModule } from "../core/types";
import { slugify } from "./tuition";

export interface CostEstimateDoc {
  program_id: number;
  program: string;
  degrees: string[];
  url: string;
  area: string;
  matched_by: string | null; // name-based match confidence — always surface it
  tuition_domestic: number | null;
  tuition_international: number | null;
  student_fees: number | null;
  books_supplies: number | null;
  educational_total_domestic: number | null;
  educational_total_international: number | null;
  custom_tuition_message: string | null;
}

export interface LivingCostDoc {
  item: string;
  variant: string | null;
  amount: number;
  basis: string | null;
}

export interface StudentFeeDoc {
  section: string | null;
  item: string;
  divider: string | null; // sub-row label, e.g. "Deferred examination written off-campus"
  context: string | null;
  student_type: string | null;
  cohort_year: number | null;
  unit: string | null;
  amount: number;
  amount_text: string | null;
  url: string | null;
}

// biome-ignore lint/suspicious/noExplicitAny: raw dataset rows
type Row = Record<string, any>;

export function transformCostEstimate(row: Row): { _id: string; doc: CostEstimateDoc } | null {
  if (row.program_id == null || !row.program) return null;
  return {
    _id: String(row.program_id),
    doc: {
      program_id: row.program_id,
      program: String(row.program),
      degrees: Array.isArray(row.degrees) ? row.degrees : [],
      url: String(row.url ?? ""),
      area: String(row.area ?? ""),
      matched_by: row.matched_by ?? null,
      tuition_domestic: row.tuition_domestic ?? null,
      tuition_international: row.tuition_international ?? null,
      student_fees: row.student_fees ?? null,
      books_supplies: row.books_supplies ?? null,
      educational_total_domestic: row.educational_total_domestic ?? null,
      educational_total_international: row.educational_total_international ?? null,
      custom_tuition_message: row.custom_tuition_message ?? null,
    },
  };
}

export function transformLivingCost(row: Row): { _id: string; doc: LivingCostDoc } | null {
  if (!row.item || typeof row.amount !== "number") return null;
  const doc: LivingCostDoc = {
    item: String(row.item),
    variant: row.variant ?? null,
    amount: row.amount,
    basis: row.basis ?? null,
  };
  return { _id: slugify(`${doc.item}-${doc.variant ?? ""}`), doc };
}

export function transformStudentFee(row: Row): { _id: string; doc: StudentFeeDoc } | null {
  if (!row.item || typeof row.amount !== "number") return null;
  const doc: StudentFeeDoc = {
    section: row.section ?? null,
    item: String(row.item),
    divider: row.divider || null,
    context: row.context ?? null,
    student_type: row.student_type ?? null,
    cohort_year: row.cohort_year ?? null,
    unit: row.unit ?? null,
    amount: row.amount,
    amount_text: row.amount_text ?? null,
    url: row.url ?? null,
  };
  return {
    // divider + amount_text are needed for uniqueness: some tables repeat the
    // same item across sub-rows, and one Dentistry pair differs only in amount
    _id: [row.page, doc.section, doc.item, doc.student_type, doc.cohort_year, row.column, doc.divider, doc.amount_text]
      .map((p) => slugify(String(p ?? "")))
      .join("#"),
    doc,
  };
}

export const costs: DatasetModule = {
  name: "costs",
  indices: [
    {
      index: "program_cost_estimates",
      mappings: {
        properties: {
          program_id: { type: "integer" },
          program: { type: "text" },
          degrees: { type: "text" },
          url: { type: "keyword" },
          area: { type: "keyword" },
          matched_by: { type: "keyword" },
          tuition_domestic: { type: "float" },
          tuition_international: { type: "float" },
          student_fees: { type: "float" },
          books_supplies: { type: "float" },
          educational_total_domestic: { type: "float" },
          educational_total_international: { type: "float" },
          custom_tuition_message: { type: "text" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("finances/program_cost_estimates.json")) as Row[];
      },
      transform: transformCostEstimate,
    },
    {
      index: "living_costs",
      mappings: {
        properties: {
          item: { type: "text" },
          variant: { type: "keyword" },
          amount: { type: "float" },
          basis: { type: "keyword" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("finances/living_costs.json")) as Row[];
      },
      transform: transformLivingCost,
    },
    {
      index: "student_fees",
      mappings: {
        properties: {
          section: { type: "text" },
          item: { type: "text" },
          divider: { type: "text" },
          context: { type: "text" },
          student_type: { type: "keyword" },
          cohort_year: { type: "integer" },
          unit: { type: "keyword" },
          amount: { type: "float" },
          amount_text: { type: "keyword" },
          url: { type: "keyword" },
        },
      },
      async *read(s3) {
        yield* (await s3.getJson("finances/student_fees.json")) as Row[];
      },
      transform: transformStudentFee,
    },
  ],
  tools: [
    {
      spec: {
        name: "get_cost_estimate",
        description:
          "UBC's own first-year cost estimate for an undergraduate program: tuition (domestic and international), student fees, books and supplies, and totals, in CAD. The program-to-estimate link is name-based — report the match_confidence to the user.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              program: { type: "string", description: 'Program name, e.g. "Computer Science"' },
            },
            required: ["program"],
          },
        },
      },
      async execute(input, os) {
        const res = await os.search({
          index: "program_cost_estimates",
          body: { query: { match: { program: String(input.program) } }, size: 1 },
        });
        const doc = res.body.hits.hits[0]?._source as CostEstimateDoc | undefined;
        if (!doc) {
          throw new Error(`No published cost estimate for "${input.program}" — UBC has no estimate for some programs`);
        }
        const { matched_by, ...rest } = doc;
        return { ...rest, match_confidence: matched_by };
      },
    },
    {
      spec: {
        name: "get_living_costs",
        description:
          "UBC Vancouver's published living-cost figures in CAD: housing, meal plans, and groceries, with the basis (per month, per year) for each.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              item: { type: "string", description: 'Optional filter, e.g. "housing" or "meal"' },
            },
            required: [],
          },
        },
      },
      async execute(input, os) {
        const query = input.item ? { match: { item: String(input.item) } } : { match_all: {} };
        const res = await os.search({ index: "living_costs", body: { query, size: 50 } });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No living-cost figures matched "${input.item}"`);
        return { living_costs: hits.map((h) => h._source as LivingCostDoc) };
      },
    },
    {
      spec: {
        name: "search_student_fees",
        description:
          "Search UBC Vancouver's Board-approved student fees (athletics, health, U-Pass, society fees, ...) by keyword. Amounts are CAD.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keywords to match fee names and sections" },
              student_type: { type: "string", description: 'Optional filter: "domestic" or "international"' },
            },
            required: ["query"],
          },
        },
      },
      async execute(input, os) {
        const filter = input.student_type ? [{ term: { student_type: String(input.student_type).toLowerCase() } }] : [];
        const res = await os.search({
          index: "student_fees",
          body: {
            query: {
              bool: {
                must: [
                  { multi_match: { query: String(input.query), fields: ["item^2", "divider", "section", "context"] } },
                ],
                filter,
              },
            },
            size: 20,
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No student fees matched "${input.query}"`);
        return { fees: hits.map((h) => h._source as StudentFeeDoc) };
      },
    },
  ],
};
