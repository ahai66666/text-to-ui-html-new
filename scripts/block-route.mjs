import fs from 'node:fs';
import path from 'node:path';

export const blockReference = 'references/blocks/index.json';

export function readBlocks(skillRoot) {
  return JSON.parse(fs.readFileSync(path.join(skillRoot, blockReference), 'utf8')).blocks;
}

export function resolveBlocks(skillRoot, route, workflow, pattern, selectedId) {
  const allowedIds = new Set(route.blockCandidates ?? []);
  const candidates = allowedIds.size ? readBlocks(skillRoot).filter(block =>
    allowedIds.has(block.id) && block.workflows.includes(workflow) && (block.patterns ?? [block.pattern]).includes(pattern.id) &&
    pattern.paneOrder.includes(block.region)
  ) : [];
  const block = candidates.find(candidate => candidate.id === selectedId);
  if (selectedId && !block) {
    throw new Error(`BLOCK_NOT_APPLICABLE: ${selectedId} / ${workflow} / ${route.id} / ${pattern.id}`);
  }
  return {
    candidates: candidates.map(({ id, title, region, when }) => ({ id, title, region, when })),
    block,
  };
}
