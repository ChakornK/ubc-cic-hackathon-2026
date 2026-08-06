import { formatSeconds } from "../core/time";
import type { DatasetModule, OsClient } from "../core/types";

export interface CourseSection {
  section: string;
  term: string | null;
  days: string[];
  start_seconds: number | null;
  end_seconds: number | null;
  instructor?: string;
  status?: string;
}

export interface CourseDoc {
  code: string; // "CPSC_V 110"
  subject: string; // "CPSC_V"
  number: string;
  title: string;
  description: string;
  credits: number | null;
  prerequisite: string | null; // null when absent/empty (drives has_no_prereqs)
  corequisite: string | null;
  sections: CourseSection[];
}

// biome-ignore lint/suspicious/noExplicitAny: raw dataset rows
type Row = Record<string, any>;

/** `has_no_prereqs=true` admits exactly the courses whose prerequisite is
 *  null, absent, or the empty string (Requirement 3.1 / Property 6). */
export function hasNoPrereqs(record: { prerequisite?: string | null }): boolean {
  return record.prerequisite === undefined || record.prerequisite === null || record.prerequisite === "";
}

const normalize = (s: unknown): string | null => {
  const v = typeof s === "string" ? s.trim() : "";
  return v === "" ? null : v;
};

export function parseCredits(credit: unknown): number | null {
  const m = typeof credit === "string" ? credit.match(/[\d.]+/) : null;
  return m ? Number(m[0]) : null;
}

/** Joins the academic-calendar catalogue with courses/sections per QUERYING.md:
 *  calendar code = subjects[related.course_code].name + " " + field_course_number,
 *  sections attach via courses/courses.field_course_code. */
export function joinCourses(tables: {
  calCourses: Row[];
  calSubjects: Row[];
  schedCourses: Row[];
  sections: Row[];
  terms: Row[];
  statuses: Row[];
}): CourseDoc[] {
  const subjectName = new Map(tables.calSubjects.map((s) => [s.id, s.name as string]));
  const termName = new Map(tables.terms.map((t) => [t.id, t.name as string]));
  const statusName = new Map(tables.statuses.map((s) => [s.id, s.name as string]));
  const codeById = new Map(tables.schedCourses.map((c) => [c.id, c.field_course_code as string]));

  const sectionsByCode = new Map<string, CourseSection[]>();
  for (const s of tables.sections) {
    const code = codeById.get(s.related?.course);
    if (!code) continue;
    const list = sectionsByCode.get(code) ?? [];
    list.push({
      section: String(s.field_section_number ?? ""),
      term: termName.get(s.related?.academic_term) ?? null,
      days: Array.isArray(s.field_days) ? s.field_days : [],
      start_seconds: typeof s.field_start_time === "number" ? s.field_start_time : null,
      end_seconds: typeof s.field_end_time === "number" ? s.field_end_time : null,
      ...(s.field_instructors?.[0] ? { instructor: String(s.field_instructors[0]) } : {}),
      ...(statusName.has(s.related?.status) ? { status: statusName.get(s.related?.status) } : {}),
    });
    sectionsByCode.set(code, list);
  }

  const docs = new Map<string, CourseDoc>(); // dedupe catalogue by course code, first wins
  for (const row of tables.calCourses) {
    const subject = subjectName.get(row.related?.course_code);
    const number = row.field_course_number;
    if (!subject || number == null) continue;
    const code = `${subject} ${number}`;
    if (docs.has(code)) continue;
    docs.set(code, {
      code,
      subject,
      number: String(number),
      title: row.field_course_title ?? String(row.title ?? "").replace(/^.*?:\s*/, ""),
      description: row.description_text ?? "",
      credits: parseCredits(row.field_course_credit),
      prerequisite: normalize(row.prerequisite),
      corequisite: normalize(row.corequisite),
      sections: sectionsByCode.get(code) ?? [],
    });
  }

  // Scheduled courses missing from the calendar catalogue (21% of sections)
  // still get a doc, synthesized from the schedule table — its description at
  // 86% fill and prerequisites at 40% are worse than the calendar's, but far
  // better than the course not existing.
  const schedByCode = new Map<string, Row>();
  for (const c of tables.schedCourses) {
    if (c.field_course_code && !schedByCode.has(c.field_course_code)) schedByCode.set(c.field_course_code, c);
  }
  for (const [code, sections] of sectionsByCode) {
    if (docs.has(code)) continue;
    const row = schedByCode.get(code);
    if (!row) continue;
    const [subject = "", number = ""] = code.split(" ");
    docs.set(code, {
      code,
      subject,
      number,
      title: String(row.title ?? code),
      description: row.description_text ?? "",
      credits: parseCredits(row.field_credits),
      prerequisite: normalize(row.prerequisite),
      corequisite: normalize(row.corequisite),
      sections,
    });
  }
  return [...docs.values()];
}

/** Section times go to the model as human-readable HH:MM (Requirement 3.7). */
function presentCourse(doc: CourseDoc, maxSections = Number.POSITIVE_INFINITY) {
  const sections = doc.sections.slice(0, maxSections).map(({ start_seconds, end_seconds, ...rest }) => ({
    ...rest,
    start_time: start_seconds === null ? null : formatSeconds(start_seconds),
    end_time: end_seconds === null ? null : formatSeconds(end_seconds),
  }));
  return { ...doc, sections, total_sections: doc.sections.length };
}

const upSubject = (s: string) => {
  const up = s.trim().toUpperCase();
  return up.includes("_") ? up : `${up}_V`;
};

async function findByCode(os: OsClient, courseCode: string): Promise<CourseDoc | null> {
  const norm = courseCode.trim().toUpperCase().replace(/\s+/g, " ");
  const [subject = "", number = ""] = norm.split(" ");
  const candidates = [...new Set([norm, `${upSubject(subject)} ${number}`])];
  const res = await os.search({
    index: "courses",
    body: { query: { terms: { code: candidates } }, size: 1 },
  });
  return (res.body.hits.hits[0]?._source as CourseDoc) ?? null;
}

export const courses: DatasetModule = {
  name: "courses",
  indices: [
    {
      index: "courses",
      mappings: {
        properties: {
          code: { type: "keyword" },
          subject: { type: "keyword" },
          number: { type: "keyword" },
          title: { type: "text" },
          description: { type: "text" },
          credits: { type: "float" },
          prerequisite: { type: "text" },
          corequisite: { type: "text" },
          sections: {
            properties: {
              section: { type: "keyword" },
              term: { type: "text" },
              days: { type: "keyword" },
              start_seconds: { type: "integer" },
              end_seconds: { type: "integer" },
              instructor: { type: "text" },
              status: { type: "keyword" },
            },
          },
        },
      },
      async *read(s3) {
        const [calCourses, calSubjects, schedCourses, sections, terms, statuses] = (await Promise.all([
          s3.getJson("academic-calendar/vancouver/courses.json"),
          s3.getJson("academic-calendar/vancouver/subjects.json"),
          s3.getJson("courses/courses.json"),
          s3.getJson("courses/sections.json"),
          s3.getJson("courses/terms.json"),
          s3.getJson("courses/statuses.json"),
        ])) as Row[][];
        yield* joinCourses({ calCourses, calSubjects, schedCourses, sections, terms, statuses });
      },
      transform(doc: CourseDoc) {
        return { _id: doc.code, doc };
      },
    },
  ],
  tools: [
    {
      spec: {
        name: "search_courses",
        description:
          "Search UBC Vancouver courses by keyword, with optional filters. Returns matching courses with their scheduled sections (times as 24h HH:MM).",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keywords to match against course title, description, and code" },
              subject: { type: "string", description: 'Subject code filter, e.g. "CPSC"' },
              credits: { type: "number", description: "Exact credit count filter, e.g. 3" },
              term: { type: "string", description: 'Term filter, e.g. "2026-27 Winter Term 1"' },
              has_no_prereqs: { type: "boolean", description: "If true, only courses with no prerequisites" },
              limit: { type: "number", description: "Max results (default 20)" },
            },
            required: ["query"],
          },
        },
      },
      async execute(input, os) {
        const { query, subject, credits, term, has_no_prereqs, limit } = input;
        const filter: Record<string, unknown>[] = [];
        if (subject) filter.push({ term: { subject: upSubject(String(subject)) } });
        if (credits !== undefined) filter.push({ term: { credits } });
        if (term) filter.push({ match: { "sections.term": { query: String(term), operator: "and" } } });
        if (has_no_prereqs) filter.push({ bool: { must_not: { exists: { field: "prerequisite" } } } });
        const res = await os.search({
          index: "courses",
          body: {
            query: {
              bool: {
                must: [{ multi_match: { query: String(query), fields: ["title^2", "description", "code^3"] } }],
                filter,
              },
            },
            size: Math.min(Number(limit) || 20, 50),
          },
        });
        const hits = res.body.hits.hits;
        if (hits.length === 0) throw new Error(`No courses matched "${query}"`);
        return { courses: hits.map((h) => presentCourse(h._source as CourseDoc, 10)) };
      },
    },
    {
      spec: {
        name: "get_course",
        description:
          "Get the full record for one UBC course by its course code, including description, prerequisites, corequisites, and all scheduled sections.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              course_code: { type: "string", description: 'Course code, e.g. "CPSC 110" or "CPSC_V 110"' },
            },
            required: ["course_code"],
          },
        },
      },
      async execute(input, os) {
        const doc = await findByCode(os, String(input.course_code ?? ""));
        if (!doc) throw new Error(`No course found with code "${input.course_code}"`);
        return presentCourse(doc);
      },
    },
  ],
};
