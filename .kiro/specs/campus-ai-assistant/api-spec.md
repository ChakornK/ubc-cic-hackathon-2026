# API Specification: Campus AI Assistant

The contract between the browser UI and the `app/api/*` route handlers. **This document is the interface between the frontend and backend agents** — both build against it independently (the frontend against a mock client, the backend against handler tests). Changes to this file must be agreed by both sides before either implements them.

## Conventions

- **Base path**: same-origin `/api` (no CORS).
- **Auth**: every endpoint requires `Authorization: Bearer <Cognito ID token>` (the raw JWT from the Cognito hosted-UI sign-in). The server verifies issuer, audience, and expiry.
- **Content type**: `application/json` both ways, except `/api/geo/*` which returns `application/geo+json`.
- **Error shape** (every non-2xx response):

```json
{ "error": "human-readable description" }
```

| Status | Meaning |
|---|---|
| 400 | Malformed request (bad JSON, missing/empty `messages`, invalid body) |
| 401 | Missing, invalid, or expired token |
| 404 | Resource does not exist **or is not owned by the caller** (indistinguishable by design) |
| 500 | Unhandled server error (details in CloudWatch, never in the body) |

## Shared types

```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ToolCall {
  name: string                       // e.g. "walking_distance"
  input: Record<string, unknown>     // the model-supplied tool input
  result?: unknown                   // the tool's output, when available — renderers use this
}

interface ChatResponse {
  message: string                    // final assistant text
  tool_calls: ToolCall[]             // ordered; empty array if no tools were used
  warning?: string                   // present iff the 8-call iteration limit was hit
}

interface SessionSummary {
  session_id: string
  title: string                      // first user message, ≤80 chars
  updatedAt: string                  // ISO 8601
}

interface Profile {
  preferences: Record<string, string>
  email?: string
  updatedAt?: string                 // set by server, ignored on PUT
}
```

## Endpoints

### POST /api/chat

Run one chat exchange through the agent.

**Request**

```json
{
  "session_id": "c1a2b3d4-...",
  "messages": [
    { "role": "user", "content": "How long is the walk from IKB to ICCS?" }
  ]
}
```

- `session_id`: client-generated UUID; reusing an id continues that session.
- `messages`: full conversation so far (the server persists only the last user message and the new assistant reply). Must be non-empty.

**Response 200**

```json
{
  "message": "It's about a 6 minute walk (roughly 460 m) from Irving K. Barber (IKB) to ICCS.",
  "tool_calls": [
    {
      "name": "walking_distance",
      "input": { "from_building": "IKB", "to_building": "ICCS" },
      "result": { "from": "ICCS", "to": "IKB", "meters": 460, "minutes": 6 }
    }
  ]
}
```

**Errors**: 400 (validation), 401, 500. A response may include `warning` alongside a usable `message`.

**Timing**: multi-tool answers take 10–30 s. The client must show a loading state and prevent duplicate submission while in flight.

### GET /api/sessions

**Response 200** — the caller's sessions, most recently updated first:

```json
[
  { "session_id": "c1a2...", "title": "How long is the walk from IKB to ICCS?", "updatedAt": "2026-08-06T18:20:11Z" }
]
```

### GET /api/sessions/{session_id}

**Response 200** — that session's messages in chronological order:

```json
[
  { "role": "user", "content": "How long is the walk from IKB to ICCS?" },
  { "role": "assistant", "content": "It's about a 6 minute walk..." }
]
```

**Errors**: 404 if the session doesn't exist **or belongs to another user**.

### GET /api/profile

**Response 200**: a `Profile`. A user who has never saved one gets `{ "preferences": {} }`.

### PUT /api/profile

**Request**: a `Profile` (server overwrites `updatedAt`). **Response**: 204, no body.

### GET /api/geo/{name}

`name` ∈ `buildings` | `walking-routes` (the allowlist is the union of every dataset module's `geo` entries — new modules may add names).

**Response 200**: a GeoJSON `FeatureCollection`.

- `buildings`: 449 building footprint features; `properties.BLDG_CODE` (e.g. `"BUCH"`), `properties.NAME`.
- `walking-routes`: pedestrian path LineStrings, geometry only.

**Errors**: 404 for a name not in the allowlist.

## Tool call reference (for renderers)

The frontend maps `ToolCall.name` to an optional renderer; unknown names fall back to a generic badge. Current tools:

| `name` | `input` | `result` |
|---|---|---|
| `search_courses` | `{ query, subject?, credits?, term?, has_no_prereqs?, limit? }` | `{ courses: CourseDoc[] }` — sections carry `start_time`/`end_time` as `"HH:MM"` strings |
| `get_course` | `{ course_code }` | one full `CourseDoc` incl. `prerequisite`/`corequisite` |
| `get_tuition` | `{ program_slug, student_type, cohort_year }` | `{ program, program_slug, student_type, cohort_year, per_credit_cad }` |
| `walking_distance` | `{ from_building, to_building }` | `{ from, to, meters, minutes }` |

Failed tool calls have `result: { "status": "error", "message": "..." }` — renderers should treat that as "no visualization".
