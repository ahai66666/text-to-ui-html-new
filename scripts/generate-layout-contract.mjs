#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, readJson, stableJson } from './navigation-index-lib.mjs';
import { readPatternRegistry, resolvePatternContract } from './pattern-contract-lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.context || !args.out) {
  throw new Error('Usage: generate-layout-contract.mjs --context <context-packet.json> --out <layout-contract.json> [--pattern <approved-pattern-id>]');
}

const contextPath = path.resolve(args.context);
const context = readJson(contextPath);
if (context.request?.confirmed !== true || context.request?.confirmation?.status !== 'confirmed') {
  throw new Error('Context Packet is not confirmed. Generate a layout contract only after explicit user confirmation.');
}

const pattern = String(args.pattern || context.layout?.id || '');
if (!pattern) throw new Error('Context Packet must contain an approved layout Pattern ID.');
const resolvedPattern = resolvePatternContract(pattern, { registry: readPatternRegistry() });
const patternDefinition = resolvedPattern.pattern;
if (context.layout?.id && context.layout.id !== pattern) {
  throw new Error(`Context Packet Pattern '${context.layout.id}' does not match requested Pattern '${pattern}'.`);
}

const paneOrder = [...patternDefinition.paneOrder];
const insetOwners = Object.fromEntries(patternDefinition.regions.map((region) => [region.id, region.insetOwner]));
const scrollOwners = [...new Set(patternDefinition.regions.map((region) => region.scrollOwner).filter((owner) => paneOrder.includes(owner)))];
const layoutTokens = [...new Set([
  patternDefinition.titleLayer?.heightToken,
  ...patternDefinition.regions.map((region) => region.width?.token),
  'space/5',
  'space/6'
].filter(Boolean))];
const cssStructuralParametersByPattern = {
  'pattern-b-three-pane': [
    { property: '--task-list-width', value: '360px', reason: 'confirmed secondary-list pane baseline' },
    { property: '--minimum-window-width', value: '1100px', reason: 'confirmed HarmonyOS PC minimum window' }
  ]
};
const finalPaneLeadingSlot = pattern === 'pattern-b-three-pane' || (pattern === 'pattern-d-inspector' && paneOrder.includes('main-detail'))
  ? 'main-detail-operations'
  : 'main-content-title';

const contract = {
  schemaVersion: 1,
  platform: 'harmonyos-pc',
  generatedFrom: 'layout-index',
  pattern: patternDefinition.id,
  authority: resolvedPattern.authority,
  references: patternDefinition.references,
  viewport: { width: 1728, height: 1152, minWidth: patternDefinition.minimumWindow.width, minHeight: patternDefinition.minimumWindow.height },
  paneOrder,
  titleSegments: [...patternDefinition.titleLayer.segments],
  globalTitleLayer: patternDefinition.titleLayer.global,
  primaryActionSlot: 'primary-navigation-shell',
  finalPaneLeadingSlot,
  requiredSlots: [...(context.layout?.requiredSlots ?? patternDefinition.slots.filter((slot) => slot.cardinality === '1' || slot.cardinality === '1..n').map((slot) => slot.id))],
  insetOwners,
  scrollOwners,
  geometry: patternDefinition.geometry,
  resizeBehavior: patternDefinition.resizeBehavior,
  contentMode: 'default-content',
  layoutTokens,
  cssStructuralParameters: cssStructuralParametersByPattern[pattern] || []
};

const output = path.resolve(args.out);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, stableJson(contract));
console.log(`Layout contract written: ${output}`);
