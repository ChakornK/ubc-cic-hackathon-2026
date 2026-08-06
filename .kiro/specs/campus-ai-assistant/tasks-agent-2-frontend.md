# Tasks — Agent 2: Frontend

**Owns**: `app/**` UI pages/layouts (everything except `app/api/**`), `src/components/**`, `src/lib/**`.
**Must not touch**: `src/server/**`, `app/api/**`, `scripts/` (Agent 1), `infra/**` (Agent 3).
**Contract**: build against `api-spec.md` only — never import from `src/server/` except the shared response types re-exported from `src/lib/api-types.ts`. Do not change the spec unilaterally.
**Blocked on**: Agent 1's task 1.1 (repo scaffold). Everything after that runs in parallel with the backend via the mock client (task 1.1 below).

## Tasks

- [ ] 1. API client
  - [ ] 1.1 Implement the typed API client with a mock mode
    - `src/lib/api.ts`: `ChatApi` implementing every endpoint in `api-spec.md`; `NEXT_PUBLIC_API_MOCK=1` swaps in an in-memory mock returning spec-conformant fixtures (incl. a `walking_distance` and a `search_courses` tool call, a `warning` case, 400/401 cases) so all UI work proceeds without a deployed backend
    - _Requirements: 6.1_

- [ ] 2. Authentication
  - [ ] 2.1 Implement Cognito auth in the app
    - `react-oidc-context` against the Cognito hosted UI (Google); ID token attached as `Authorization: Bearer` to all `/api/*` calls; silent token refresh restores the session on return; 401 responses redirect to sign-in
    - _Requirements: 1.1, 1.4_

- [ ] 3. Chat UI
  - [ ] 3.1 Implement the chat panel
    - Message list + input; in-flight loading state disabling submit (10–30 s responses per spec); error banner with retry resending the same message; `warning` field rendered inline
    - _Requirements: 6.1, 6.2, 6.5_
  - [ ] 3.2 Implement the tool-call renderer registry
    - `renderers: Record<string, ToolCallRenderer>` keyed by `ToolCall.name` with generic-badge fallback; `search_courses` course cards from `result.courses`; `walking_distance` renderer emitting highlight state for the map from `input` + `result`; error results (`status: "error"`) render as badge only
    - _Requirements: 6.3_
  - [ ] 3.3 Implement the session sidebar
    - List sessions from `GET /api/sessions`; selecting one loads its history via `GET /api/sessions/{id}`; "New chat" generates a fresh client-side UUID `session_id`
    - _Requirements: 6.4_

- [ ] 4. Campus map
  - [ ] 4.1 Implement the Campus_Map component
    - deck.gl v9 `GeoJsonLayer` over a MapLibre basemap; buildings from `/api/geo/buildings` with pick-tooltip showing `properties.NAME` / `properties.BLDG_CODE`; optional walking-routes base layer from `/api/geo/walking-routes`; GeoJSON cached client-side after first fetch
    - _Requirements: 7.1, 7.3_
  - [ ] 4.2 Wire walking-distance highlights to the map
    - When the latest `ChatResponse` contains a `walking_distance` tool call: highlight both building footprints (matched by code from `input`), draw the centroid-to-centroid route line, label it with `result.meters` / `result.minutes`
    - _Requirements: 7.2_

- [ ] 5. Integration
  - [ ] 5.1 Switch off mock mode against the deployed stack and fix any spec drift
    - Run the full flow (sign-in → chat with two-tool question → session reload → map highlight) against the real API; any mismatch is reconciled through `api-spec.md`, not ad-hoc
    - _Requirements: 6.1, 6.4, 7.2_

- [ ] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- UI rendering is not property-testable; verify visually in mock mode, then via task 5.1
- Corresponds to master task 11 in `tasks.md` (plus the mock client and integration switchover)
- Task 5.1 needs Agent 3's deployed stack and Agent 1's handlers

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.3"] },
    { "id": 3, "tasks": ["4.2"] },
    { "id": 4, "tasks": ["5.1"] }
  ]
}
```
