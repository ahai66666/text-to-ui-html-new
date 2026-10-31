#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  console.error("Usage: node scripts/verify-html-artifact.mjs <absolute-html-path>");
  process.exit(2);
}

const input = process.argv[2];
if (!input) usage();

const htmlPath = path.resolve(input);
if (!fs.existsSync(htmlPath) || !fs.statSync(htmlPath).isFile()) {
  console.error("HTML artifact does not exist: " + htmlPath);
  process.exit(1);
}

const source = fs.readFileSync(htmlPath, "utf8");
const localReferences = [];
const referencePattern =
  /<(?:link|script|img|source|video|audio|object)\b[^>]*?\b(?:href|src|poster|data)\s*=\s*["']([^"']+)["'][^>]*>/gi;

for (const match of source.matchAll(referencePattern)) {
  const reference = match[1].trim();
  if (
    !reference ||
    reference.startsWith("#") ||
    reference.startsWith("data:") ||
    reference.startsWith("blob:") ||
    reference.startsWith("http://") ||
    reference.startsWith("https://") ||
    reference.startsWith("//") ||
    reference.startsWith("mailto:") ||
    reference.startsWith("javascript:")
  ) {
    continue;
  }
  const cleanReference = reference.split("#", 1)[0].split("?", 1)[0];
  if (!cleanReference) continue;
  localReferences.push({
    reference,
    resolvedPath: path.resolve(path.dirname(htmlPath), cleanReference),
  });
}

const missing = localReferences.filter(
  ({ resolvedPath }) =>
    !fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile(),
);
const result = {
  htmlPath,
  bytes: Buffer.byteLength(source),
  hasDoctype: /^\s*<!doctype\s+html\b/i.test(source),
  hasHtmlElement: /<html\b/i.test(source),
  hasBodyElement: /<body\b/i.test(source),
  localReferenceCount: localReferences.length,
  missingReferences: missing,
  status:
    missing.length === 0 &&
    /<html\b/i.test(source) &&
    /<body\b/i.test(source)
      ? "verified"
      : "failed",
};

console.log(JSON.stringify(result, null, 2));
if (result.status !== "verified") process.exit(1);
