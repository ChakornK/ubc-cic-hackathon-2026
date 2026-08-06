"use client";

// Tool-call rendering (task 3.2): every call gets a mono badge; known tools with
// healthy results also get a visualization from the `renderers` registry. Error
// results (`status: "error"`) render as badge only. Unknown tools fall back to
// the generic badge, so a new backend module needs only one renderer here.

import { useChatShell } from "@/src/components/chat/chat-shell-context";
import { Icon, type IconName } from "@/src/components/icons";
import {
  isToolError,
  type CourseDoc,
  type SearchCoursesResult,
  type ToolCall,
  type TuitionResult,
} from "@/src/lib/api-types";
import { formatCad, formatMeters, formatMinutes, summarizeToolInput } from "@/src/lib/format";
import { extractWalkingHighlight } from "@/src/lib/walking";
import { useEffect, useMemo } from "react";

export interface ToolCallRendererProps {
  call: ToolCall;
  /** True when this call belongs to the newest assistant response. */
  isLatest: boolean;
}

export type ToolCallRenderer = React.ComponentType<ToolCallRendererProps>;

const TOOL_ICONS: Record<string, IconName> = {
  search_courses: "search",
  get_course: "book2",
  get_tuition: "currencyDollar",
  walking_distance: "location",
};

// ---- Badges ----

function ToolBadge({ call }: { call: ToolCall }) {
  const failed = isToolError(call.result);
  const summary = summarizeToolInput(call.input);
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs ${
        failed
          ? "border-error/40 bg-error-container/40 text-on-surface-variant"
          : "border-border-subtle bg-surface-container-low text-on-surface-variant"
      }`}
      title={failed && isToolError(call.result) ? call.result.message : undefined}
    >
      <Icon name={failed ? "alert" : (TOOL_ICONS[call.name] ?? "route")} size={14} className="shrink-0" />
      <span className="truncate">
        {call.name}
        {summary ? `(${summary})` : "()"}
      </span>
    </span>
  );
}

// ---- search_courses / get_course ----

function isCourseDoc(value: unknown): value is CourseDoc {
  return (
    typeof value === "object" && value !== null && typeof (value as CourseDoc).code === "string" && "sections" in value
  );
}

function sectionLine(course: CourseDoc): string | null {
  const s = course.sections[0];
  if (!s) return null;
  const days = s.days.map((d) => d.toUpperCase()).join("·");
  const time = s.start_time && s.end_time ? `${s.start_time}–${s.end_time}` : null;
  return [s.term, days, time].filter(Boolean).join("  ");
}

function CourseCard({ course, detailed = false }: { course: CourseDoc; detailed?: boolean }) {
  const times = sectionLine(course);
  return (
    <article className="rounded-lg bg-surface-container-low p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-body-sm font-medium text-primary">{course.code.replace("_V", "")}</span>
        {course.credits !== null && (
          <span className="shrink-0 rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
            {course.credits} cr
          </span>
        )}
      </div>
      <h4 className="mt-0.5 text-sm font-medium text-on-surface">{course.title}</h4>
      {detailed && course.description && (
        <p className="mt-1.5 line-clamp-3 text-body-sm leading-relaxed text-on-surface-variant">{course.description}</p>
      )}
      {times && <p className="mt-1.5 font-mono text-xs text-on-surface-variant">{times}</p>}
      <p className="mt-1 line-clamp-2 text-xs text-muted">
        {course.prerequisite ? `Prereq: ${course.prerequisite}` : "No prerequisites"}
        {detailed && course.corequisite ? ` · Coreq: ${course.corequisite}` : ""}
      </p>
    </article>
  );
}

function SearchCoursesRenderer({ call }: ToolCallRendererProps) {
  const result = call.result as Partial<SearchCoursesResult> | undefined;
  const courses = Array.isArray(result?.courses) ? result.courses.filter(isCourseDoc) : [];
  if (courses.length === 0) return null;
  const shown = courses.slice(0, 4);
  return (
    <div className="mt-2 flex flex-col gap-2">
      {shown.map((course) => (
        <CourseCard key={course.code} course={course} />
      ))}
      {courses.length > shown.length && (
        <p className="text-xs text-muted">+ {courses.length - shown.length} more matches</p>
      )}
    </div>
  );
}

function GetCourseRenderer({ call }: ToolCallRendererProps) {
  if (!isCourseDoc(call.result)) return null;
  return (
    <div className="mt-2">
      <CourseCard course={call.result} detailed />
    </div>
  );
}

// ---- get_tuition ----

function isTuitionResult(value: unknown): value is TuitionResult {
  return typeof value === "object" && value !== null && typeof (value as TuitionResult).per_credit_cad === "number";
}

function TuitionRenderer({ call }: ToolCallRendererProps) {
  if (!isTuitionResult(call.result)) return null;
  const t = call.result;
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
        <Icon name="currencyDollar" size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-medium text-on-surface">
          {formatCad(t.per_credit_cad)} <span className="text-body-sm font-normal text-on-surface-variant">per credit</span>
        </span>
        <span className="block truncate text-xs text-muted">
          {t.program} · {t.student_type} · {t.cohort_year} cohort
        </span>
      </span>
    </div>
  );
}

// ---- walking_distance ----

function WalkingDistanceRenderer({ call, isLatest }: ToolCallRendererProps) {
  const { setHighlight, showOnMap } = useChatShell();
  const highlight = useMemo(() => extractWalkingHighlight(call), [call]);

  // The renderer emits highlight state for the map; only the latest response drives it.
  useEffect(() => {
    if (isLatest && highlight) setHighlight(highlight);
  }, [isLatest, highlight, setHighlight]);

  if (!highlight) return null;
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
        <Icon name="walk" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-on-surface">{formatMinutes(highlight.minutes)}</span>
        <span className="block truncate text-xs text-muted">
          {formatMeters(highlight.meters)} · {highlight.from} → {highlight.to}
        </span>
      </span>
      <button
        type="button"
        onClick={showOnMap}
        className="shrink-0 rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors duration-150 hover:bg-accent-subtle active:scale-95"
      >
        Show on map
      </button>
    </div>
  );
}

// ---- Registry ----

export const renderers: Record<string, ToolCallRenderer> = {
  search_courses: SearchCoursesRenderer,
  get_course: GetCourseRenderer,
  get_tuition: TuitionRenderer,
  walking_distance: WalkingDistanceRenderer,
};

/** Stable keys for an ordered, append-only call list: name + occurrence count. */
function callKeys(calls: ToolCall[]): string[] {
  const seen = new Map<string, number>();
  return calls.map((call) => {
    const n = (seen.get(call.name) ?? 0) + 1;
    seen.set(call.name, n);
    return `${call.name}#${n}`;
  });
}

export function ToolCallsView({ calls, isLatest }: { calls: ToolCall[]; isLatest: boolean }) {
  if (calls.length === 0) return null;
  const keys = callKeys(calls);
  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2">
        {calls.map((call, i) => (
          <ToolBadge key={keys[i]} call={call} />
        ))}
      </div>
      {calls.map((call, i) => {
        if (isToolError(call.result)) return null;
        const Renderer = renderers[call.name];
        if (!Renderer) return null;
        return <Renderer key={`render-${keys[i]}`} call={call} isLatest={isLatest} />;
      })}
    </div>
  );
}
