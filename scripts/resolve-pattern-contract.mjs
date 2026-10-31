#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./navigation-index-lib.mjs";
import { readPatternRegistry, resolvePatternContract } from "./pattern-contract-lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.pattern) {
  console.error("Usage: resolve-pattern-contract.mjs --pattern <pattern-id> [--registry <file>] [--page-spec <file>] [--layout-contract <file>] [--out <file>]");
  process.exit(2);
}
const readOptional = (file) => file ? JSON.parse(fs.readFileSync(path.resolve(file), "utf8")) : null;
const resolved = resolvePatternContract(String(args.pattern), {
  registry: readPatternRegistry(args.registry ? path.resolve(args.registry) : undefined),
  pageSpec: readOptional(args["page-spec"]),
  layoutContract: readOptional(args["layout-contract"])
});
const output = `${JSON.stringify(resolved, null, 2)}\n`;
if (args.out) {
  const file = path.resolve(args.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, output);
  console.log(`Resolved Pattern Contract written: ${file}`);
} else process.stdout.write(output);
