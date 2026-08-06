// Core types shared by the agent loop, dataset modules, and API handlers.
// Response shapes must match .kiro/specs/campus-ai-assistant/api-spec.md.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  session_id?: string;
  messages: ChatMessage[];
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

export interface ChatResponse {
  message: string;
  tool_calls: ToolCall[];
  warning?: string;
}

export type AgentResult = ChatResponse;

export interface SessionSummary {
  session_id: string;
  title: string;
  updatedAt: string;
}

export interface Profile {
  preferences: Record<string, string>;
  email?: string;
  updatedAt?: string;
}

// --- Bedrock Converse wire shapes (structural subset of the SDK types) ---

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

// --- Dataset module system ---

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
