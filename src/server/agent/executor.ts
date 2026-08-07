import { isToolError, type ToolErrorResult } from "@/src/shared/types";
import type { DatasetModule, SearchClient } from "../core/types";

export type { ToolErrorResult };
export { isToolError };

/** Dispatches a tool call across the module registry. Thrown errors, unknown
 *  tools, and empty results all become `{ status: 'error', message }`. */
export async function executeTool(
  modules: DatasetModule[],
  name: string,
  input: Record<string, unknown>,
  search: SearchClient,
): Promise<unknown> {
  const tool = modules.flatMap((m) => m.tools).find((t) => t.spec.name === name);
  if (!tool) return { status: "error", message: `Unknown tool: ${name}` };
  try {
    const result = await tool.execute(input, search);
    if (result == null || (Array.isArray(result) && result.length === 0)) {
      return { status: "error", message: `Tool ${name} returned no results` };
    }
    return result;
  } catch (e) {
    const message = e instanceof Error && e.message ? e.message : `Tool ${name} failed`;
    return { status: "error", message };
  }
}
