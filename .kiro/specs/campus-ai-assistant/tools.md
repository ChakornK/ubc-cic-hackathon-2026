# Tool Catalogue: Campus AI Assistant

Every retrieval tool the agent could have over Unified-UBC-Data, organized as
**dataset modules** per `design.md` Component 5 (`DatasetModule` = indices +
tools + optional geo artifacts). Everything below is registry-driven: adding a
module touches no agent-loop, API, ingest, or IAM code.

Tiers: **T1** = already spec'd in `tasks-agent-1-backend.md` (MVP, do not change).
**T2** = high value, one module file each, backend-independent (frontend renders
a generic badge). **T3** = optional, data is thin or niche.

> **Status (2026-08-06): T1 and all T2 modules are implemented** in
> `src/server/modules/` and registered. T3 (`people`, `timetables`) is not.
> Re-run `npm run ingest` to create the new indices.

Display tools (`show_courses`, `show_prereq_tree`, …) are excluded — those are a
separate frontend-coupled decision.

---

## Module: `courses` (T1 — spec'd)

**Indices**: `courses` — `academic-calendar/vancouver/courses.json` (9,491
catalogue rows, prereqs pre-parsed) joined with `courses/sections.json`
(35,403 offerings) via the code join in `QUERYING.md`. `_id` = course code.

| Tool             | Input                                                                     | Backing query                                                      |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `search_courses` | `query` (req), `subject`, `credits`, `term`, `has_no_prereqs`, `limit`=20 | `multi_match` on title/description/code + filter clauses           |
| `get_course`     | `course_code` (req)                                                       | term query by code; full record incl. `prerequisite`/`corequisite` |

Caveats: two course tables exist — the 38,533-row `courses/courses` schedule
table is **not** indexed separately; sections are joined in. Scheduled courses
missing from the calendar catalogue (21% of sections) get a doc synthesized
from the schedule table — lower description/prereq fidelity (86%/40% fill),
but the course exists. Calendar prereq fidelity is higher where available.

## Module: `tuition` (T1 — spec'd)

**Indices**: `tuition` — `finances/tuition.json`, **all billing units** (rows
with a numeric `amount`): per_credit, per_instalment (flat-fee programs, 74% of
the table), per_year, per_term. Instalment schedules collapse to one doc with
`instalments[]` and `amount_cad` = their sum. `_id` =
`program_slug#student_type#cohort_year#cohort_rule#applies_to#rate_type#unit`.

| Tool          | Input                                                   | Backing query                                                        |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| `get_tuition` | `program_slug`, `student_type`, `cohort_year` (all req) | term query → CAD rate with `unit` (+ `per_credit_cad` when per-credit) |

## Module: `buildings` (T1 — spec'd)

**Indices**: `buildings` (449 centroids from `ubcv_buildings.geojson`, `_id` =
`BLDG_CODE`); `walking_distances` (derived pairwise, `_id` = `from#to`,
`from < to`). **Geo**: `buildings`, `walking-routes`.

| Tool                 | Input                                | Backing query                                                 |
| -------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `walking_distance`   | `from_building`, `to_building` (req) | term query, both orderings                                    |
| `find_building` (T2) | `query` (req)                        | `multi_match` fuzzy on name + code → `{code, name, lat, lon}` |

`find_building` exists because `walking_distance` needs codes and users say
"Irving K. Barber", not "IKB". One extra `ToolDef` in the existing module.

## Module: `places` (T2)

**Indices**: `poi` — `geospatial/ubcv/locations/geojson/ubcv_poi.geojson`
(489 points: cafe 69, campus_services 61, restaurant 27, library 17, grocery 15,
bank 7 …). Map lat/lon as `geo_point`. `_id` = feature id / name+coords hash.

| Tool          | Input                                                | Backing query                                                                                            |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `find_places` | `query`, `service_type`, `near_building`, `limit`=10 | match on name + `service_type` filter; `near_building` → resolve building centroid → `geo_distance` sort |

Caveats: `HOURS` is free text — return verbatim, don't parse. Use the GeoJSON
(coords correct there); the CSV twin had swapped headers upstream.

## Module: `parking` (T2)

**Indices**: `parking` — `geospatial/ubcv/parking/.../ubcv_parking_www.geojson`
(46 points: rates, hours, EV, bike cage, permit types, HONK link). `_id` =
`FAC_ID`. Optional geo artifact: parking polygons layer.

| Tool           | Input                               | Backing query                         |
| -------------- | ----------------------------------- | ------------------------------------- |
| `find_parking` | `query`, `near_building`, `limit`=5 | match/geo_distance like `find_places` |

Caveats: ignore `ubcv_parking_facilities.csv` unless needed (semicolon-delimited,
keys on `FAC_UID` not `FAC_ID`). Booleans are strings `"0"`/`"1"` — normalize at
transform.

## Module: `costs` (T2)

**Indices**:

- `program_cost_estimates` — `finances/program_cost_estimates.json` (134 rows,
  `_id` = `program_id`)
- `living_costs` — `finances/living_costs.json` (10 rows, `_id` = `item#variant`)
- `student_fees` — `finances/student_fees.json` (482 rows, `_id` =
  `page#section#item#student_type#cohort_year#column`)

| Tool                  | Input                         | Backing query                                                                                    |
| --------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `get_cost_estimate`   | `program` (req)               | match on program name → UBC's first-year estimate (domestic + international totals, books, fees) |
| `get_living_costs`    | — (no args)                   | `match_all` on 10 rows — housing/meal/grocery figures                                            |
| `search_student_fees` | `query` (req), `student_type` | match on `item`/`section`                                                                        |

Caveats: **always surface `matched_by`** from cost estimates — the
program→estimator-area link is name-based (`QUERYING.md`). 7 programs have no
estimate by design (`_unmatched.json`); return "no estimate published", not a
guess.

## Module: `admissions` (T2)

**Indices**:

- `admission_programs` — `admissions/programs.json` (141 rows, `_id` = `id`).
  Flatten `degrees`/`interests`/`campuses` taxonomy ids to names at transform.
- `admission_requirements` — `admissions/requirements/required_courses.json`
  (20,292 rows). Denormalize `requirement_key` → group via
  `program_requirements` at transform. `_id` =
  `requirement_key#location_term_id#position#kind`.

| Tool                         | Input                                                                                      | Backing query                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_programs`            | `query` (req), `degree`, `interest`, `limit`=10                                            | `multi_match` on title/summary + taxonomy filters                                                                                                        |
| `get_admission_requirements` | `program` (req), `location` (req, e.g. "British Columbia", "IB"), `include_advisory`=false | resolve program → `requirement_key`; filter on `(curriculum, location_slug)` or `location_term_id`; `advisory` separates hard gates from recommendations |

Caveats: `location_slug` alone is **not unique** (`basic` exists in both
province and country curricula) — always pair with `curriculum` or use
`location_term_id`. This is the "what do I need to get in from X" tool — the
`advisory` flag maps directly to your recommended-vs-required distinction.

## Module: `spaces` (T2)

**Indices**:

- `study_spaces` — `learning-spaces/rooms.json` (411: 343 classrooms, 68 study
  spaces; capacity, furniture, layout, `Building Code`). `_id` = `id`.
- `room_availability` — `room-bookings/availability.json` (~1,000 intervals,
  51 library rooms, every interval carries `state` = `free`/`booked`/`unavailable`).
  `_id` = `eid#start`.

| Tool                  | Input                                                         | Backing query                                                                                                          |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `search_study_spaces` | `query`, `building`, `space_type`, `min_capacity`, `limit`=10 | match + range filter on Capacity                                                                                       |
| `find_free_rooms`     | `min_minutes`, `min_capacity`, `location`                     | filter `state=free` + ranges; sort by capacity                                                                         |
| `get_room_schedule`   | `room` (req), `date`                                          | all intervals for that room (any state), chronological — the full free/booked/unavailable timeline for a library room |

`get_room_schedule` answers "when is Room 2.10 in IKB booked / when can I get
in" — same index as `find_free_rooms`, no filter on `state`, matched on the
`room` name (and `location` library) with a `date` filter.

Caveats: availability is a **snapshot** — every result must carry
`collected_at`, and the tool description must tell the model to caption answers
with "as of <time>". `Building Code` joins to `buildings` at 100% — reuse
`walking_distance` for "study room near X" flows. Don't index the Airtable
photo URLs (they expire in a day).

## Module: `calendar` (T2)

**Indices**: `key_dates` — union of `academic-calendar/vancouver/dates.json`
(53: term starts, exam periods, withdrawal deadlines; `_id` =
`event#section#start`) and `campus-services/statutory_holidays.json` (13, `_id`
= `holiday#date`), distinguished by a `kind` field.

| Tool            | Input                                           | Backing query                                          |
| --------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `get_key_dates` | `query`, `term`, `kind` (`deadline`\|`holiday`) | match on event/applies_to + filters, sorted by `start` |

## Module: `events` (T2)

**Indices**: `events` — `events/events.json` (9,956, `_id` = `global_id`).
Transform: strip HTML from `description`, flatten venue/organizer/category
names in, keep `start_date`/`end_date`/`all_day`/`url`.

| Tool            | Input                                                   | Backing query                     |
| --------------- | ------------------------------------------------------- | --------------------------------- |
| `search_events` | `query`, `from_date`, `to_date`, `category`, `limit`=10 | match + date range, soonest first |

Caveats: venues have no coordinates or building codes — don't offer to map them.

## Module: `pages` (T2 — one index, one tool, covers all prose)

**Indices**: `pages` — one full-text index over every prose collection, with a
`source` facet:

| `source`           | Table                                                   | Rows  |
| ------------------ | ------------------------------------------------------- | ----- |
| `calendar`         | `academic-calendar/.../pages.json` (incl. programs)     | 1,453 |
| `admissions`       | `admissions/pages.json` (cost, deadlines, how to apply) | 153   |
| `student-services` | `campus-services/student_services_pages.json`           | 464   |
| `facilities`       | `campus-services/facilities_resources.json`             | 511   |
| `recreation`       | `campus-services/recreation_pages.json`                 | 386   |
| `food`             | `campus-services/food_outlets.json` (editorial)         | 39    |
| `news`             | `campus-services/news.json`                             | 1,457 |
| `reports`          | `reports/documents.json` (title + PDF URL only)         | 194   |

Transform: Drupal rows → strip `body.processed`; WordPress rows → strip
`title.rendered`/`content.rendered` (Elementor blobs get big — truncate stored
text to ~20 KB). `_id` = `source#id`. Keep `title`, `url`, `text`, `date`.

| Tool               | Input                              | Backing query                                                                                                |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `search_ubc_pages` | `query` (req), `source`, `limit`=5 | `multi_match` title²/text, return title + url + highlight snippets (OpenSearch `highlight`), not full bodies |

This one tool answers "financial assistance", "how do I apply", "academic
concession policy", degree-requirement prose, gym hours — anything that lives
in page text rather than a structured table. Return snippets + URL so the model
cites instead of paraphrasing 20 KB blobs.

## Module: `people` (T3)

**Indices**: `people` — `people/profiles.json` (1,718, `_id` = `id`).

| Tool            | Input                    | Backing query                                                       |
| --------------- | ------------------------ | ------------------------------------------------------------------- |
| `search_people` | `query` (req), `limit`=5 | match on name/job title/program → name, title, email, office string |

Caveats: coverage is **5 faculty sites only** — the tool description must say
"partial directory; absence of a person means nothing". Office strings are free
text, not building codes — never feed them to `walking_distance`.

## Module: `timetables` (T3)

**Indices**: `standard_timetables` — `courses/standard_timetables.json`
(152 pre-built first-year timetables holding section ids; `_id` = id).

| Tool                     | Input                   | Backing query                                                       |
| ------------------------ | ----------------------- | ------------------------------------------------------------------- |
| `get_standard_timetable` | `program_or_name` (req) | match on name; resolve section ids → section details from `courses` |

Nice first-year demo ("show me a standard timetable for first-year science"),
but requires the section-id resolution join at query time. Only if time allows.

---

## Explicitly not tools (and why)

| Candidate                                | Why not                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Section → room / "where is my lecture"   | Not in the data; verified absent four ways (`QUERYING.md`)                                          |
| Classroom availability                   | `room-bookings` covers 51 library rooms, not the 343 classrooms                                     |
| Enrolment / seats left                   | No enrolment counts anywhere in the dataset                                                         |
| Professor office lookup by building      | Office field is free text, 2.9% joinable                                                            |
| Route-network routing over `ubcv_routes` | Derived haversine distances cover the need; network routing is the documented upgrade path, not MVP |
| Trees / landscape / land-use layers      | No plausible user question                                                                          |
| Okanagan anything                        | Dataset is Vancouver-only                                                                           |

## Architecture fit checklist (applies to every module above)

- One file under `src/server/modules/`, one line in `modules/index.ts`.
- Deterministic `_id`s as listed → Property 8 (idempotent re-ingest) holds.
- Tool names unique across modules → existing registry-consistency unit test
  (task 5.7) covers each addition automatically.
- All indices live on the one OpenSearch domain; the Lambda's `es:ESHttp*` and
  `s3:GetObject` grants already cover them — **zero infra changes**.
- All sources are under `data/` in the bucket after `npm run sync-data` —
  **zero ingest-plumbing changes**.
- Unknown tool names render as a generic badge — **zero frontend changes**
  required for any retrieval tool.
- Every tool returns `{ status: 'error', message }` through the shared
  Tool_Executor on failure — nothing new to build per tool.

## Suggested build order after T1

1. `pages` (`search_ubc_pages`) — one index, one tool, widest question coverage
2. `admissions` — killer demo question, clean data
3. `costs` — completes the money story with T1's `get_tuition`
4. `calendar` — trivial, high question frequency
5. `places` + `find_building` — map synergy
6. `spaces` — study-room + walking-distance combo demo
7. `events`, `parking` — if time allows
8. T3 (`people`, `timetables`) — only with caveats wired into descriptions
