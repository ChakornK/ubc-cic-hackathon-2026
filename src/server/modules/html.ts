/** Good-enough HTML → text for search indexing: drops tags, decodes the common
 *  entities, collapses whitespace. Not a sanitizer — output is indexed, never
 *  rendered. */
export function stripHtml(html: unknown): string {
  return String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#\d+;|&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
