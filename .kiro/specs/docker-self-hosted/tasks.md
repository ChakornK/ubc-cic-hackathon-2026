# Implementation Plan: Docker Self-Hosted Migration

## Overview

Bottom-up migration: replace each AWS service adapter one at a time, keeping the app functional at each step. The search rewrite (Meilisearch) is the largest task and is done last since it touches every dataset module. Docker packaging is done after the code migration is complete.

## Tasks

- [x] 1. Project setup and dependency swap
  - Remove AWS SDK packages from `package.json`
  - Remove `oidc-client-ts`, `react-oidc-context`, `@smithy/types`, `@types/aws4`
  - Add `openai`, `pg`, `@types/pg`, `meilisearch`, `jose`, `bcryptjs`
  - Add `output: "standalone"` to `next.config.ts`
  - Run `npm install` to verify clean dependency tree
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 2. Data store (filesystem)
  - [x] 2.1 Replace `src/server/s3.ts` with filesystem implementation (`src/server/data.ts`)
  - [x] 2.2 Update `app/api/geo/[name]/route.ts` to use `fs.createReadStream`
  - Updated imports in `routing.ts`, `modules/buildings.ts`, `scripts/ingest.ts`
  - Deleted `src/server/s3.ts`

- [x] 3. Database layer (PostgreSQL)
  - [x] 3.1 Create `src/server/db.ts` — pg pool from DATABASE_URL
  - [x] 3.2 Create `src/server/db/schema.sql` — users, sessions, messages, profiles
  - [x] 3.3 Create `src/server/db/migrate.ts` — applies schema on startup
  - [x] 3.4 Rewrite `src/server/sessions/store.ts` — SQL queries, added createUser/getUserByUsername
  - Deleted `src/server/sessions/keys.ts`

- [x] 4. Authentication (JWT + password)
  - [x] 4.1 Rewrite `src/server/auth.ts` — jose JWT verification + signToken
  - [x] 4.2 Create auth API routes (`/api/auth/register`, `/api/auth/login`)
  - [x] 4.3 Replace client-side auth — removed OIDC, created login/register form
  - Deleted `src/lib/auth-config.ts`

- [x] 5. LLM adapter (OpenAI-compatible)
  - [x] 5.1 Create `src/server/llm.ts` — openai package, maps ConverseMessage ↔ OpenAI format
  - [x] 5.2 Update imports (stream.ts), deleted `src/server/bedrock.ts`

- [ ] 6. Checkpoint - Verify build compiles
  - `npm run build` with zero AWS env vars
  - Fix any remaining AWS imports
  - _Requirements: 7.4_

- [ ] 7. Search migration (Meilisearch)
  - [ ] 7.1 Rewrite `src/server/search.ts`
    - Replace OpenSearch client with `MeiliSearch` client
    - Read `MEILI_URL` and `MEILI_MASTER_KEY` env vars
    - _Requirements: 4.1_
  - [ ] 7.2 Rewrite `src/server/ingest.ts`
    - Replace OpenSearch bulk indexing with Meilisearch `addDocuments()`
    - Create indexes with correct `primaryKey`, `filterableAttributes`, `sortableAttributes`, `searchableAttributes` per dataset
    - _Requirements: 4.3_
  - [ ] 7.3 Rewrite tool queries in each dataset module
    - `src/server/modules/buildings.ts` — replace `os.get`, `term`, `multi_match` with Meilisearch `search()` + `filter`
    - `src/server/modules/courses.ts` — replace `terms`, `multi_match`, `bool` queries
    - `src/server/modules/admissions.ts` — replace `multi_match` + `term` filters
    - `src/server/modules/grades.ts` — replace `bool.filter` with Meilisearch filter strings
    - `src/server/modules/tuition.ts` — replace `term` + `match` fallback
    - `src/server/modules/pages.ts` — replace `multi_match` + `highlight`
    - `src/server/modules/calendar.ts` — replace `multi_match` + `range` filter
    - `src/server/modules/events.ts` — replace `multi_match` + `range` date filter
    - `src/server/modules/spaces.ts` — replace `bool.should` + `range` filters
    - `src/server/modules/places.ts` — replace `multi_match` via `searchNearable`
    - `src/server/modules/costs.ts` — replace `term` + `match` queries
    - _Requirements: 4.2_
  - [ ] 7.4 Update `OsClient` type in `src/server/core/types.ts`
    - Replace `OsClient` interface with Meilisearch-based `SearchClient` or remove and use `MeiliSearch` directly in tool signatures
    - Update `ToolDef.execute` signature accordingly
    - _Requirements: 4.2_

- [ ] 8. Docker packaging
  - [ ] 8.1 Create `Dockerfile`
    - Multi-stage: deps → build → runner (node:24-alpine)
    - Copy standalone output + static + public
    - _Requirements: 6.3_
  - [ ] 8.2 Create `docker-compose.yml`
    - Services: app, postgres, meilisearch
    - Named volumes: pgdata, msdata
    - Bind-mount `./data` for campus data
    - Health checks for postgres and meilisearch
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  - [ ] 8.3 Create `.env.example`
    - Document all environment variables with sensible defaults
    - _Requirements: 6.4_
  - [ ] 8.4 Create startup entrypoint script
    - Run DB migration on first boot
    - Wait for postgres/meilisearch to be healthy before starting app
    - _Requirements: 2.5, 6.2_

- [ ] 9. Cleanup
  - Remove `infra/` directory (CDK stack)
  - Remove `infra` from `workspaces` in root `package.json`
  - Remove `scripts/sync-data.mjs` (S3 sync no longer needed)
  - Update `.env` to new variable names
  - Remove unused OIDC env vars (`NEXT_PUBLIC_COGNITO_*`)
  - _Requirements: 7.3_

- [ ] 10. Final checkpoint - End-to-end verification
  - `docker compose up` starts all services
  - App accessible on configured port
  - Register user, login, send chat message (with mock LLM), verify response
  - Run ingest against local data, verify search returns results
  - _Requirements: 6.2, 7.4_

## Notes

- Tasks are ordered for incremental progress — each step leaves the app closer to building without AWS
- Task 7 (Meilisearch) is the largest unit of work due to 11+ dataset modules needing query rewrites
- The `infra/` directory is kept until task 9 so it can be referenced during migration
- Existing test suite (`vitest run`) should pass after task 6 checkpoint
