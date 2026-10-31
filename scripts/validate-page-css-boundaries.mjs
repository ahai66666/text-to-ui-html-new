#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { findPageViewportBoundaryFailures } from "./page-viewport-boundary.mjs";

const args = process.argv.slice(2);
const valueFor = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : null; };
const sources = args.flatMap((arg, index) => arg === "--source" ? [args[index + 1]] : []).filter(Boolean);
if (!sources.length) throw new Error("Usage: validate-page-css-boundaries.mjs --source <css-file-or-directory> [--source <...>]");
const forbidden = /(?:\[data-(?:pattern|tui-pane-role|pattern-region|pattern-shell-slot)|\.tui-(?:pattern|runtime-card|sidebar|titlebar)\b)/;
const canvasRoot = /(?:^|,)\s*(?:html|body|main|#app|\[data-tui-pattern\]|\.tui-pattern-runtime)\b/i;
// Match Pattern-specific wrappers without banning ordinary business shells
// (for example a mail composer card named `.fixture-demo-shell`). A shell is
// protected when it also names a Pattern, pane, or Titlebar boundary.
const shellLikeSelector = /(?:^|[.#\s>])[^,]*\b(?:pattern|pane|titlebar)\b/i;
const strokeProperty = /\b(?:border(?:-(?:top|right|bottom|left|inline-start|inline-end|block-start|block-end))?|outline|box-shadow)\s*:/i;
const persistentOutline = /\boutline(?:-(?:color|style|width|offset))?\s*:\s*(?!0(?:px)?\b|none\b|var\(--color-focus-ring\b)/i;
const dividerSelector = /(?:^|[.#\s>])[^,]*\b(?:divider|separator|resizer|splitter|resize-handle|drag-divider)\b/i;
const failures = [];
const files = sources.flatMap((source) => {
  const resolved = path.resolve(source);
  if (fs.statSync(resolved).isDirectory()) return fs.readdirSync(resolved).filter((file) => file.endsWith(".css")).map((file) => path.join(resolved, file));
  return [resolved];
});
for (const file of files) {
  const css = fs.readFileSync(file, "utf8");
  for (const failure of findPageViewportBoundaryFailures(css)) failures.push(`${path.relative(process.cwd(), file)} ${failure}`);
  for (const match of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const body = match[2];
    if (shellLikeSelector.test(selector) && strokeProperty.test(body)) {
      failures.push(`${path.relative(process.cwd(), file)} page CSS cannot add a border, outline, or shadow to Pattern shell-like selector '${selector}'; Runtime owns structural divider edges`);
    }
    if (!/:focus-visible\b/i.test(selector) && persistentOutline.test(body)) {
      failures.push(`${path.relative(process.cwd(), file)} page CSS outline is reserved for :focus-visible component states: '${selector}'`);
    }
    if (dividerSelector.test(selector) && strokeProperty.test(body) && !/var\(\s*--layout-navigation-divider-width\b/i.test(body)) {
      failures.push(`${path.relative(process.cwd(), file)} divider/separator/resizer strokes must use --layout-navigation-divider-width: '${selector}'`);
    }
  }
  const lines = css.split("\n");
  let selector = "";
  for (const [line, text] of lines.entries()) {
    if (forbidden.test(text)) failures.push(`${path.relative(process.cwd(), file)}:${line + 1} page CSS cannot override Pattern-owned selectors`);
    if (text.includes("{")) selector = text.split("{")[0].trim();
    if (canvasRoot.test(selector) && /\b(?:width|height)\s*:\s*\d+(?:\.\d+)?px\b/i.test(text)) failures.push(`${path.relative(process.cwd(), file)}:${line + 1} HTML runtime cannot fix a canvas width or height; only Pixso import may use a board size`);
    if (canvasRoot.test(selector) && /\btransform\s*:\s*scale\s*\(/i.test(text)) failures.push(`${path.relative(process.cwd(), file)}:${line + 1} HTML runtime cannot scale a fixed canvas; use responsive layout instead`);
    if (text.includes("}")) selector = "";
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Pattern CSS boundaries valid: ${files.length} stylesheet(s)`);
