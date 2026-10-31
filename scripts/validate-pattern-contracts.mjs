#!/usr/bin/env node
import path from "node:path";
import { parseArgs } from "./navigation-index-lib.mjs";
import { readPatternRegistry, validatePatternRegistry } from "./pattern-contract-lib.mjs";

const args = parseArgs(process.argv.slice(2));
const registry = readPatternRegistry(args.registry ? path.resolve(args.registry) : undefined);
const errors = validatePatternRegistry(registry);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Pattern Contracts valid: ${registry.patterns.length} canonical Patterns; authority=${registry.authority}.`);
