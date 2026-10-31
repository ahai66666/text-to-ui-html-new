#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { inspectHtmlArtifact } from "./html-artifact-graph.mjs";

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const valuesFor = (flag) => args.flatMap((value, index) => value === flag && args[index + 1] ? [args[index + 1]] : []);
const manifestPath = valueFor("--manifest");
const artifactPath = valueFor("--artifact");
const requiredStylesheets = valuesFor("--required-stylesheet");
if (!manifestPath || !artifactPath) {
  throw new Error("Usage: stamp-html-artifact.mjs --manifest <html-page-manifest.json> --artifact <index.html> [--required-stylesheet <file>]...");
}

const absoluteManifest = path.resolve(manifestPath);
const absoluteArtifact = path.resolve(artifactPath);
if (!fs.existsSync(absoluteManifest)) throw new Error(`HTML manifest not found: ${absoluteManifest}`);
if (!fs.existsSync(absoluteArtifact)) throw new Error(`Delivery artifact not found: ${absoluteArtifact}`);
const manifest = JSON.parse(fs.readFileSync(absoluteManifest, "utf8"));
const html = fs.readFileSync(absoluteArtifact, "utf8");
const sha256 = (contents) => crypto.createHash("sha256").update(contents).digest("hex");
const artifactDirectory = path.dirname(absoluteArtifact);
const graph = inspectHtmlArtifact(absoluteArtifact);
const stylesheetRecords = graph.stylesheets.map(absolute => {
  const contents = fs.readFileSync(absolute);
  if (!contents.length) throw new Error("Empty stylesheet: " + absolute);
  return { href: path.relative(artifactDirectory, absolute).split(path.sep).join("/"),
    path: path.relative(path.dirname(absoluteManifest), absolute), sha256: sha256(contents), bytes: contents.length };
});
for (const required of requiredStylesheets) {
  const absolute = path.resolve(required);
  if (!fs.existsSync(absolute)) throw new Error(`Required stylesheet not found: ${absolute}`);
  if (!stylesheetRecords.some((entry) => path.resolve(path.dirname(absoluteManifest), entry.path) === absolute)) {
    throw new Error(`Required stylesheet is not linked by the delivery artifact: ${absolute}`);
  }
}
if (manifest.targetFramework === "html" && stylesheetRecords.length === 0) throw new Error("HTML delivery artifact must load a local stylesheet through its HTML/module graph");

manifest.deliveryArtifact = {
  path: path.relative(path.dirname(absoluteManifest), absoluteArtifact) || path.basename(absoluteArtifact),
  sha256: sha256(fs.readFileSync(absoluteArtifact)),
  stylesheets: stylesheetRecords,
  dependencyGraph: { digest: graph.digest, files: graph.files.map(({file,...row}) => ({path:path.relative(path.dirname(absoluteManifest),file),...row})) },
  stampedAt: new Date().toISOString()
};
fs.writeFileSync(absoluteManifest, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, artifact: absoluteArtifact, stylesheets: stylesheetRecords.map((entry) => entry.href) }, null, 2));
