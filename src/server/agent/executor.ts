import { isToolError, type ToolErrorResult } from "@/src/shared/types";
import type { DatasetModule, OsClient } from "../core/types";

export type { ToolErrorResult };
export { isToolError };

/** Dispatches a tool call across the module registry. Thrown errors, unknown
 *  tools, and empty results all become `{ status: 'error', message }` — the
 *  agent loop must never die on a tool failure (Requirement 3.6). */
export async function executeTool(
  modules: DatasetModule[],
  name: string,
  input: Record<string, unknown>,
  os: OsClient,
): Promise<unknown> {
  const tool = modules.flatMap((m) => m.tools).find((t) => t.spec.name === name);
  if (!tool) return { status: "error", message: `Unknown tool: ${name}` };
  try {
    const result = await tool.execute(input, os);
    if (result == null || (Array.isArray(result) && result.length === 0)) {
      return { status: "error", message: `Tool ${name} returned no results` };
    }
    return result;
  } catch (e) {
    const message = e instanceof Error && e.message ? e.message : `Tool ${name} failed`;
    return { status: "error", message };
  }
}
