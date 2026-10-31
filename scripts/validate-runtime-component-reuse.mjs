#!/usr/bin/env node
import { validateComponentIdentityEvidence } from "../packages/components-html/src/component-identity.js";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const valueFor = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : undefined; };
const manifestPath = valueFor("--manifest");
const evidencePath = valueFor("--evidence");
if (!manifestPath || !evidencePath) { console.error("Usage: validate-runtime-component-reuse.mjs --manifest <component-usage.json> --evidence <runtime-evidence.json>"); process.exit(2); }
const manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.resolve(evidencePath), "utf8"));
const failures = [];
if (![2, 3].includes(manifest.schemaVersion) || manifest.enforcement !== "strict-source") failures.push("runtime reuse validation requires a strict-source schemaVersion 2 or 3 manifest");
if (evidence.schemaVersion !== 1 || !Array.isArray(evidence.components)) failures.push("runtime evidence must use schemaVersion 1 and contain components");
if (evidence.pattern !== manifest.layout?.pattern) failures.push(`runtime Pattern mismatch: expected ${manifest.layout?.pattern ?? "unknown"}, found ${evidence.pattern ?? "missing"}`);
if (evidence.structureDigest !== manifest.layout?.structureDigest) failures.push(`runtime structureDigest mismatch: expected ${manifest.layout?.structureDigest ?? "missing"}, found ${evidence.structureDigest ?? "missing"}`);
if (!Array.isArray(evidence.unclassifiedInteractive)) failures.push("runtime evidence must contain unclassifiedInteractive");
else if (evidence.unclassifiedInteractive.length) failures.push(`runtime contains ${evidence.unclassifiedInteractive.length} interactive element(s) that are neither registered components nor declared contract/custom UI`);
if (!Array.isArray(evidence.stylesheets) || evidence.stylesheets.length === 0) failures.push("runtime evidence must contain at least one loaded stylesheet");
else if (!evidence.stylesheets.some((item) => item.loaded === true && (item.ruleCount === null || item.ruleCount > 0))) failures.push("runtime evidence contains no stylesheet with readable non-empty rules");
failures.push(...validateComponentIdentityEvidence(evidence.components, evidence.identityViolations));
const patternLayout = evidence.patternLayout;
if (!patternLayout || !["grid", "flex"].includes(patternLayout.display)) failures.push(`runtime Pattern root must compute to grid or flex, found ${patternLayout?.display ?? "missing"}`);
const expectedRegions = manifest.layout?.paneOrder ?? [];
const runtimeRegions = Array.isArray(patternLayout?.regions) ? patternLayout.regions : [];
const tokenPixels = { "space/0": "0px", "space/3": "8px", "space/5": "16px", "space/6": "24px" };
const insetToPixels = (inset) => inset ? {
  paddingInlineStart: tokenPixels[inset.inlineStart] ?? null,
  paddingInlineEnd: tokenPixels[inset.inlineEnd] ?? null,
  paddingBlockStart: tokenPixels[inset.blockStart] ?? null,
  paddingBlockEnd: tokenPixels[inset.blockEnd] ?? null
} : null;
for (const region of expectedRegions) {
  const item = runtimeRegions.find((candidate) => candidate.region === region);
  if (!item) failures.push(`runtime Pattern region is missing layout evidence: ${region}`);
  else if (item.display === "none" || !item.bounds || item.bounds.width <= 0 || item.bounds.height <= 0) failures.push(`runtime Pattern region is not visibly laid out: ${region}`);
  const expectedGeometry = manifest.layout?.geometry?.regions?.[region];
  if (item && expectedGeometry) {
    if (manifest.layout.pattern === "pattern-b-three-pane" && region === "primary-navigation") {
      // Pattern B splits its navigation inset between the pane's top edge and
      // the scrollable Sidebar slot. Comparing only scroll-body padding would
      // miss this visible geometry (or incorrectly demand a second inset).
      const sidebarSlot = item.slots?.find((slot) => slot.id === "secondary-navigation-content");
      const expectedInline = insetToPixels(expectedGeometry.surfaceInset);
      if (!sidebarSlot || sidebarSlot.padding?.paddingInlineStart !== expectedInline?.paddingInlineStart || sidebarSlot.padding?.paddingInlineEnd !== expectedInline?.paddingInlineEnd) failures.push("runtime Pattern B Sidebar slot must own one 16px horizontal inset");
      if (item.padding?.paddingBlockStart !== "8px") failures.push("runtime Pattern B primary-navigation pane must own the 8px top inset");
      if (item.scrollBody?.padding?.paddingInlineStart !== "0px" || item.scrollBody?.padding?.paddingInlineEnd !== "0px") failures.push("runtime Pattern B navigation scroll body must not add a second horizontal inset");
      const actionSlot = item.slots?.find((slot) => slot.id === "global-primary-action");
      if (actionSlot && (actionSlot.padding?.paddingInlineStart !== "16px" || actionSlot.padding?.paddingInlineEnd !== "16px")) failures.push("runtime Pattern B global primary action must keep its single 16px inset");
    } else {
      const expectedBody = insetToPixels(expectedGeometry.scrollBody?.inset);
      const actualBody = item.scrollBody?.padding;
      if (!actualBody || Object.entries(expectedBody ?? {}).some(([key, value]) => value !== null && actualBody[key] !== value)) failures.push(`runtime Pattern region '${region}' scroll-body inset does not match the Pattern contract`);
    }
    if (expectedGeometry.title?.kind === "pane-segment" && (!item.title || item.title.bounds?.height !== 64)) failures.push(`runtime Pattern region '${region}' title segment does not preserve the canonical 64px title layer`);
  }
}
if (expectedRegions.length > 1 && expectedRegions.every((region) => runtimeRegions.some((item) => item.region === region))) {
  const ordered = expectedRegions.map((region) => runtimeRegions.find((item) => item.region === region));
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].bounds.x + 2 < ordered[index - 1].bounds.x + ordered[index - 1].bounds.width) failures.push(`runtime Pattern regions overlap or stack out of horizontal order: ${ordered[index - 1].region} -> ${ordered[index].region}`);
  }
}
for (const usage of manifest.registered ?? []) {
  const matches = (evidence.components ?? []).filter((item) => item.logicalName === usage.logicalName && (manifest.targetFramework !== "html" || item.rendererKey === usage.rendererKey) && (manifest.schemaVersion !== 3 || item.framework === manifest.targetFramework));
  if (usage.runtimeCountPolicy === "exact-items" && matches.length !== usage.expectedRuntimeCount) failures.push(`${usage.logicalName} expected exactly ${usage.expectedRuntimeCount} item(s), found ${matches.length}`);
  if (matches.length < (usage.expectedRuntimeCount ?? 1)) failures.push(`${usage.logicalName} expected at least ${usage.expectedRuntimeCount ?? 1} runtime instance(s), found ${matches.length}`);
  if (matches.some((item) => !item.visible && !(usage.rendererKey === "sidebar" && item.hiddenByDisclosure))) failures.push(`${usage.logicalName} has hidden or detached runtime evidence`);
  if (usage.regions?.length && matches.some((item) => !usage.regions.includes(item.region))) failures.push(`${usage.logicalName} rendered outside declared region(s): ${usage.regions.join(", ")}`);
  for (const requiredSlot of usage.requiredRuntimeSlots ?? []) if (!matches.some((item) => (item.slots?.includes(requiredSlot) || item.identity?.relatedSlots?.includes(requiredSlot)))) failures.push(`${usage.logicalName} is missing required runtime slot: ${requiredSlot}`);
}
for (const usage of manifest.contractBased ?? []) if (!(evidence.contractRegions ?? []).includes(usage.id)) failures.push(`contractBased runtime region is missing: ${usage.id}`);
for (const usage of manifest.custom ?? []) if (!(evidence.customRegions ?? []).includes(usage.id)) failures.push(`custom runtime region is missing: ${usage.id}`);
if (failures.length) { console.error("Runtime component reuse validation failed"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(JSON.stringify({ ok: true, url: evidence.url ?? null, componentCount: evidence.components.length, registeredCount: manifest.registered?.length ?? 0 }, null, 2));
