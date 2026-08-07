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

- [x] 6. Checkpoint - Verify build compiles
  - Only remaining errors are in search.ts/ingest.ts (Task 7 scope)
  - Excluded `infra/` from tsconfig
  - Fixed user-menu AppAuthUser references
  - Removed DynamoDB-based store.test.ts

- [x] 7. Search migration (Meilisearch)
  - [x] 7.1 Rewrite `src/server/search.ts` — MeiliSearch client
  - [x] 7.2 Rewrite `src/server/ingest.ts` — Meilisearch addDocuments
  - [x] 7.3 Rewrite all tool queries in dataset modules (11 modules)
  - [x] 7.4 Replace `OsClient` type with `SearchClient` in core/types.ts
  - Updated agent loop, executor, stream, API routes, and tests
  - All 97 tests pass

- [x] 8. Docker packaging
  - [x] 8.1 Create `Dockerfile` (multi-stage: deps → build → runner)
  - [x] 8.2 Create `docker-compose.yml` (app, postgres, meilisearch with health checks)
  - [x] 8.3 Create `.env.example`
  - [x] 8.4 Create `.dockerignore`

- [x] 9. Cleanup
  - [x] Removed `infra/` directory (CDK stack)
  - [x] Removed `scripts/sync-data.mjs` and `scripts/smoke.ts`
  - [x] Removed `sync-data` script from package.json
  - [x] Replaced `.env` with new self-hosted variables (no AWS secrets)
  - [x] Removed `workspaces` field from package.json

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
