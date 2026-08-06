// Shared request/response types for the /api/* contract.
// Source of truth: .kiro/specs/campus-ai-assistant/api-spec.md — do not drift from it.
// When the backend lands its own types under src/server/, this module re-exports them instead.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

export interface ChatResponse {
  message: string;
  tool_calls: ToolCall[];
  /** Present iff the 8-call iteration limit was hit. */
  warning?: string;
}

export interface SessionSummary {
  session_id: string;
  /** First user message, ≤80 chars. */
  title: string;
  /** ISO 8601. */
  updatedAt: string;
}

export interface Profile {
  preferences: Record<string, string>;
  email?: string;
  updatedAt?: string;
}

/** Failed tool calls carry this as `result`; renderers treat it as "no visualization". */
export interface ToolErrorResult {
  status: "error";
  message: string;
}

export function isToolError(result: unknown): result is ToolErrorResult {
  return (
    typeof result === "object" &&
    result !== null &&
    (result as { status?: unknown }).status === "error" &&
    typeof (result as { message?: unknown }).message === "string"
  );
}

// ---- Tool result payloads (api-spec.md "Tool call reference") ----

/** Course document as it appears in tool results: section times already formatted "HH:MM". */
export interface CourseDoc {
  code: string;
  subject: string;
  number: string;
  title: string;
  description: string;
  credits: number | null;
  prerequisite: string | null;
  corequisite: string | null;
  sections: CourseSection[];
}

export interface CourseSection {
  section: string;
  term: string;
  days: string[];
  start_time: string | null;
  end_time: string | null;
  instructor?: string;
  status?: string;
}

export interface SearchCoursesResult {
  courses: CourseDoc[];
}

export interface TuitionResult {
  program: string;
  program_slug: string;
  student_type: "domestic" | "international";
  cohort_year: number;
  per_credit_cad: number;
}

export interface WalkingDistanceResult {
  from: string;
  to: string;
  meters: number;
  minutes: number;
}

export interface WalkingDistanceInput {
  from_building: string;
  to_building: string;
}

export type GeoName = "buildings" | "walking-routes";

/** Error shape of every non-2xx response: `{ "error": "..." }`. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
