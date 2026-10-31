// Scope markers keep one maintained text source for full manuals and task views.
// Unknown selectors retain their sections; explicit/full reads retain everything.
export function projectResourceText(text, { contexts = null, pattern = null, full = false, allowedContexts = null, allowedPatterns = null } = {}) {
  const marker = /<!--\s*(tui-scope\s+(\{[\s\S]*?\})|\/tui-scope)\s*-->[ \t]*(?:\r?\n)?/g;
  let cursor = 0, open = false, active = true, result = "";
  for (const match of text.matchAll(marker)) {
    if (active) result += text.slice(cursor, match.index);
    if (match[2]) {
      if (open) throw new Error("Nested resource scopes are not supported");
      const scope = JSON.parse(match[2]);
      if (!Object.keys(scope).length || Object.keys(scope).some(k => !["contexts", "patterns"].includes(k))
        || Object.values(scope).some(v => !Array.isArray(v) || !v.length || v.some(x => typeof x !== "string" || !x))) throw new Error("Invalid resource scope");
      if (allowedContexts && scope.contexts?.some(v => !allowedContexts.includes(v))) throw new Error("Unknown semantic context in resource scope");
      if (allowedPatterns && scope.patterns?.some(v => !allowedPatterns.includes(v))) throw new Error("Unknown Pattern in resource scope");
      open = true;
      active = full || ((!scope.contexts || !contexts?.length || scope.contexts.some(v => contexts.includes(v)))
        && (!scope.patterns || !pattern || scope.patterns.includes(pattern)));
    } else {
      if (!open) throw new Error("Resource scope closed without an opening marker");
      open = false; active = true;
    }
    cursor = match.index + match[0].length;
  }
  if (open) throw new Error("Unclosed resource scope");
  result += text.slice(cursor);
  if (/<!--\s*\/?tui-scope\b/.test(result)) throw new Error("Malformed resource scope marker");
  return result;
}
export const stripResourceScopes = (text, options = {}) => projectResourceText(text, {...options, full: true});
