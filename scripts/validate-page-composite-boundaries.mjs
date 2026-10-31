#!/usr/bin/env node
/**
 * Page composites may supply business content only. Interactive primitives,
 * icons, and Pattern structure always come from the registered renderer.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const sources = args.flatMap((arg, index) => arg === "--source" ? [args[index + 1]] : []).filter(Boolean);
if (!sources.length) throw new Error("Usage: validate-page-composite-boundaries.mjs --source <module> [--source <module>]");

const prohibited = [
  { expression: /<\/?(?:button|input|select|textarea|svg|use)\b/i, message: "must not author native interactive controls or SVG; call renderComponent with a registered component" },
  { expression: /\bdocument\.querySelector(?:All)?\s*\(/, message: "must stay inside the supplied host; do not query the global document" },
  { expression: /\b(?:window|document)\.innerHTML\s*=/, message: "must not replace application or document markup" },
  { expression: /\bstyle\s*=|\.style\.|\.style\.setProperty\s*\(/i, message: "must not set inline styles; use token-validated page CSS" },
  { expression: /data-(?:pattern|tui-pane-role|pattern-region|pattern-shell-slot)\s*=/i, message: "must not author Pattern-owned structure" }
];

const files = [];
const collect = (candidate) => {
  const resolved = path.resolve(candidate);
  if (!fs.existsSync(resolved)) throw new Error(`Composite source not found: ${resolved}`);
  const stat = fs.statSync(resolved);
  if (stat.isFile()) { files.push(resolved); return; }
  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    if (entry.isDirectory() && !["node_modules", "dist", ".git"].includes(entry.name)) collect(path.join(resolved, entry.name));
    if (entry.isFile() && /\.(?:[cm]?js|html)$/i.test(entry.name)) files.push(path.join(resolved, entry.name));
  }
};
sources.forEach(collect);
const failures = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split("\n");
  lines.forEach((line, index) => {
    for (const rule of prohibited) if (rule.expression.test(line)) failures.push(`${file}:${index + 1} ${rule.message}`);
  });
  if (/\b(?:function\s+)?mount\s*(?:=)?\s*\([^)]*\brenderComponent\b/s.test(source) && !/\brenderComponent\s*\(/.test(source)) failures.push(`${file} accepts renderComponent but never calls it; registered controls must use the adapter`);
}
if (failures.length) {
  console.error("Page composite boundary validation failed");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Page composite boundaries valid: ${files.length} module(s)`);
