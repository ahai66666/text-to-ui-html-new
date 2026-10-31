// Component identity is resolved before broad capability aliases in every entry.
export function componentImplementation(contract) {
  const source = contract.implementations?.html || contract.frameworks?.html?.source;
  if (!source) return null;
  const [sourcePath, exportName = "render"] = source.split("#");
  return { sourcePath, exportName };
}

export function resolveComponentQuery(index, key, rules = [], context = null) {
  const wanted = String(key ?? "").trim().toLowerCase();
  const exact = index.components.find(c => c.id.toLowerCase() === wanted);
  const compatibility = !exact ? index.compatibilityModules?.find(c => c.id === wanted) : null;
  const allMatchingRules = rules.filter(r => exact ? r.logicalName === exact.logicalName : r.capabilities.includes(wanted));
  const allowedContexts = [...new Set(allMatchingRules.map(r => r.context))];
  const matchingRules = context ? allMatchingRules.filter(r => r.context === context) : allMatchingRules;
  const contextMismatch = Boolean(context && allMatchingRules.length && !matchingRules.length);
  let candidates = exact ? [exact] : index.components.filter(c => c.capabilities.some(v => v.toLowerCase() === wanted)
    || allMatchingRules.some(r => r.logicalName === c.logicalName));
  if (!exact && context && matchingRules.length) candidates = candidates.filter(c => matchingRules.some(r => r.logicalName === c.logicalName));
  return { exact, compatibility, candidates, matchingRules, allMatchingRules, allowedContexts, contextMismatch };
}

export function compatibilityMessage(component) {
  return `Compatibility-only component '${component.id}' has no registered contract; it cannot be selected for a new page. ${component.instruction}`;
}

export function assertSemanticPattern(rules, pattern) {
  // Inspector bases need resolution before their inherited slots can be judged.
  if (!pattern || pattern.id === "pattern-d-inspector") return;
  const slots = new Set((pattern.slots || []).map(slot => slot.id));
  for (const rule of rules) if (rule.requiredSlot && !slots.has(rule.requiredSlot)) {
    throw new Error(`Semantic context '${rule.context}' requires slot '${rule.requiredSlot}', absent from ${pattern.id}`);
  }
}
