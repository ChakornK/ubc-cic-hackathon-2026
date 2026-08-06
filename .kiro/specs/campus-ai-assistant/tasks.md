# Implementation Plan: Campus AI Assistant

> **Parallel execution**: this master list is partitioned into three agent lanes with disjoint file ownership — `tasks-agent-1-backend.md`, `tasks-agent-2-frontend.md`, `tasks-agent-3-infra.md`. The frontend/backend interface is frozen in `api-spec.md`. Sync points: Agent 1's scaffold (1.1) unblocks Agent 2; Agent 3's first real deploy needs a compiling app; the smoke test runs last.

## Overview

Build bottom-up in one repository holding a single Next.js 16 app (browser UI + `app/api/*` route handlers + `src/server/*` logic) plus an `infra/` CDK workspace: pure core logic first (formatter, validation, agent loop — all property-tested against mocks), then the dataset-module registry and the three initial modules, then persistence, then the route handlers and auth middleware that wire it together, then CDK (deploying the app to Lambda via `cdk-nextjs`/OpenNext), ingest CLI, and the browser UI. Every piece is integrated by the route handlers/registry — no orphaned code.

## Tasks

- [ ] 1. Project setup
  - [x] 1.1 Scaffold the project
    - Next.js 16 (App Router, React 19) at the repo root with `src/server/` for backend logic; npm workspace `infra/` for CDK; `tsconfig` targeting ES2025; Node 24 engines field
    - vitest 4 + fast-check 4 configured for `src/server` and `infra`
    - _Requirements: 8.3_
  - [ ] 1.2 Define core types and interfaces
    - `src/server/core/types.ts`: `DatasetModule`, `IndexDef`, `ToolDef`, `GeoArtifact`, `ChatRequest`, `ChatMessage`, `ChatResponse`, `SessionSummary`, `AgentResult`, `ConverseFn`
    - _Requirements: 2.4, 3.5_

- [ ] 2. Pure core logic
  - [ ] 2.1 Implement Time_Formatter
    - `formatSeconds(s)` → zero-padded 24h `HH:MM`; out-of-range input returns the raw number as a string (never throws)
    - _Requirements: 3.7_
  - [ ]* 2.2 Write property test for Time_Formatter
    - **Property 1: Time formatting is correct and zero-padded**
    - **Validates: Requirements 3.7**
  - [ ] 2.3 Implement chat request validation
    - Parse body; reject non-JSON, missing `messages`, empty `messages` with a descriptive 400 payload
    - _Requirements: 2.8_
  - [ ]* 2.4 Write property test for request validation
    - **Property 5: Request validation**
    - **Validates: Requirements 2.8**

- [ ] 3. Agent loop
  - [ ] 3.1 Implement Tool_Executor
    - `executeTool(modules, name, input)`: dispatch across the module registry; thrown errors / unknown tools / empty results become `{ status: 'error', message }` tool results
    - _Requirements: 3.6_
  - [ ]* 3.2 Write property test for Tool_Executor
    - **Property 4: Tool failures are contained**
    - **Validates: Requirements 3.6**
  - [ ] 3.3 Implement Agent_Loop
    - `runAgentLoop(messages, deps)` with injected `converse` + tool registry; non-streaming Converse calls with system prompt and `toolConfig`; `tool_use` → execute + append `toolResult` blocks → loop; `end_turn` → return text + ordered `tool_calls`; `ITERATION_LIMIT = 8` with `warning` field; system prompt instructs tool use, citing the source tool, and human units (HH:MM, minutes, CAD)
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [ ]* 3.4 Write property test for loop termination
    - **Property 2: Agent loop terminates with the correct call count**
    - **Validates: Requirements 2.3, 2.5**
  - [ ]* 3.5 Write property test for tool-call fidelity
    - **Property 3: Every requested tool call is executed and reported**
    - **Validates: Requirements 2.3, 2.4**
  - [ ]* 3.6 Write unit tests for the system prompt
    - Assert it contains the tool-usage, citation, and human-units instructions
    - _Requirements: 2.7_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Dataset modules
  - [ ] 5.1 Implement OpenSearch client, module registry, and generic ingest runner
    - SigV4-signed `@opensearch-project/opensearch` client from env vars; `modules/index.ts` registry; runner iterates `IndexDef`s: create mapping if absent, stream `read()`, `transform()` to `{_id, doc}`, bulk index; run `derive()` hooks
    - _Requirements: 4.2, 4.3, 8.3_
  - [ ] 5.2 Implement the courses module
    - `read`: `academic-calendar/vancouver/courses.json` + `courses/sections.json` from S3; `transform`: dedupe catalogue by course code, join sections per QUERYING.md, carry `start_seconds`/`end_seconds`; tools `search_courses` (keyword + `subject`/`credits`/`term`/`has_no_prereqs`/`limit` filters) and `get_course` (full record incl. `prerequisite`/`corequisite` as JSON string); section times formatted via Time_Formatter
    - _Requirements: 3.1, 3.2, 3.7, 4.2_
  - [ ]* 5.3 Write property test for the prereq filter
    - **Property 6: `has_no_prereqs` filter semantics**
    - **Validates: Requirements 3.1**
  - [ ] 5.4 Implement the tuition module
    - `transform`: keep `unit === 'per_credit'` rows with numeric `amount`; derive `program_slug`; tool `get_tuition(program_slug, student_type, cohort_year)` → per-credit CAD rate
    - _Requirements: 3.3, 4.2_
  - [ ] 5.5 Implement the buildings module
    - `transform`: `ubcv_buildings.geojson` → `{code, name, lat, lon}` centroids; `derive`: pairwise `walking_distances` (haversine × 1.3, 80 m/min) written to `derived/walking_distances.json` and indexed, plus `derived/walking-routes.geojson` (pedestrian-only, properties stripped); tool `walking_distance(from_building, to_building)` trying both orderings; geo artifacts `buildings` and `walking-routes`
    - _Requirements: 3.4, 4.1, 4.2, 7.1_
  - [ ]* 5.6 Write property test for ingest document IDs
    - **Property 8: Ingest document IDs are deterministic and unique**
    - **Validates: Requirements 4.3**
  - [ ]* 5.7 Write unit tests for the module registry and tool specs
    - Registry consistency: tool/index/geo names unique across modules; every tool spec has typed properties, descriptions, and required fields; `formatSeconds(55800) === "15:30"`
    - _Requirements: 3.5_

- [ ] 6. Sessions and profiles
  - [ ] 6.1 Implement the key builder and Session_Store
    - Single-table DynamoDB items: session metadata (`title`, timestamps), messages (`SESSION#<id>#MSG#<seq>` zero-padded), profile; all PKs start with `USER#<sub>`
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [ ]* 6.2 Write property test for session keys
    - **Property 7: Session keys enforce ownership and order**
    - **Validates: Requirements 5.3, 5.4**
  - [ ] 6.3 Implement session and profile handlers
    - `GET /sessions` (summaries with title + updatedAt), `GET /sessions/{id}` (chronological history, 404 for non-owned), `GET`/`PUT /profile`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [ ]* 6.4 Write unit tests for session handlers
    - Session summary shape; history ordering; non-owned session returns 404 without data
    - _Requirements: 5.2, 5.4_

- [ ] 7. API route handlers
  - [ ] 7.1 Implement `requireUser` auth middleware and the route handlers
    - `requireUser`: verify the bearer ID token with `aws-jwt-verify` (issuer/audience/expiry, cached JWKS) → claims or 401; handlers `app/api/chat`, `app/api/sessions`, `app/api/sessions/[id]`, `app/api/profile`, `app/api/geo/[name]`; identity strictly from the verified token's `sub`; geo allowlist → stream from S3; chat: validate → `runAgentLoop` → persist user + assistant messages → respond; top-level try/catch → 500 JSON body
    - _Requirements: 1.2, 1.3, 2.1, 2.9, 5.1, 7.1_
  - [ ]* 7.2 Write unit tests for the route handlers
    - Missing/invalid/expired token → 401 (verifier mocked); 400 on malformed chat bodies through the full handler; 500 path returns JSON; unknown geo name rejected
    - _Requirements: 1.2, 2.8, 2.9_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Ingest CLI
  - [ ] 9.1 Implement the sync and ingest commands
    - `npm run sync-data` wrapping `aws s3 sync <Unified-UBC-Data>/data s3://<bucket>/data/`; `npm run ingest` running the registry-driven runner against the bucket; exit non-zero on any module failure
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10. Infrastructure
  - [ ] 10.1 Implement the CDK stack
    - Cognito user pool + Google IdP + hosted-UI domain + app client (callback to the CloudFront URL); `Nextjs` construct from `cdk-nextjs` (OpenNext) building the app onto a `NODEJS_24_X` server Lambda + CloudFront + S3 assets, with raised origin read timeout and env vars `BEDROCK_MODEL_ID`, `OPENSEARCH_ENDPOINT`, `TABLE_NAME`, `DATA_BUCKET` + Cognito pool/client IDs; DynamoDB table; `t3.small.search` OpenSearch domain; S3 data bucket (block public access); server role limited to `bedrock:InvokeModel`, table R/W, `es:ESHttp*` on the domain, `s3:GetObject` on the bucket
    - _Requirements: 1.1, 8.1, 8.2, 8.3_
  - [ ]* 10.2 Write CDK assertion tests
    - User pool has a Google IdP; server Lambda env vars set; IAM policy contains only the four grants
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11. Frontend
  - [ ] 11.1 Implement Cognito auth in the app
    - `react-oidc-context` against the Cognito hosted UI (Google); ID token attached to all same-origin `/api/*` calls; silent token refresh restores the session on return
    - _Requirements: 1.1, 1.4_
  - [ ] 11.2 Implement the API client and chat UI
    - Typed `ChatApi` client; message list + input; in-flight loading state disabling submit; error banner with retry resending the same message; `warning` field rendered inline
    - _Requirements: 6.1, 6.2, 6.5_
  - [ ] 11.3 Implement the tool-call renderer registry
    - `renderers: Record<string, ToolCallRenderer>` with fallback badge; `search_courses` course cards; `walking_distance` renderer emitting highlight state for the map
    - _Requirements: 6.3_
  - [ ] 11.4 Implement the session sidebar
    - List sessions from `GET /sessions`; selecting one loads its history; "New chat" generates a fresh `session_id`
    - _Requirements: 6.4_
  - [ ] 11.5 Implement the Campus_Map
    - deck.gl v9 `GeoJsonLayer` over a MapLibre basemap; buildings from `/geo/buildings` with pick-tooltip showing `NAME`/`BLDG_CODE`; optional walking-routes base layer; on `walking_distance` tool calls highlight both footprints and draw the centroid route line labeled with meters/minutes
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 12. Integration
  - [ ] 12.1 Write the README
    - Deploy steps, data sync + ingestion procedure, Google OAuth setup, and a sample request whose question requires at least two tool calls
    - _Requirements: 8.4_
  - [ ]* 12.2 Write the integration smoke script
    - Against a deployed stack: send the README sample question, assert 200 with ≥2 `tool_calls`; each tool returns a non-empty result; re-run ingest and assert index doc counts unchanged
    - _Requirements: 4.2, 4.3_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (fast-check, ≥100 runs, tagged `Feature: campus-ai-assistant, Property N: ...`)
- Unit tests validate specific examples and edge cases; CDK assertions cover infrastructure (no PBT for IaC)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.3", "5.1", "6.1", "10.1", "11.1"] },
    {
      "id": 3,
      "tasks": ["2.2", "2.4", "3.1", "5.2", "5.4", "5.5", "6.2", "6.3", "10.2", "11.2"]
    },
    {
      "id": 4,
      "tasks": ["3.2", "3.3", "5.3", "5.6", "5.7", "6.4", "9.1", "11.3", "11.4"]
    },
    { "id": 5, "tasks": ["3.4", "3.5", "3.6", "7.1", "11.5"] },
    { "id": 6, "tasks": ["7.2", "12.1", "12.2"] }
  ]
}
```
