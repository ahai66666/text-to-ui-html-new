#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "packages/component-contracts/src/components");
const metadataPath = path.join(root, "packages/component-contracts/src/registry.json");
const aggregatePath = path.join(root, "packages/component-contracts/src/components.json");
const checkOnly = process.argv.includes("--check");
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

if (!fs.existsSync(sourceDirectory) || !fs.existsSync(metadataPath)) {
  throw new Error("Expected component contracts and registry metadata under packages/component-contracts/src.");
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
const files = fs.readdirSync(sourceDirectory).filter((name) => name.endsWith(".json")).sort();
const components = files.map((name) => {
  const file = path.join(sourceDirectory, name);
  const component = JSON.parse(fs.readFileSync(file, "utf8"));
  if (component.id !== path.basename(name, ".json")) throw new Error(`${name}: filename must match component id '${component.id}'.`);
  const implementations = Object.keys(component.implementations ?? {});
  const frameworks = Object.keys(component.frameworks ?? {});
  if (implementations.some((framework) => framework !== "html") || frameworks.some((framework) => framework !== "html")) {
    throw new Error(`${name}: compact contracts may contain HTML implementation data only.`);
  }
  if (!component.logicalName) throw new Error(`${name}: logicalName is required.`);
  return component;
});

const ids = new Set();
const logicalNames = new Set();
for (const component of components) {
  if (ids.has(component.id)) throw new Error(`Duplicate component id: ${component.id}`);
  if (logicalNames.has(component.logicalName)) throw new Error(`Duplicate logicalName: ${component.logicalName}`);
  ids.add(component.id);
  logicalNames.add(component.logicalName);
}
if (components.length !== metadata.componentCount) {
  throw new Error(`Registry expects ${metadata.componentCount} components, found ${components.length}. Update registry metadata intentionally.`);
}

const aggregate = {
  schemaVersion: 1,
  contractVersion: metadata.contractVersion,
  components,
  registryPolicy: metadata.registryPolicy
};
const identityPath = path.join(root, "packages/components-html/src/identity-contracts.js");
const identityText = '// Generated from component-contracts/src/components/*.json. Do not edit.\nexport const componentIdentityContracts = Object.freeze(' + JSON.stringify(Object.fromEntries(components.filter(c => c.identityNode).map(c => [c.id, c.identityNode])), null, 2) + ');\n';
const aggregateText = json(aggregate);
const nextMetadata = {
  ...metadata,
  sourceDigest: digest(aggregateText)
};
const metadataText = json(nextMetadata);
const stale = !fs.existsSync(aggregatePath) || fs.readFileSync(aggregatePath, "utf8") !== aggregateText ||
  fs.readFileSync(metadataPath, "utf8") !== metadataText ||
  !fs.existsSync(identityPath) || fs.readFileSync(identityPath, "utf8") !== identityText;

if (checkOnly) {
  if (stale) {
    console.error("Component contract aggregate or registry digest is stale. Run pnpm components:registry:build.");
    process.exitCode = 1;
  } else {
    console.log(`Component contract registry current: ${components.length} HTML contracts.`);
  }
} else {
  fs.writeFileSync(identityPath, identityText);
  fs.writeFileSync(aggregatePath, aggregateText);
  fs.writeFileSync(metadataPath, metadataText);
  console.log(`Built compatibility aggregate from ${components.length} component files.`);
}
