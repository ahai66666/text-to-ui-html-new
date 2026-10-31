/**
 * Collect icon-resolution diagnostics. Generation turns a non-empty result
 * into a hard failure: business pages must use registered semantic aliases.
 */
export function validateSemanticIcons(value, aliases = {}, location = 'options', diagnostics = []) {
  if (!value || typeof value !== 'object') return diagnostics;
  for (const [key, item] of Object.entries(value)) {
    const pointer = `${location}.${key}`;
    if (['icon', 'iconName'].includes(key) && typeof item === 'string' && item.trim() && !Object.hasOwn(aliases, item)) {
      if (!diagnostics.some((entry) => entry.path === pointer && entry.alias === item)) {
        diagnostics.push({ path: pointer, alias: item, resolution: 'unregistered' });
      }
    }
    if (item && typeof item === 'object') validateSemanticIcons(item, aliases, pointer, diagnostics);
  }
  return diagnostics;
}
