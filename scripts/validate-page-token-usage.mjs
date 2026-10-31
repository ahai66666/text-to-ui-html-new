#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { validatePageTokenUsage } from "./page-token-usage-lib.mjs";

const args = process.argv.slice(2);
const valueFor = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : undefined; };
const projectRoot = path.resolve(valueFor("--project-root") ?? process.cwd());
const layoutPath = valueFor("--layout-contract");
const sourceArgs = args.flatMap((arg, index) => arg === "--source" ? [args[index + 1]] : []).filter(Boolean);
if (sourceArgs.length === 0) { console.error("Usage: validate-page-token-usage.mjs --source <file-or-dir> [--source <file-or-dir>] --project-root <dir> [--layout-contract <file>]"); process.exit(2); }
const layout = layoutPath ? JSON.parse(fs.readFileSync(path.resolve(layoutPath), "utf8")) : {};
const report = validatePageTokenUsage({ sourcePaths: sourceArgs, projectRoot, layoutContract: layout, tokenRoots: args.flatMap((arg,index) => arg === '--token-root' ? [args[index+1]] : []).filter(Boolean) });
if (report.failures.length) {
  console.error("Page Token usage validation failed");
  report.failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  cssFiles: report.cssFiles.map((file) => path.relative(projectRoot, file)),
  tokenCount: report.tokenCount,
  structuralExceptions: report.structuralExceptions
}, null, 2));
