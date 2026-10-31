// HTML output occupies the browser viewport directly. Only the host elements
// are checked here; backgrounds and cards inside the Pattern remain page UI.
const hostSelector = /^(?:html|body|#app)(?=$|[:.#\[])/i;
const nonzero = (value) => !/^(?:0(?:\.0+)?(?:px|rem|em|%)?|none|initial|unset)(?:\s+0(?:\.0+)?(?:px|rem|em|%)?)*$/i.test(value.trim());

export function findPageViewportBoundaryFailures(css) {
  const failures = [];
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of cleaned.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!selector.split(",").some((part) => hostSelector.test(part.trim()))) continue;
    for (const declaration of match[2].split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim().replace(/\s*!important\s*$/i, "");
      if (/^(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$/.test(property) && nonzero(value)) {
        failures.push(`${selector}: ${property} creates an outer HTML canvas gap`);
      } else if (/^max-(?:width|height)$/.test(property) && !/^(?:none|initial|unset|100%)$/i.test(value)) {
        failures.push(`${selector}: ${property} constrains the viewport host`);
      } else if (/^(?:border(?:-radius)?|box-shadow)$/.test(property) && nonzero(value)) {
        failures.push(`${selector}: ${property} adds an outer HTML frame`);
      }
    }
  }
  return failures;
}
