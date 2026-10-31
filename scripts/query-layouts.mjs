#!/usr/bin/env node
import { loadIndexes, locateMonorepo, parseArgs, print, resolveSkillRoot } from './navigation-index-lib.mjs';

const args = parseArgs(process.argv.slice(2));
const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error('Text-to-UI Monorepo not found');
const index = loadIndexes(resolveSkillRoot(located.root, args['skill-root']))['layout-index'];
const query = String(args.layout || args.workflow || '').toLowerCase();
const layouts = query ? index.layouts.filter((item) => [item.id, item.workflow, item.label].some((value) => value.toLowerCase().includes(query))) : index.layouts;
print({ repo: located.root, layouts });
