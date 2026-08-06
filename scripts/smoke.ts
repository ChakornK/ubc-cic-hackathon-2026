// Integration smoke test against a deployed stack.
// Usage: STACK_URL=https://xxx AUTH_TOKEN=yyy npx tsx scripts/smoke.ts

import * as path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const STACK_URL = process.env.STACK_URL?.replace(/\/$/, "");
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!STACK_URL || !AUTH_TOKEN) {
  console.error("Required env vars: STACK_URL, AUTH_TOKEN");
  process.exit(1);
}

const CHAT_ENDPOINT = `${STACK_URL}/api/chat`;

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

interface ChatResponse {
  message: string;
  tool_calls: ToolCall[];
  warning?: string;
}

async function chat(question: string): Promise<{ status: number; body: ChatResponse }> {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      session_id: crypto.randomUUID(),
      messages: [{ role: "user", content: question }],
    }),
  });
  const body = await res.json();
  return { status: res.status, body: body as ChatResponse };
}

// Checks that a tool_call result is non-empty (not null, not empty object/array/string).
function resultIsNonEmpty(result: unknown): boolean {
  if (result == null) return false;
  if (typeof result === "string") return result.length > 0;
  if (Array.isArray(result)) return result.length > 0;
  if (typeof result === "object") {
    // Check it's not an error response and has real content
    const obj = result as Record<string, unknown>;
    if (obj.status === "error") return false;
    return Object.keys(obj).length > 0;
  }
  return true;
}

async function testMultiToolQuestion(): Promise<void> {
  console.log("\n--- Multi-tool sample question ---");
  const { status, body } = await chat(
    "How long is the walk from the Buchanan building to the ICICS building, and what Computer Science courses have no prerequisites?",
  );
  assert(status === 200, "HTTP 200");
  assert(Array.isArray(body.tool_calls), "tool_calls is array");
  assert(body.tool_calls.length >= 2, `tool_calls.length >= 2 (got ${body.tool_calls.length})`);
}

async function testTool(name: string, question: string): Promise<void> {
  console.log(`\n--- Tool: ${name} ---`);
  const { status, body } = await chat(question);
  assert(status === 200, `${name}: HTTP 200`);

  const call = body.tool_calls?.find((tc) => tc.name === name);
  assert(call != null, `${name}: tool was called`);
  if (call) {
    assert(resultIsNonEmpty(call.result), `${name}: result is non-empty`);
  }
}

async function testIngestIdempotency(): Promise<void> {
  console.log("\n--- Ingest idempotency ---");

  // Query doc counts before re-ingest
  const countsBefore = await getDocCounts();
  if (!countsBefore) {
    console.log("  SKIP: could not query OpenSearch doc counts (no OPENSEARCH_ENDPOINT)");
    return;
  }

  // Run ingest
  const { execSync } = await import("node:child_process");
  try {
    execSync("npm run ingest", {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
      timeout: 120_000,
    });
  } catch (e) {
    console.error("  FAIL: ingest script exited non-zero");
    failed++;
    return;
  }

  // Query doc counts after
  const countsAfter = await getDocCounts();
  if (!countsAfter) {
    console.error("  FAIL: could not query OpenSearch after ingest");
    failed++;
    return;
  }

  for (const index of Object.keys(countsBefore)) {
    assert(
      countsBefore[index] === countsAfter[index],
      `${index}: count unchanged (${countsBefore[index]} -> ${countsAfter[index]})`,
    );
  }
}

// Queries OpenSearch _cat/indices for doc counts via SigV4-signed request.
async function getDocCounts(): Promise<Record<string, number> | null> {
  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  if (!endpoint) return null;

  const { fromNodeProviderChain } = await import("@aws-sdk/credential-providers");
  const aws4 = await import("aws4");

  const credentials = await fromNodeProviderChain()();
  const region = process.env.AWS_REGION ?? "us-east-1";

  const opts = aws4.sign(
    {
      host: endpoint,
      path: "/_cat/indices?format=json",
      service: "es",
      region,
      headers: { "Content-Type": "application/json" },
    },
    {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  );

  const res = await fetch(`https://${endpoint}/_cat/indices?format=json`, {
    headers: opts.headers as Record<string, string>,
  });
  if (!res.ok) return null;

  const indices = (await res.json()) as Array<{ index: string; "docs.count": string }>;
  const counts: Record<string, number> = {};
  for (const idx of indices) {
    if (!idx.index.startsWith(".")) {
      counts[idx.index] = Number.parseInt(idx["docs.count"], 10);
    }
  }
  return counts;
}

async function main(): Promise<void> {
  console.log(`Smoke test against ${STACK_URL}`);

  await testMultiToolQuestion();

  // Targeted single-tool questions to validate each tool returns data
  await testTool("search_courses", "List Computer Science courses with no prerequisites.");
  await testTool("get_course", "Give me the details of CPSC 110.");
  await testTool(
    "get_tuition",
    "What is the per-credit tuition for the Computer Science program for domestic students in 2024?",
  );
  await testTool("walking_distance", "How long does it take to walk from the Buchanan building to the ICICS building?");

  await testIngestIdempotency();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
