#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {assertSingleEntry,markDelivery,inspectDelivery} from './delivery-entry.mjs';
import {checkBusinessLayoutCss} from './business-css.mjs';
import {navigationSlotRequired} from './pattern-contract-lib.mjs';
import {pageTitlebarPolicy,assertTitlebarSize} from './titlebar-scene.mjs';
import {ROOT,read,select,optionsFor,checkSlots} from './consumer-lib.mjs';import {exportOffline} from './offline.mjs';
const args=process.argv.slice(2),command=args.shift()||'help';const value=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
const project=path.resolve(value('--project')||'.');
function run(script,args){const cp=spawnSync(process.execPath,[path.join(ROOT,'scripts',script),...args],{cwd:ROOT,encoding:'utf8',maxBuffer:20*1024*1024});fs.mkdirSync(path.join(project,'.text-to-ui/logs'),{recursive:true});fs.writeFileSync(path.join(project,'.text-to-ui/logs',script+'.log'),cp.stdout+cp.stderr);if(cp.status!==0)throw Error(script+': '+(cp.stderr||cp.stdout).slice(-4500));return cp.stdout;}
const json=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
function keys(object,allowed,label){for(const k of Object.keys(object))if(!allowed.includes(k))throw Error(`UNKNOWN_FIELD: ${label}.${k}`);}
function exportPreview(){
 const readIf=name=>fs.existsSync(path.join(project,name))?read(path.join(project,name)):{};
 const input=readIf('page-input.json'),blueprint=readIf('page-blueprint.json'),bindings=readIf('page-bindings.json');
 const format=value('--format')||'multi-file';
 const id=input.id||blueprint.id||'page';
 const title=value('--title')||input.title||bindings.componentBindings?.find(b=>b.id==='system-title')?.options?.label||'页面';
 const output=value('--out')||(format==='single-file'?'out/'+id+'.html':'out/'+id+'/index.html');
 if(path.dirname(path.resolve(project,output))===project)throw Error('DELIVERY_OUTPUT: place the preview inside an output folder, not beside the source index.html');
 const report=exportOffline(project,{title,output,format,includeSources:!args.includes('--no-sources')});
 json(path.join(project,'.text-to-ui/offline-preview.json'),report);
 markDelivery(project,'ready',report);
 const {files,...summary}=report;
 return {...summary,...(files?{fileCount:Object.keys(files).length}: {})};
}
function resolveNavigationMode(pattern, requested, contextsByRegion) {
 const modes = pattern.navigationModes ?? [];
 if (requested != null) {
  const mode = modes.find(candidate => candidate.id === requested);
  if (!mode) throw Error(`UNSUPPORTED_NAVIGATION_MODE: ${pattern.id} / ${requested}; ${modes.length ? 'choose '+modes.map(candidate => candidate.id).join(', ')+' or omit navigationMode' : 'omit navigationMode'}`);
  return mode;
 }
 return modes.find(mode => {
  const contexts = contextsByRegion.get(mode.region);
  const levels = mode.shellSlots.filter(slot => slot.placement === 'bottom' || slot.placement === 'middle-scroll');
  return contexts && levels.length > 1 && levels.every(slot => slot.requiredSemanticContexts?.some(context => contexts.has(context)));
 });
}

function placeNavigationGroup(group, rendered, bindings, mode, slots) {
 const destinations = new Set(bindings.map(binding => binding.patternSlot));
 if (destinations.size !== 1) throw Error(`NAVIGATION_GROUP_SLOT: ${group.id}; group content by one navigation slot (${mode.shellSlots.map(slot => slot.id).join(', ')})`);
 const [slotId] = destinations;
 const destination = mode.shellSlots.find(slot => slot.id === slotId);
 if (destination.placement === 'middle-scroll') {
  slots[slotId].push(rendered);
  return rendered;
 }
 if (group.module) throw Error(`NAVIGATION_MODULE_SLOT: ${group.id} / ${slotId}; mount business modules in the middle-scroll slot`);
 const children = [];
 function place(node) {
  if (node.kind === 'group') {
   node.children.forEach(place);
  } else if (node.kind === 'component') {
   children.push(node);
  } else {
   throw Error(`NAVIGATION_GROUP_SLOT: ${group.id} / ${slotId}; place text in the middle-scroll group`);
  }
 }
 place(rendered);
 const shellGroup = {
  ...rendered,
  children,
  ...(destination.placement === 'bottom' ? {tag: 'nav', className: 'tui-primary-navigation-items', ariaLabel: '一级导航'} : {}),
 };
 slots[slotId].push(shellGroup);
 return shellGroup;
}

function previousLayout(state,pageId){
 const saved=path.join(state,'layout-selection.json');
 if(fs.existsSync(saved))return read(saved);
 const files=[path.join(state,'context-packet.json'),path.join(state,'compiled/page-blueprint.json'),path.join(project,'titlebar-scene.json'),path.join(project,'html-page-manifest.json')];
 if(!files.every(file=>fs.existsSync(file)))return null;
 const [context,blueprint,scene,manifest]=files.map(read);
 if(blueprint.id!==pageId||context.layout?.id!==scene.pattern?.id||!context.route?.id)return null;
 const global=scene.segments.find(segment=>segment.patternSlot==='global-title-layer'),detail=scene.segments.find(segment=>segment.businessActions);
 const size=global?.size??scene.primaryTitlebar?.size;
 if(!size)return null;
 return {pageId,taskRoute:context.route.id,pattern:context.layout.id,patternBase:context.patternSelection?.base??null,patternReason:context.patternSelection?.reason??null,navigationMode:manifest.navigationMode??null,titlebarSize:size,globalTitlebarLayout:global?.layout,detailTitlebar:detail?.bindingId??null,detailTitlebarSize:detail?.size??null,titlebarScene:scene.preset};
}

function compile(){
 const state=path.join(project,'.text-to-ui'),file=path.join(project,'page-input.json');
 if(!fs.existsSync(file))throw Error('Missing page-input.json; read references/consumer-input.md');
 const input=read(file);if(input.pageModules)throw Error('Declare business modules on groups[].module to keep recipe and source ownership together');keys(input,['schemaVersion','id','title','task','taskRoute','pattern','patternReason','patternBase','user','workObject','primaryJob','groups','entities','states','interactions','successCriteria','recoveryPaths','pageModules','businessCss','navigationMode','titlebarSize','detailActions','design'],'page');
 for(const k of ['id','title','task','user','workObject','primaryJob'])if(typeof input[k]!=='string'||!input[k].trim())throw Error('REQUIRED_INPUT: '+k);
 if(!/^[a-z][a-z0-9-]*$/.test(input.id)||input.schemaVersion!==1)throw Error('Input requires schemaVersion 1 and lowercase kebab id');
 for(const k of ['groups','entities','interactions','successCriteria','recoveryPaths'])if(!Array.isArray(input[k])||!input[k].length)throw Error('REQUIRED_INPUT: '+k);
 const marker=path.join(state,'input-mode.json');if(fs.existsSync(marker)&&read(marker).mode!=='consumer')throw Error('INPUT_MODE_CONFLICT');
 if(!fs.existsSync(marker)&&['page-bindings.json','page-blueprint.json','page-content-recipes.json'].some(f=>fs.existsSync(path.join(project,f))))throw Error('Existing low-level project: use --low-level or a separate directory');
 const previous=args.includes('--revision')?previousLayout(state,input.id):null;
 if(args.includes('--revision')&&(!previous||previous.pageId!==input.id))throw Error('REVISION_LAYOUT_MISSING: first generate this page with the current skill');
 if(previous)for(const key of ['taskRoute','pattern','patternBase','navigationMode','titlebarSize']){
  if(Object.hasOwn(input,key)&&(input[key]??null)!==(previous[key]??null))throw Error('REVISION_LAYOUT_CHANGE: '+key+'; use generate without --revision for structural changes');
 }
 const layoutInput=previous?{...input,taskRoute:previous.taskRoute,pattern:previous.pattern,patternBase:previous.patternBase,patternReason:previous.patternReason,navigationMode:previous.navigationMode,titlebarSize:previous.titlebarSize}:input;
 const design=input.design;
 if(design!=null){
  if(typeof design!=='object'||Array.isArray(design))throw Error('DESIGN_INPUT: use an object');
  keys(design,['regionPurposes','readingOrder','informationPriority','relationships','density'],'design');
  for(const field of ['regionPurposes','density'])if(design[field]!==undefined&&(!design[field]||typeof design[field]!=='object'||Array.isArray(design[field])||Object.values(design[field]).some(v=>typeof v!=='string'||!v.trim())))throw Error('DESIGN_INPUT: '+field+' maps regions to text');
  for(const field of ['readingOrder','informationPriority','relationships'])if(design[field]!==undefined&&!Array.isArray(design[field]))throw Error('DESIGN_INPUT: '+field+' must be an array');
 }
 const walkNodes=(nodes,fn)=>{for(const n of nodes||[]){fn(n);walkNodes(n.children,fn);}};
 const capabilities = new Set(['titlebar', 'primary-navigation-item']);
 const contextsByRegion = new Map();
 for (const group of input.groups) {
  const contexts = contextsByRegion.get(group.region) ?? new Set();
  contextsByRegion.set(group.region, contexts);
  walkNodes(group.children, node => {
   if (!node.use) return;
   const component = select(node.use, node.context);
   capabilities.add(component.id);
   contexts.add(component.context);
  });
 }
 const common=['--task',input.task,'--repo',ROOT,'--skill-root',ROOT,'--framework','html',...(layoutInput.taskRoute&&!layoutInput.taskRoute.startsWith('ad-hoc-')?['--task-route',layoutInput.taskRoute]:[]),...(layoutInput.pattern?['--pattern',layoutInput.pattern]:[]),...(layoutInput.patternReason?['--pattern-reason',layoutInput.patternReason]:[]),...(layoutInput.patternBase?['--pattern-base',layoutInput.patternBase]:[]),'--capabilities',[...capabilities].join(',')];
 run('resolve-context.mjs',[...common,'--discover','--out',path.join(state,'context-discovery.json'),'--brief-out',path.join(state,'page-brief.json')]);
 const context=read(path.join(state,'context-discovery.json')),pattern=context.layout.contract;
 if(!pattern?.paneOrder)throw Error('Resolved Pattern has no pane order');
 if(previous&&context.route.id!==previous.taskRoute)throw Error('REVISION_LAYOUT_CHANGE: taskRoute');
 const navigation = previous&&!previous.navigationMode?undefined:resolveNavigationMode(pattern, layoutInput.navigationMode, contextsByRegion);
 const titlePolicy=pageTitlebarPolicy(ROOT,pattern.id);
 const titlebarSize=assertTitlebarSize({options:{size:layoutInput.titlebarSize}},titlePolicy,'global-title-layer');
 const detailSegment=titlePolicy.preset.segments.find(segment=>segment.businessActionSlot);
 const actionSlot=detailSegment?.businessActionSlot;
 if(Object.hasOwn(input,'detailActions')&&(!actionSlot||!Array.isArray(input.detailActions)))throw Error('DETAIL_ACTIONS_UNAVAILABLE: detailActions requires a Pattern with a detail action slot and an array of actions');
 for(const region of [...Object.keys(design?.regionPurposes??{}),...Object.keys(design?.density??{})])if(!pattern.paneOrder.includes(region))throw Error('UNKNOWN_PATTERN_REGION: design / '+region);
 const groupIds=new Set(input.groups.map(g=>g.id));
 const entityMap=new Map(input.entities.map(e=>[e.id,e]));
 for(const id of [...(design?.readingOrder??[]),...(design?.informationPriority??[])])if(!groupIds.has(id)&&!pattern.paneOrder.includes(id))throw Error('DESIGN_GROUP: '+id);
 for(const relationship of design?.relationships??[]){
  if(!relationship||typeof relationship!=='object'||Array.isArray(relationship))throw Error('DESIGN_RELATIONSHIP: use {from,to,entity,key}');
  keys(relationship,['from','to','entity','key'],'design.relationships');
  const {from,to,entity,key}=relationship;
  if(!groupIds.has(from)||!groupIds.has(to)||!entityMap.get(entity)?.fields?.includes(key))throw Error('DESIGN_RELATIONSHIP: use declared groups, entity and selection field');
 }
 if(input.states!==undefined&&!Array.isArray(input.states))throw Error('STATE_INPUT: states must be an array');
 const pageStates=input.states??[{id:'default',kind:'default',appliesTo:[...groupIds]}];
 for(const item of pageStates){
  if(!item?.id||(item.appliesTo!==undefined&&!Array.isArray(item.appliesTo)))throw Error('STATE_INPUT: state requires id and appliesTo must be an array');
  for(const group of item.appliesTo??[])if(!groupIds.has(group))throw Error('STATE_GROUP: '+item.id+' / '+group);
 }
 const interactionsForActions=new Map();
 const navigationSlots = navigation ? Object.fromEntries(navigation.shellSlots.map(slot => [slot.id, []])) : null;
 const moduleBindings=new Map();
 const bindings=[],groups=[],recipes=[],stylePlan=[],regions=Object.fromEntries(pattern.paneOrder.map(r=>[r,[]])),used=new Set();
 const claim=id=>{if(!id||used.has(id))throw Error('MISSING_OR_DUPLICATE_ID: '+id);used.add(id);};
 const addBinding=(id,c,region,options,extra={})=>{const behaviorId=extra.behaviorId;bindings.push({id,logicalName:c.logicalName,region,...(c.context?{semanticContext:c.context}:{}),options,...extra});return {kind:'component',bindingId:id};};
 function node(n,region,groupId){keys(n,['id','use','context','options','slots','slot','behavior','actionBehaviors','text','tag','children','composition'],'node');claim(n.id);
 if(n.use){
  const c = select(n.use, n.context);
  const supplied=n.options&&typeof n.options==='object'&&!Array.isArray(n.options)?{...n.options}:n.options??{};
  const legacyDetailActions=c.context===detailSegment?.semanticContext?supplied?.mainDetailActions:undefined;
  if(legacyDetailActions!==undefined)delete supplied.mainDetailActions;
  if(c.context===detailSegment?.semanticContext&&!previous&&input.titlebarSize&&supplied?.size&&supplied.size!==titlebarSize)throw Error('TITLEBAR_SIZE_CONFLICT: '+n.id+' must use page titlebarSize');
  const options = optionsFor(c, supplied);
  if(c.context===detailSegment?.semanticContext&&options.size==null)options.size=previous?.detailTitlebarSize??titlebarSize;
  let slotId = n.slot || c.requiredSlot || pattern.slots.find(slot => slot.id === c.context)?.id;
  const componentOwner = pattern.slots.find(slot => slot.id === slotId)?.componentOwner;
  if (componentOwner) {
   throw Error(`PATTERN_SLOT_OWNERSHIP: ${groupId}/${n.id}; declare the action in ${componentOwner.context} slots["${componentOwner.slot}"] with actionBehaviors`);
  }
  if (navigation?.region === region) {
   const required = navigation.shellSlots.find(slot => slot.requiredSemanticContexts?.includes(c.context));
   if (!required) throw Error(`NAVIGATION_CONTEXT: ${groupId}/${n.id} / ${c.context ?? c.id}; use a context from ${navigation.id} in discover-page.mjs`);
   if (n.slot && n.slot !== required.id) {
    throw Error(`NAVIGATION_SLOT_CONFLICT: ${groupId}/${n.id} uses ${n.slot}; ${navigation.id} requires ${required.id} for ${c.context}`);
   }
   slotId = required.id;
  }
  if (c.requiredSlot && slotId !== c.requiredSlot) throw Error(`PATTERN_SLOT_CONFLICT: ${groupId}/${n.id} uses ${slotId}; ${c.context} requires ${c.requiredSlot}`);
  const slot = pattern.slots.find(s => s.id === slotId);
  if (slotId && (!slot || (slot.owner !== 'page' && slot.owner !== region))) {
   throw Error(`PATTERN_SLOT_REGION: ${groupId}/${n.id}; ${slotId} is unavailable in ${region}`);
  }
  if (slot?.allowedComponentModes && options.mode && !slot.allowedComponentModes.includes(options.mode) && !slot.allowedComponentModes.includes(options.mode+'-'+options.variant)) {
   throw Error('PATTERN_SLOT_MODE: '+slotId+' allows '+slot.allowedComponentModes.join(', '));
  }
  let slots = checkSlots(c, n.slots ?? {});
  if (legacyDetailActions!==undefined) {
   if (Object.hasOwn(slots, actionSlot)) throw Error(`DUPLICATE_TITLEBAR_ACTIONS: ${n.id}; declare actions once in slots["${actionSlot}"]`);
   slots = checkSlots(c, {...slots, [actionSlot]: legacyDetailActions});
  }
  return addBinding(n.id,c,region,options,{
   ...(Object.keys(slots).length ? {slots} : {}),
   ...(slotId ? {patternSlot: slotId} : {}),
   ...(n.behavior ? {behaviorId: n.behavior} : {}),
   ...(n.actionBehaviors ? {actionBehaviors: n.actionBehaviors} : {}),
  });
 }
 if(Object.hasOwn(n,'text'))return {kind:'text',id:n.id,tag:n.tag||'p',text:String(n.text)};
 if(n.children){const composition=n.composition||'stack';if(!['stack','section-header','search-toolbar','field-group'].includes(composition))throw Error('UNKNOWN_COMPOSITION: '+composition);stylePlan.push({id:n.id,region,className:'tui-business-'+composition,tokenRoles:['space/5'],componentBoundary:'preserve'});return {kind:'group',id:n.id,className:'tui-business-'+composition,children:n.children.map(x=>node(x,region,groupId))};}
 throw Error('Node must have use, text, or children');}
 // Structural shell is derived from the Pattern. No business navigation is invented.
 const shellId='system-shell',navRegion=pattern.paneOrder[0];claim(shellId);const shellChildren=[];
 const title=select('titlebar','global-titlebar');
 const globalSegment=titlePolicy.preset.segments.find(segment=>segment.patternSlot===title.requiredSlot);
 const titleOptions={label:input.title,layout:globalSegment?.layout??previous?.globalTitlebarLayout??(pattern.titleLayer.segments.length>2?'three-column':'two-column'),segmentRole:globalSegment?.segmentRole??'global',size:titlebarSize};
 shellChildren.push(addBinding('system-title',title,navRegion,optionsFor(title,titleOptions),{patternSlot:'global-title-layer'}));
 const navGroups=input.groups.filter(g=>g.region===navRegion);if(!navGroups.length)throw Error('Navigation content must be provided in '+navRegion);
 for(const g of input.groups){keys(g,['id','region','purpose','children','composition','entities','module'],'group');claim(g.id);if(!regions[g.region])throw Error('UNKNOWN_PATTERN_REGION: '+g.region);if(!g.purpose||!Array.isArray(g.children))throw Error('Group requires purpose and children');
 const before=bindings.length,composition=g.composition||'stack';if(!['stack','section-header','search-toolbar','field-group'].includes(composition))throw Error('UNKNOWN_COMPOSITION: '+composition);
 const children=g.children.map(n=>node(n,g.region,g.id));
 let rendered={kind:'group',id:g.id,className:'tui-business-'+composition,children};
 if (navigation?.region === g.region) rendered = placeNavigationGroup(g, rendered, bindings.slice(before), navigation, navigationSlots);
 else regions[g.region].push(rendered);
 const groupEntities=g.entities??input.entities.map(e=>e.id);
 if(!Array.isArray(groupEntities)||groupEntities.some(id=>!entityMap.has(id)))throw Error('GROUP_ENTITY: '+g.id);
 groups.push({id:g.id,region:g.region,purpose:g.purpose,dataEntities:groupEntities});
 const ids=bindings.slice(before).map(b=>b.id);recipes.push({id:g.id+'-recipe',contentGroupId:g.id,region:g.region,compositionId:g.id,...(ids.length?{kind:'registered-composition',bindingIds:ids}:{kind:'content-composition'})});
 if(g.module){moduleBindings.set(g.id,ids);const moduleStates=pageStates.filter(s=>!s.appliesTo?.length||s.appliesTo.includes(g.id)).map(s=>s.id);const m=g.module;for(const key of ['source','stylesheet','missingCapability','registryQueries','reviewedCandidates'])if(m[key]===undefined)throw Error('module requires '+key);const recipe=recipes.at(-1);Object.assign(recipe,{kind:'page-composite',fields:[...new Set(groupEntities.flatMap(id=>entityMap.get(id).fields))],states:moduleStates.length?moduleStates:['default'],missingCapability:m.missingCapability,registryQueries:m.registryQueries,reviewedCandidates:m.reviewedCandidates,tokenRoles:['space/5'],disposition:'page-owned'});}
 stylePlan.push({id:g.id,region:g.region,className:rendered.className,tokenRoles:['space/5'],componentBoundary:'preserve'});
 }
 if (navigation?.region === navRegion) {
  navigationSlots['global-title-layer'].unshift(...shellChildren);
  delete regions[navRegion];
  for (const slot of navigation.shellSlots) {
   if (navigationSlotRequired(pattern, slot) && !navigationSlots[slot.id].length) {
    throw Error(`MISSING_NAVIGATION_SLOT: ${navigation.id} requires ${slot.id}${slot.requiredSemanticContexts ? ' ('+slot.requiredSemanticContexts.join(', ')+')' : ''}`);
   }
  }
 } else {
  regions[navRegion].unshift({kind:'group',id:shellId,children:shellChildren});
  groups.unshift({id:shellId,region:navRegion,purpose:input.title,dataEntities:input.entities.map(e=>e.id)});
  recipes.unshift({id:'system-shell-recipe',contentGroupId:shellId,region:navRegion,compositionId:shellId,kind:'registered-composition',bindingIds:['system-title']});
  stylePlan.push({id:shellId,region:navRegion,tokenRoles:['space/5'],componentBoundary:'preserve'});
 }
 const finalTitlebars = detailSegment?bindings.filter(binding => binding.patternSlot === detailSegment.patternSlot):[];
 if (finalTitlebars.length > 1) throw Error(`DUPLICATE_DETAIL_TITLEBAR: use one ${detailSegment.semanticContext}; found ${finalTitlebars.map(binding=>binding.id).join(', ')}`);
 if(detailSegment&&!finalTitlebars.length){
  const c=select('titlebar',detailSegment.semanticContext),id='system-detail-title',region=detailSegment.id,group='system-detail-header';
  claim(id);claim(group);
  regions[region].unshift({kind:'group',id:group,children:[addBinding(id,c,region,optionsFor(c,{label:input.title,paneTitle:input.groups.find(g=>g.region===region)?.purpose||input.title,size:titlebarSize}),{patternSlot:detailSegment.patternSlot})]});
  groups.push({id:group,region,purpose:'Pattern titlebar',dataEntities:[]});recipes.push({id:group+'-recipe',contentGroupId:group,region,compositionId:group,kind:'registered-composition',bindingIds:[id]});stylePlan.push({id:group,region,tokenRoles:['space/5'],componentBoundary:'preserve'});
  finalTitlebars.push(bindings.at(-1));
 }
 if(input.detailActions?.length){
  const binding=finalTitlebars[0];
  if(binding.slots?.[actionSlot]?.length||binding.actionBehaviors)throw Error('DUPLICATE_TITLEBAR_ACTIONS: use detailActions or the explicit Titlebar action slot, not both');
  const c=select('titlebar',detailSegment.semanticContext);
  const declaredBehaviors=new Set(input.interactions.map(i=>i.id));
  const mode=input.detailActions.find(action=>action?.buttonType)?.buttonType??detailSegment.defaultBusinessActionMode;
  const actionBehaviors={};
  const actions=input.detailActions.map(action=>{
   if(!action||typeof action!=='object'||Array.isArray(action))throw Error('DETAIL_ACTION_INPUT: use {id,label,icon,behavior}');
   const {behavior,...props}=action;
   if(!declaredBehaviors.has(behavior))throw Error('DETAIL_ACTION_BEHAVIOR: '+props.id+' / '+behavior);
   if(!props.icon||props.overflowTrigger||props.id==='more'||props.icon==='action/more')throw Error('DETAIL_ACTION_ICON: '+props.id+' requires a business icon alias; the Pattern owns More');
   if(props.buttonType&&props.buttonType!==mode)throw Error('DETAIL_ACTION_MODE: use one buttonType for all detailActions');
   return {...props,buttonType:mode};
  });
  binding.slots={...binding.slots,...checkSlots(c,{[actionSlot]:actions})};
  for(const {id,behavior} of input.detailActions){
   Object.defineProperty(actionBehaviors,id,{value:behavior,enumerable:true});
   interactionsForActions.set(behavior,binding.id);
  }
  binding.actionBehaviors=actionBehaviors;
 }
 const interactions=input.interactions.map(i=>{
  const {triggers,...rest}=i;
  const actionBinding=interactionsForActions.get(i.id);
  if(!i.id||!i.outcome||(triggers!==undefined&&!Array.isArray(triggers))||(!triggers?.length&&!actionBinding))throw Error('Interaction requires id, triggers, outcome');
  return {...rest,triggerBindingIds:[...new Set([...(triggers??[]),...(actionBinding?[actionBinding]:[])])]};
 });
 const blueprint={
  schemaVersion:1,id:input.id,task:input.task,user:input.user,workObject:input.workObject,primaryJob:input.primaryJob,
  designRationale:layoutInput.patternReason||'Use the canonical task Pattern and declared consumer combinations',
  pattern:{id:pattern.id},...(design?{design}:{}),
  regions:pattern.paneOrder.map(id=>({id,purpose:design?.regionPurposes?.[id]??(input.groups.filter(g=>g.region===id).map(g=>g.purpose).join(' / ')||id),...(design?.density?.[id]?{density:design.density[id]}:{})})),
  contentGroups:groups,dataEntities:input.entities,
  interactions:interactions.map(i=>({id:i.id,sourceGroup:i.sourceGroup,targetGroup:i.targetGroup,trigger:i.trigger||i.kind,stateChange:i.stateChange,taskOutcome:i.outcome,...(i.preserveContext?{preserveContext:i.preserveContext}:{})})),
  states:pageStates,successCriteria:input.successCriteria,recoveryPaths:input.recoveryPaths
 };
 const layoutSelection={pageId:input.id,taskRoute:context.route.id,pattern:pattern.id,patternBase:context.patternSelection?.base??null,patternReason:context.patternSelection?.reason??layoutInput.patternReason??null,navigationMode:navigation?.id??null,titlebarSize,globalTitlebarLayout:titleOptions.layout,detailTitlebarSize:finalTitlebars[0]?.options.size??null,detailTitlebar:finalTitlebars[0]?.id??null,titlebarScene:titlePolicy.preset.id};
 if(previous)for(const key of ['detailTitlebarSize','detailTitlebar','titlebarScene'])if(previous[key]!==layoutSelection[key])throw Error('REVISION_LAYOUT_CHANGE: '+key);
 const expanded=path.join(state,'compiled');
 const generated={schemaVersion:1,blueprintRef:{id:input.id},componentBindings:bindings,composition:{regions},...(navigation ? {
  patternMode: {navigation: navigation.id},
  patternShell: {navigation: {mode: navigation.id, slots: navigationSlots}},
 } : {}),stylePlan:{schemaVersion:1,compositions:stylePlan},behaviorPlan:{schemaVersion:1,interactions},pageModules:input.groups.filter(g=>g.module).map(g=>({compositionId:g.id,source:path.resolve(project,g.module.source),stylesheet:path.resolve(project,g.module.stylesheet),consumerBindings:moduleBindings.get(g.id)}))};
 json(path.join(expanded,'page-blueprint.json'),blueprint);json(path.join(expanded,'page-content-recipes.json'),{schemaVersion:1,blueprintRef:{id:input.id},recipes});json(path.join(expanded,'page-bindings.json'),generated);
 let css='.tui-business-stack, .tui-business-field-group { display:flex; flex-direction:column; gap:var(--space-5); }\n.tui-business-section-header, .tui-business-search-toolbar { display:flex; align-items:center; gap:var(--space-5); flex-wrap:wrap; }\n';
 if(input.businessCss){const file=path.resolve(project,input.businessCss);if(!file.startsWith(project+path.sep))throw Error('Business CSS must be inside project');css+=checkBusinessLayoutCss(fs.readFileSync(file,'utf8'),new Set(stylePlan.map(p=>p.id))); }
 fs.mkdirSync(path.join(project,'styles'),{recursive:true});fs.writeFileSync(path.join(project,'styles/page-composition.css'),css);
 json(marker,{mode:'consumer',skill:'text-to-ui-html-new',version:'0.1.1'});
 return {input,common,expanded,pattern:pattern.id,navigationMode:navigation?.id,layoutSelection};
}
try{
 if(command==='entry'){console.log(JSON.stringify(inspectDelivery(project),null,2));}
 else if(command==='compile'||command==='generate'){
 let layoutSelection;
 if(command==='generate'){markDelivery(project,'building');assertSingleEntry(project);}
 if(args.includes('--low-level')){if(args.includes('--revision'))throw Error('--revision is for page-input projects');if(command==='compile')throw Error('Low-level mode uses existing inputs directly');if(fs.existsSync(path.join(project,'.text-to-ui/input-mode.json'))&&read(path.join(project,'.text-to-ui/input-mode.json')).mode==='consumer')throw Error('INPUT_MODE_CONFLICT');const task=value('--task');if(!task)throw Error('--low-level requires --task');run('generate-compliant-page.mjs',['--project',project,'--repo',ROOT,'--skill-root',ROOT,'--task',task,...(value('--pattern')?['--pattern',value('--pattern')]:[])]);}
 else {const c=compile();layoutSelection=c.layoutSelection;if(command==='compile'){console.log(JSON.stringify({ok:true,skill:'text-to-ui-html-new',pattern:c.pattern,navigationMode:c.navigationMode,compiled:'.text-to-ui/compiled'}));process.exit(0);}run('generate-compliant-page.mjs',[...c.common,'--project',project,'--blueprint',path.join(c.expanded,'page-blueprint.json'),'--content-recipes',path.join(c.expanded,'page-content-recipes.json'),'--bindings',path.join(c.expanded,'page-bindings.json'),'--page-css',path.join(project,'styles/page-composition.css')]);}
 const report=exportPreview();if(layoutSelection)json(path.join(project,'.text-to-ui/layout-selection.json'),layoutSelection);json(path.join(project,'.text-to-ui/skill.json'),{name:'text-to-ui-html-new',version:'0.1.1'});console.log(JSON.stringify({ok:true,...report}));
 }else if(command==='export'){markDelivery(project,'building');assertSingleEntry(project);console.log(JSON.stringify({ok:true,...exportPreview()}));}
 else console.log('page.mjs entry --project <dir> | compile|generate --project <dir> | generate [--revision] | generate --low-level --task <task> | export --project <dir> [--format multi-file|single-file] [--out out/<name>/index.html]');
}catch(e){if(['generate','export'].includes(command)){try{markDelivery(project,'failed',null,e.message);}catch{}}console.error(e.message);if(/RUNTIME_RESOURCE_LOAD|EXTERNAL_RESOURCE/.test(e.message))console.error('下一步：离线交付不支持真实服务调用；明确原型演示与服务接入边界，不另写整页 HTML 绕过。');else if(/UNKNOWN_COMPOSITION|unsupported kind|bypasses the component|module requires/.test(e.message))console.error('下一步：先查询公开接口；若缺少业务编排，使用 business-module.mjs init 在现有分组内扩展，再重新生成同一项目。');process.exitCode=1;}
