# Design Document: Docker Self-Hosted Migration

## Overview

This migration replaces all AWS-managed services with self-hosted alternatives running in Docker containers. The Next.js application remains unchanged at the framework level — it continues to use API routes, server components, and SSR — but the backing services move from Bedrock/DynamoDB/S3/Cognito/OpenSearch to an OpenAI-compatible LLM API, PostgreSQL, local filesystem, JWT auth, and Meilisearch.

The strategy is to keep the existing `src/server/core/types.ts` interface layer intact where possible, replacing only the concrete implementations behind each interface. The search layer (Meilisearch) is the largest rewrite since the query API is fundamentally different from OpenSearch's DSL.

## Architecture

```mermaid
graph TD
    subgraph Docker Compose
        APP[Next.js App :3000]
        PG[(PostgreSQL :5432)]
        MS[Meilisearch :7700]
    end

    APP -->|SQL via pg| PG
    APP -->|HTTP API| MS
    APP -->|OpenAI Chat API| LLM[External LLM Endpoint]
    APP -->|fs.readFile| VOL[/data volume/]

    USER[Browser] -->|HTTP| APP
```

**Containers:**

- `app` — Next.js standalone build (Node 24)
- `postgres` — PostgreSQL 16 (sessions, users, profiles)
- `meilisearch` — Meilisearch v1.x (full-text search)

**External:**

- LLM endpoint (Ollama on host, cloud API, etc.) — not containerized, configured via env var

**Volumes:**

- `pgdata` — PostgreSQL persistent storage
- `msdata` — Meilisearch persistent storage
- `./data` — bind-mount for campus data files (GeoJSON, JSON datasets)

## Components and Interfaces

### Component 1: LLM Adapter (`src/server/llm.ts`)

**Purpose**: Replaces `src/server/bedrock.ts`. Calls any OpenAI-compatible endpoint.

**Interface**:

```typescript
// Reuses existing ConverseFn signature from core/types.ts
export const converse: ConverseFn;

// Streaming variant — same event types as current converseStream
export async function* converseStream(req: {
  messages: ConverseMessage[];
  system: string;
  toolSpecs: ToolSpec[];
}): AsyncGenerator<ConverseStreamEvent>;
```

**Implementation approach**: Use the `openai` npm package (universal, works with Ollama/vLLM/LiteLLM/OpenRouter). Map the existing `ConverseMessage`/`ContentBlock` types to OpenAI's `ChatCompletionMessageParam`. Map `ToolSpec` to OpenAI function definitions. Stream via `stream: true`.

**Environment variables**:

- `LLM_BASE_URL` — e.g. `http://host.docker.internal:11434/v1` (Ollama)
- `LLM_MODEL` — e.g. `llama3.1` or `gpt-4o`
- `LLM_API_KEY` — optional, for cloud providers

---

### Component 2: Database Layer (`src/server/db.ts`, `src/server/sessions/store.ts`)

**Purpose**: Replaces DynamoDB with PostgreSQL via the `pg` package (no ORM).

**Interface**: Same exported functions from `store.ts` — `listSessions`, `getSessionMessages`, `appendExchange`, `getProfile`, `putProfile`. Internal implementation changes from DynamoDB operations to SQL queries.

```typescript
// New: user management
export async function createUser(username: string, passwordHash: string): Promise<string>; // returns user id
export async function getUserByUsername(username: string): Promise<{ id: string; passwordHash: string } | null>;
```

**Schema** (applied via a startup migration script):

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  interstitial JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  preferences JSONB DEFAULT '{}',
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Environment variable**: `DATABASE_URL` — e.g. `postgres://user:pass@postgres:5432/reogent`

---

### Component 3: Data Store (`src/server/data.ts`)

**Purpose**: Replaces `src/server/s3.ts`. Reads/writes JSON files from a local directory.

**Interface**: Implements existing `S3Reader`/`S3Writer` interface from `core/types.ts`:

```typescript
export function dataStore(basePath?: string): S3Writer {
  // basePath defaults to process.env.DATA_PATH || '/data'
  // getJson(key) → JSON.parse(fs.readFile(path.join(basePath, key)))
  // putJson(key, value) → fs.writeFile(path.join(basePath, key), JSON.stringify(value))
}
```

The `app/api/geo/[name]/route.ts` endpoint changes from S3 `GetObjectCommand` to `fs.createReadStream`.

**Environment variable**: `DATA_PATH` — defaults to `/data`

---

### Component 4: Search Client (`src/server/search.ts`)

**Purpose**: Replaces OpenSearch SigV4 client with Meilisearch HTTP client.

**Interface**: The existing `OsClient` interface is dropped. A new `SearchClient` wraps the `meilisearch` npm package:

```typescript
import { MeiliSearch } from "meilisearch";

export function getSearch(): MeiliSearch;
```

Each tool's `execute()` function is rewritten to use Meilisearch's API:

- `multi_match` → Meilisearch's `q` parameter (searches all searchable attributes)
- `term` filter → Meilisearch filter string: `field = 'value'`
- `range` filter → `field >= X AND field <= Y`
- `bool.must + filter` → combine `q` with filter string
- `sort` → Meilisearch `sort` parameter
- `highlight` → Meilisearch `attributesToHighlight`

**Ingest rewrite**: The `runIngest` function changes from OpenSearch bulk API to Meilisearch `addDocuments()` (which natively handles batching).

**Environment variables**:

- `MEILI_URL` — e.g. `http://meilisearch:7700`
- `MEILI_MASTER_KEY` — API key

---

### Component 5: Auth Module (`src/server/auth.ts`)

**Purpose**: Replaces Cognito JWT verification with self-issued JWTs.

**Interface**:

```typescript
// Existing interface preserved
export async function requireUser(request: Request): Promise<AuthedUser | Response>;

// New: registration and login endpoints
export async function registerUser(username: string, password: string): Promise<{ token: string }>;
export async function loginUser(username: string, password: string): Promise<{ token: string } | null>;
```

**Implementation**:

- Password hashing: `bcrypt` (via built-in Node.js `crypto.subtle` or `bcryptjs`)
- JWT signing/verification: `jose` package (lightweight, no native deps)
- Token payload: `{ sub: <user_id>, username }`, 7-day expiry
- Secret from env var `JWT_SECRET`

**Client side**: Replace `react-oidc-context`/`oidc-client-ts` with a simple login form. Store JWT in localStorage. Send as `Authorization: Bearer <token>` (same header pattern — `api.ts` barely changes).

---

### Component 6: Docker Configuration

**Dockerfile** (multi-stage):

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml**:

```yaml
services:
  app:
    build: .
    ports: ["${PORT:-3000}:3000"]
    env_file: .env
    depends_on: [postgres, meilisearch]
    volumes: ["./data:/data:ro"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: reogent
      POSTGRES_USER: reogent
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-reogent}
    volumes: ["pgdata:/var/lib/postgresql/data"]

  meilisearch:
    image: getmeili/meilisearch:v1
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY:-devkey}
    volumes: ["msdata:/meili_data"]

volumes:
  pgdata:
  msdata:
```

## Data Models

### Session/Message Model (PostgreSQL)

Replaces the DynamoDB single-table `PK=USER#<sub>, SK=SESSION#<id>` pattern with normalized relational tables (see schema in Component 2 above).

**Migration from DynamoDB key scheme**:

- `userPk(sub)` → `users.id` (UUID)
- `sessionSk(sessionId)` → `sessions.id` (UUID)
- `messageSk(sessionId, seq)` → `messages.id` (auto-increment, ordered by `created_at`)
- `messageCount` atomic increment → `INSERT RETURNING` or `SELECT count(*)`

### Search Document Model (Meilisearch)

Each current OpenSearch index becomes a Meilisearch index. Documents keep the same shape. Key differences:

- Meilisearch requires a primary key field (use `id` or `_id` mapped to the existing `_id` from transforms)
- Filterable attributes must be declared at index creation
- Sortable attributes must be declared at index creation

Example index settings (buildings):

```json
{
  "primaryKey": "id",
  "searchableAttributes": ["code", "name", "aliases"],
  "filterableAttributes": ["code", "aliases"],
  "sortableAttributes": ["name"]
}
```

## Error Handling

### LLM Unreachable

**Condition**: `LLM_BASE_URL` endpoint doesn't respond within 5s or returns non-2xx
**Response**: Return `{ error: "LLM service unavailable" }` with 503 status to the client
**Recovery**: Next request retries (no circuit breaker needed for single-user self-hosted)

### Database Connection Failure

**Condition**: PostgreSQL connection refused or pool exhausted
**Response**: API returns 503; app logs the error
**Recovery**: `pg` pool auto-reconnects. Startup script retries connection with backoff.

### Meilisearch Unavailable

**Condition**: Meilisearch not ready or index missing
**Response**: Tool execution returns error message to the LLM (existing pattern — tools throw, agent loop catches)
**Recovery**: Ingest script creates indexes on run. Health check in docker-compose.

### Auth Disabled Mode

**Condition**: `AUTH_ENABLED=false` environment variable
**Response**: `requireUser()` returns a static `{ sub: "default", username: "local" }` user without checking headers
**Recovery**: N/A — intentional bypass for local-only deployments

## Testing Strategy

### Unit Testing Approach

- **LLM Adapter**: Mock the OpenAI client, verify message format translation (ConverseMessage → OpenAI format and back)
- **Auth Module**: Test JWT sign/verify round-trip, password hash/verify, expiry rejection
- **Data Store**: Test filesystem read/write against a tmp directory

### Integration Testing Approach

- **Database**: Use `docker compose up postgres` in CI, run session CRUD operations against real PG
- **Search**: Use `docker compose up meilisearch` in CI, ingest a small dataset, verify search returns expected results
- **End-to-end**: `docker compose up`, hit `/api/chat` with a mock LLM endpoint, verify full flow

### Smoke Test

- `docker compose up` → all containers healthy
- App responds on port 3000
- Build succeeds with zero AWS env vars

## Dependencies

**Add:**

- `openai` — OpenAI-compatible API client
- `pg` — PostgreSQL client
- `meilisearch` — Meilisearch JS client
- `jose` — JWT sign/verify
- `bcryptjs` — password hashing (pure JS, no native compile)

**Remove:**

- `@aws-sdk/client-bedrock-runtime`
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/client-s3`
- `@aws-sdk/credential-providers`
- `@aws-sdk/lib-dynamodb`
- `@opensearch-project/opensearch`
- `aws-jwt-verify`
- `oidc-client-ts`
- `react-oidc-context`
- `@smithy/types`
- `@types/aws4`

## Environment Variables

```env
# LLM
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=llama3.1
LLM_API_KEY=

# Database
DATABASE_URL=postgres://reogent:reogent@postgres:5432/reogent

# Search
MEILI_URL=http://meilisearch:7700
MEILI_MASTER_KEY=devkey

# Auth
AUTH_ENABLED=true
JWT_SECRET=change-me-in-production

# Data
DATA_PATH=/data

# App
PORT=3000
```
