#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { locateMonorepo, parseArgs, resolveSkillRoot } from './navigation-index-lib.mjs';
import { materialSnapshot } from './route-material-lib.mjs';

const args = parseArgs(process.argv.slice(2));
const contextPath = args.context ? path.resolve(String(args.context)) : null;
const receiptPath = args.receipt ? path.resolve(String(args.receipt)) : null;
if (!contextPath || !receiptPath) throw new Error('Usage: verify-context-materials.mjs --context <context-packet.json> --receipt <context-material-receipt.json> [--repo <monorepo>] [--skill-root <skill-root>]');
if (!fs.existsSync(contextPath)) throw new Error(`Context Packet is missing: ${contextPath}`);
if (!fs.existsSync(receiptPath)) throw new Error(`Context material receipt is missing: ${receiptPath}`);
const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
if (context.schemaVersion !== 1 || !context.route?.workflowRouteId) throw new Error('Unsupported Context Packet');
if (receipt.schemaVersion !== 1 || receipt.kind !== 'text-to-ui-context-material-receipt') throw new Error('Unsupported context material receipt');
if (receipt.workflowRouteId !== context.route.workflowRouteId) throw new Error(`Receipt workflow route '${receipt.workflowRouteId}' does not match '${context.route.workflowRouteId}'`);
if (receipt.materialsDigest !== context.materialsDigest) throw new Error(`Context material receipt is stale: expected ${context.materialsDigest}, got ${receipt.materialsDigest}`);
const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error(`Text-to-UI Monorepo not found. Tried:\n${located.attempted.join('\n')}`);
const repo = located.root;
const skillRoot = resolveSkillRoot(repo, args['skill-root']);
const definitions = (context.materials ?? []).map(({ path: materialPath, role, required }) => ({ path: materialPath, role, required }));
const current = materialSnapshot({ repo, skillRoot, definitions });
if (current.digest !== context.materialsDigest) throw new Error(`Context materials changed after resolution: expected ${context.materialsDigest}, got ${current.digest}`);
const expected = new Map(current.materials.map((material) => [material.path, material]));
const actual = new Map((receipt.materials ?? []).map((material) => [material.path, material]));
const missing = [...expected.keys()].filter((materialPath) => !actual.has(materialPath));
const unexpected = [...actual.keys()].filter((materialPath) => !expected.has(materialPath));
const changed = [...expected.keys()].filter((materialPath) => actual.get(materialPath)?.sha256 !== expected.get(materialPath)?.sha256);
if (missing.length || unexpected.length || changed.length) throw new Error(`Context material receipt does not match the resolved closure.${missing.length ? ` Missing: ${missing.join(', ')}` : ''}${unexpected.length ? ` Unexpected: ${unexpected.join(', ')}` : ''}${changed.length ? ` Changed: ${changed.join(', ')}` : ''}`);
console.log(JSON.stringify({ ok: true, workflowRouteId: context.route.workflowRouteId, materialsDigest: current.digest, count: current.materials.length, receipt: receiptPath }, null, 2));
