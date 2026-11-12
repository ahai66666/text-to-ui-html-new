#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {ROOT,catalog} from './consumer-lib.mjs';
import {pageTitlebarPolicy} from './titlebar-scene.mjs';
import {navigationSlotRequired} from './pattern-contract-lib.mjs';
const pretty=process.argv.includes('--pretty');
const args=process.argv.slice(2).filter(arg=>arg!=='--pretty');
const cp=spawnSync(process.execPath,[path.join(ROOT,'scripts/resolve-context.mjs'),...args,'--discover','--repo',ROOT,'--skill-root',ROOT],{cwd:ROOT,encoding:'utf8',maxBuffer:20*1024*1024});
if(cp.status!==0){console.error(cp.stderr||cp.stdout);process.exit(1);}
const c=JSON.parse(cp.stdout);
if(!c.route?.allowedPatterns?.length)throw Error('Missing allowed Pattern decisions in resolved context');
const pattern = c.layout.contract;
const navigationModes = (pattern.navigationModes ?? []).map(mode => ({
  input: {navigationMode: mode.id},
  region: mode.region,
  slots: mode.shellSlots.map(slot => ({
    id: slot.id,
    placement: slot.placement,
    required: navigationSlotRequired(pattern, slot),
    ...(slot.requiredSemanticContexts ? {contexts: slot.requiredSemanticContexts} : {}),
  })),
}));
const rules=catalog().rules;
const {preset,defaultSize,allowedSizes}=pageTitlebarPolicy(ROOT,pattern.id);
const regions=pattern.regions.map(region=>{
 const geometry=pattern.geometry.regions[region.id];
 const axes=Object.fromEntries((geometry?.contentAxes??[]).map(axis=>[axis.id,[axis.inlineStart,axis.inlineEnd]]));
 return [region.id,{width:region.width.token??region.width.mode,scrollOwner:geometry?.scrollBody?.owner??region.scrollOwner,...(Object.keys(axes).length?{axes}:{})}];
});
const titlebar={
 size:{default:defaultSize,allowed:allowedSizes,input:'titlebarSize'},
 owner:'pattern-runtime',
 order:pattern.titleLayer.segments,
 ...(preset.segments.length?{segments:preset.segments.map(segment=>({
  region:segment.id,slot:segment.patternSlot,use:segment.kind,
  context:segment.semanticContext??segment.semanticContexts?.[0],
  ...(segment.businessActionSlot?{actions:{input:'detailActions',slot:segment.businessActionSlot,modes:segment.businessActionModes,default:segment.defaultBusinessActionMode,overflow:segment.overflow},windowControls:'system-managed'}:{}),
 }))}:{})
};
const slots=pattern.slots.map(s=>{
 const contexts=[...new Set([...rules.filter(rule=>rule.requiredSlot===s.id).map(rule=>rule.context),...preset.segments.filter(segment=>segment.patternSlot===s.id).flatMap(segment=>segment.semanticContexts??[segment.semanticContext]).filter(Boolean)])];
 return {id:s.id,owner:s.owner,cardinality:s.cardinality,...(s.allowedComponentModes?{allowedComponentModes:s.allowedComponentModes}:{}),...(s.componentOwner?{componentOwner:s.componentOwner}:{}),...(contexts.length?{contexts}:{})};
});
console.log(JSON.stringify({
 workflow:c.route.workflowRouteId,taskRoute:c.route.id,pattern:c.layout.id,defaultPattern:c.patternSelection.default,allowedPatterns:c.route.allowedPatterns,
 ...(c.patternSelection.base?{patternBase:c.patternSelection.base}:{}),alternativePatternRequiresReason:true,
 regions:pattern.paneOrder,geometry:{owner:pattern.geometry.owner,minimumWindow:pattern.minimumWindow,regions:Object.fromEntries(regions)},
 titlebar,slots,...(navigationModes.length?{navigationModes}:{})
},null,pretty?2:0));
