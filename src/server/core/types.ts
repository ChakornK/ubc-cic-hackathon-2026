// Core types shared by the agent loop, dataset modules, and API handlers.
// Response shapes must match .kiro/specs/campus-ai-assistant/api-spec.md.

import type { ChatMessage, ChatResponse } from "@/src/shared/types";

export {
  type ChatMessage,
  type ChatResponse,
  type LngLat,
  type Profile,
  type SessionSummary,
  type ToolCall,
  type ToolErrorResult,
  isToolError,
  haversineMeters,
  haversineMetersObj,
  WALK_SPEED_M_PER_MIN,
  ESTIMATE_DETOUR,
} from "@/src/shared/types";

export interface ChatRequest {
  session_id?: string;
  messages: ChatMessage[];
}

export type AgentResult = ChatResponse;

// Bedrock Converse wire shapes (structural subset of the SDK types)

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: { json: Record<string, unknown> };
}

export interface ContentBlock {
  text?: string;
  toolUse?: { toolUseId: string; name: string; input: Record<string, unknown> };
  toolResult?: { toolUseId: string; content: { json: unknown }[]; status?: "error" };
}

export interface ConverseMessage {
  role: "user" | "assistant";
  content: ContentBlock[];
}

export type ConverseFn = (req: {
  messages: ConverseMessage[];
  system: string;
  toolSpecs: ToolSpec[];
}) => Promise<{ stopReason: string; message: ConverseMessage }>;

// Dataset module system

export interface S3Reader {
  getJson(key: string): Promise<unknown>;
}

export interface S3Writer extends S3Reader {
  putJson(key: string, value: unknown): Promise<void>;
}

/** Structural subset of @opensearch-project/opensearch's Client used by tools. */
export interface OsClient {
  search(params: { index: string; body: Record<string, unknown> }): Promise<{
    // biome-ignore lint/suspicious/noExplicitAny: _source shape is per-index; tools cast
    body: { hits: { hits: { _id: string; _source: any; highlight?: Record<string, string[]> }[] } };
  }>;
  get(params: { index: string; id: string }): Promise<{
    // biome-ignore lint/suspicious/noExplicitAny: _source shape is per-index; tools cast
    body: { _source: any };
  }>;
}

// biome-ignore lint/suspicious/noExplicitAny: raw rows are dataset-specific
export interface IndexDef<TRaw = any> {
  index: string;
  mappings: Record<string, unknown>;
  read(s3: S3Reader): AsyncIterable<TRaw>;
  transform(raw: TRaw): { _id: string; doc: unknown } | null;
  derive?(s3: S3Writer): Promise<void>;
}

export interface ToolDef {
  spec: ToolSpec;
  execute(input: Record<string, unknown>, os: OsClient): Promise<unknown>;
}

export interface GeoArtifact {
  name: string;
  s3Key: string;
}

export interface DatasetModule {
  name: string;
  indices: IndexDef[];
  tools: ToolDef[];
  geo?: GeoArtifact[];
}
