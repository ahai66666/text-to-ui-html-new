#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {ROOT} from './consumer-lib.mjs';
const args=process.argv.slice(2);
const cp=spawnSync(process.execPath,[path.join(ROOT,'scripts/resolve-context.mjs'),...args,'--discover','--repo',ROOT,'--skill-root',ROOT],{cwd:ROOT,encoding:'utf8',maxBuffer:20*1024*1024});
if(cp.status!==0){console.error(cp.stderr||cp.stdout);process.exit(1);}
const c=JSON.parse(cp.stdout);
if(!c.route?.allowedPatterns?.length)throw Error('Missing allowed Pattern decisions in resolved context');
console.log(JSON.stringify({workflow:c.route.workflowRouteId,taskRoute:c.route.id,pattern:c.layout.id,defaultPattern:c.patternSelection.default,allowedPatterns:c.route.allowedPatterns,...(c.patternSelection.base?{patternBase:c.patternSelection.base}:{}),alternativePatternRequiresReason:true,regions:c.layout.contract.paneOrder,slots:c.layout.contract.slots.map(s=>({id:s.id,owner:s.owner,cardinality:s.cardinality,...(s.allowedComponentModes?{allowedComponentModes:s.allowedComponentModes}: {})}))},null,2));
