import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildIconSymbol, loadIconRegistry, normalizeMarkup } from "./icon-tools.mjs";

const args = process.argv.slice(2);
const files = [];
let strict = false;

for (const argument of args) {
  if (argument === "--") continue;
  else if (argument === "--strict") strict = true;
  else if (argument === "--warn-only") strict = false;
  else if (argument === "--help") {
    console.log("Usage: node scripts/audit-icons.mjs [--strict] <page.html> [...]");
    process.exit(0);
  } else files.push(resolve(argument));
}

if (files.length === 0) throw new Error("Provide at least one HTML file to audit");
const registry = await loadIconRegistry();
let failureCount = 0;

function report(file, level, message) {
  const output = `${level.toUpperCase()} ${file}: ${message}`;
  if (level === "error") {
    failureCount += 1;
    console.error(output);
  } else console.warn(output);
}

function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1] ?? null;
}

for (const file of files) {
  const html = await readFile(file, "utf8");
  const symbols = new Map();
  const symbolPattern = /<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/gi;
  let symbolMatch;

  while ((symbolMatch = symbolPattern.exec(html))) {
    const fullSymbol = symbolMatch[0];
    const attributes = symbolMatch[1];
    const id = attribute(attributes, "id");
    const alias = attribute(attributes, "data-icon-alias");
    if (!id) {
      report(file, "error", "Found a symbol without an id");
      continue;
    }
    symbols.set(id, fullSymbol);
    if (!alias) {
      report(file, strict ? "error" : "warning", `Untracked symbol #${id}; use the alias exporter or declare a documented manual fallback`);
      continue;
    }
    if (!registry.aliases[alias]) {
      report(file, "error", `Symbol #${id} uses unknown alias ${alias}`);
      continue;
    }
    const expected = await buildIconSymbol(alias, registry);
    if (normalizeMarkup(fullSymbol) !== normalizeMarkup(expected)) {
      report(file, "error", `Symbol #${id} does not match the exact registered source geometry for ${alias}`);
    }
  }

  const usePattern = /<use\b[^>]*(?:href|xlink:href)=["']#(icon-[^"']+)["'][^>]*\/?\s*>/gi;
  let useMatch;
  while ((useMatch = usePattern.exec(html))) {
    if (!symbols.has(useMatch[1])) report(file, "error", `Reference #${useMatch[1]} has no exported symbol`);
  }

  const withoutSprite = html.replace(/<!-- TEXT_TO_UI_ICON_SPRITE_START -->[\s\S]*?<!-- TEXT_TO_UI_ICON_SPRITE_END -->/g, "");
  const svgPattern = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi;
  let svgMatch;
  while ((svgMatch = svgPattern.exec(withoutSprite))) {
    const attributes = svgMatch[1];
    const body = svgMatch[2];
    const usesExportedIcon = /<use\b[^>]*(?:href|xlink:href)=["']#icon-/i.test(body);
    const hasGeometry = /<(?:path|rect|circle|ellipse|line|polyline|polygon)\b/i.test(body);
    const hasProvenance = /\bdata-icon-(?:source|manual-fallback)=/i.test(attributes);
    const isNonIconVisual = /\bdata-svg-role=["'](?:logo|illustration|chart|decoration)["']/i.test(attributes);
    if (hasGeometry && !usesExportedIcon && !hasProvenance && !isNonIconVisual) {
      report(file, strict ? "error" : "warning", "Found inline SVG geometry without source provenance; export a semantic alias or annotate an approved non-icon visual");
    }
  }

  if (symbols.size > 0) console.log(`OK ${file}: verified ${symbols.size} exact-source icon symbols`);
  else console.log(`OK ${file}: no generated icon symbols found`);
}

if (failureCount > 0) {
  console.error(`Icon audit failed with ${failureCount} error(s)`);
  process.exit(1);
}
