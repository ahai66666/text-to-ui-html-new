#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { locateMonorepo, parseArgs, resolveSkillRoot } from './navigation-index-lib.mjs';
import {
  assertRouteMaterialSourceFresh,
  materialSnapshot,
  readGeneratedRouteMaterialIndex,
} from './route-material-lib.mjs';

const args = parseArgs(process.argv.slice(2));
const routeId = String(args.route ?? '').trim();
const receiptPath = args.receipt ? path.resolve(String(args.receipt)) : null;
if (!routeId || !receiptPath) throw new Error('Usage: verify-route-materials.mjs --route <route-id> --receipt <route-read-receipt.json> [--repo <monorepo>] [--skill-root <skill-root>]');
const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error(`Text-to-UI Monorepo not found. Tried:\n${located.attempted.join('\n')}`);
const repo = located.root;
const skillRoot = resolveSkillRoot(repo, args['skill-root']);
const index = assertRouteMaterialSourceFresh({ repo, skillRoot, index: readGeneratedRouteMaterialIndex(skillRoot) });
const route = index.routes?.[routeId];
if (!route) throw new Error(`Route material index is missing route '${routeId}'`);
if (!fs.existsSync(receiptPath)) throw new Error(`Route material read receipt is missing: ${receiptPath}`);
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
if (receipt.schemaVersion !== 1 || receipt.kind !== 'text-to-ui-route-read-receipt') throw new Error('Unsupported route material read receipt');
if (receipt.routeId !== routeId) throw new Error(`Read receipt route '${receipt.routeId}' does not match '${routeId}'`);
if (receipt.materialsDigest !== route.materialsDigest) throw new Error(`Read receipt is for stale route materials: expected ${route.materialsDigest}, got ${receipt.materialsDigest}`);
const current = materialSnapshot({
  repo,
  skillRoot,
  definitions: route.materials.map(({ path: materialPath, role, required }) => ({ path: materialPath, role, required }))
});
if (current.digest !== route.materialsDigest) throw new Error(`Route materials changed after index build: expected ${route.materialsDigest}, got ${current.digest}`);
const expected = new Map(route.materials.map((material) => [material.path, material]));
const actual = new Map((receipt.materials ?? []).map((material) => [material.path, material]));
const missing = [...expected.keys()].filter((materialPath) => !actual.has(materialPath));
const unexpected = [...actual.keys()].filter((materialPath) => !expected.has(materialPath));
const changed = [...expected.keys()].filter((materialPath) => actual.get(materialPath)?.sha256 !== expected.get(materialPath)?.sha256);
if (missing.length || unexpected.length || changed.length) {
  throw new Error(`Route material read receipt does not match the route closure.${missing.length ? ` Missing: ${missing.join(', ')}` : ''}${unexpected.length ? ` Unexpected: ${unexpected.join(', ')}` : ''}${changed.length ? ` Changed: ${changed.join(', ')}` : ''}`);
}
console.log(JSON.stringify({ ok: true, routeId, materialsDigest: current.digest, count: current.materials.length, receipt: receiptPath }, null, 2));
