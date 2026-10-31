#!/usr/bin/env node
import { loadIndexes, locateMonorepo, normalizeList, parseArgs, print, resolveSkillRoot } from './navigation-index-lib.mjs';

const args = parseArgs(process.argv.slice(2));
const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error('Text-to-UI Monorepo not found');
const index = loadIndexes(resolveSkillRoot(located.root, args['skill-root']))['token-index'];
const roles = normalizeList(args.roles || args.role);
const semanticRoles = roles.length ? Object.fromEntries(roles.map((role) => [role, index.semanticRoles[role] || null])) : index.semanticRoles;
print({ repo: located.root, semanticRoles });
