import fs from "node:fs";
import path from "node:path";

const visibleTokenProperty = /^(?:color|accent-color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-color|-width|-radius)?|outline(?:-color|-width)?|fill|stroke|box-shadow|text-shadow|font(?:-family|-size|-weight)?|line-height|letter-spacing|text-decoration-color|caret-color|column-rule-color|(?:row|column)-gap|gap|padding(?:-(?:top|right|bottom|left|inline|block))?|margin(?:-(?:top|right|bottom|left|inline|block))?|width|min-width|max-width|height|min-height|max-height)$/i;
const literalColor = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\s*\(/i;
const literalMetric = /-?(?:\d*\.)?\d+(?:px|rem|em|pt)\b/i;
const allowedKeyword = /^(?:0|auto|none|normal|inherit|initial|unset|transparent|currentColor|100%|min-content|max-content|fit-content)$/i;

const asAbsolute = (candidate, projectRoot) => path.isAbsolute(candidate)
  ? candidate
  : path.resolve(projectRoot, candidate);

const collectCssFiles = (candidate, projectRoot, cssFiles, failures, visited = new Set()) => {
  const absolute = asAbsolute(candidate, projectRoot);
  if (visited.has(absolute)) return;
  visited.add(absolute);
  if (!fs.existsSync(absolute)) {
    failures.push(`source not found: ${absolute}`);
    return;
  }
  const stat = fs.statSync(absolute);
  if (stat.isFile()) {
    if (absolute.endsWith(".css")) cssFiles.push(absolute);
    return;
  }
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    collectCssFiles(path.join(absolute, entry.name), projectRoot, cssFiles, failures, visited);
  }
};

const collectTokenNames = (roots) => {
  const names = new Set();
  const files = [];
  const visit = (candidate) => {
    if (!fs.existsSync(candidate)) return;
    const stat = fs.statSync(candidate);
    if (stat.isFile()) {
      if (candidate.endsWith(".css")) files.push(candidate);
      return;
    }
    for (const entry of fs.readdirSync(candidate, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
      visit(path.join(candidate, entry.name));
    }
  };
  roots.forEach(visit);
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) names.add(match[1]);
  }
  return { names, files };
};

const canonicalTokenRoots = (projectRoot, explicitRoots = []) => [
  ...explicitRoots.map((root) => asAbsolute(root, projectRoot)),
  path.join(projectRoot, "packages/tokens/src"),
  path.join(projectRoot, "node_modules/@text-to-ui/tokens/src"),
  path.join(projectRoot, "vendor/@text-to-ui/tokens/src"),
  path.join(projectRoot, "skill-support/assets/design-system")
];

/**
 * Validate page-owned CSS against the canonical Token registry.
 *
 * This is intentionally a library rather than a CLI-only check so the page
 * generator can reject an invalid page before it writes a preview artifact.
 * Component-library CSS is not scanned here: it is already owned by the
 * component package. Only page-owned CSS is in scope.
 */
export function validatePageTokenUsage({
  sourcePaths = [],
  projectRoot = process.cwd(),
  layoutContract = {},
  tokenRoots = []
} = {}) {
  const root = path.resolve(projectRoot);
  const failures = [];
  const cssFiles = [];
  for (const source of sourcePaths) collectCssFiles(source, root, cssFiles, failures);
  if (cssFiles.length === 0) failures.push("no editable CSS source was found");

  const structuralParameters = Array.isArray(layoutContract.cssStructuralParameters)
    ? layoutContract.cssStructuralParameters
    : [];
  const exceptions = new Set(structuralParameters.map((item) => `${item.property}:${item.value}`));
  for (const item of structuralParameters) {
    if (!item?.property || !item?.value || !item?.reason) {
      failures.push("layout-contract cssStructuralParameters entries require property, value, and reason");
    }
  }

  const existingTokenRoots = [...new Set(canonicalTokenRoots(root, tokenRoots))]
    .filter((candidate) => fs.existsSync(candidate));
  const { names: tokenNames } = collectTokenNames(existingTokenRoots);
  const localNames = new Set();
  const contents = cssFiles.map((file) => ({
    file,
    text: fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
  }));
  for (const { text } of contents) {
    for (const match of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) localNames.add(match[1]);
  }
  const knownNames = new Set([...tokenNames, ...localNames]);

  for (const { file, text } of contents) {
    const relative = path.relative(root, file);
    for (const reference of text.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
      if (!knownNames.has(reference[1])) failures.push(`${relative} references unknown Token ${reference[1]}`);
    }
    for (const match of text.matchAll(/(^|[;{])\s*([a-z-]+|--[a-z0-9-]+)\s*:\s*([^;{}]+)\s*(?=;|})/gim)) {
      const property = match[2];
      const value = match[3].trim();
      const key = `${property}:${value}`;
      const hasLiteral = literalColor.test(value) || literalMetric.test(value);
      if (property.startsWith("--")) {
        if (hasLiteral && !exceptions.has(key)) {
          failures.push(`${relative} custom property ${property} stores a literal (${value}); alias a canonical Token or declare a structural layout parameter`);
        }
        continue;
      }
      if (!visibleTokenProperty.test(property) || allowedKeyword.test(value)) continue;
      if (hasLiteral && !exceptions.has(key)) failures.push(`${relative} uses a literal visible value: ${property}: ${value}`);
    }
  }

  return {
    failures,
    cssFiles,
    tokenCount: tokenNames.size,
    canonicalTokenRoots: existingTokenRoots,
    structuralExceptions: exceptions.size
  };
}
