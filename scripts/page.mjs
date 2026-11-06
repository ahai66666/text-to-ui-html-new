#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {assertSingleEntry,markDelivery,inspectDelivery} from './delivery-entry.mjs';
import {checkBusinessLayoutCss} from './business-css.mjs';
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
function compile(){
 const state=path.join(project,'.text-to-ui'),file=path.join(project,'page-input.json');
 if(!fs.existsSync(file))throw Error('Missing page-input.json; read references/consumer-input.md');
 const input=read(file);if(input.pageModules)throw Error('Declare business modules on groups[].module to keep recipe and source ownership together');keys(input,['schemaVersion','id','title','task','taskRoute','pattern','patternReason','patternBase','user','workObject','primaryJob','groups','entities','states','interactions','successCriteria','recoveryPaths','pageModules','businessCss','navigationMode'],'page');
 for(const k of ['id','title','task','user','workObject','primaryJob'])if(typeof input[k]!=='string'||!input[k].trim())throw Error('REQUIRED_INPUT: '+k);
 if(!/^[a-z][a-z0-9-]*$/.test(input.id)||input.schemaVersion!==1)throw Error('Input requires schemaVersion 1 and lowercase kebab id');
 for(const k of ['groups','entities','interactions','successCriteria','recoveryPaths'])if(!Array.isArray(input[k])||!input[k].length)throw Error('REQUIRED_INPUT: '+k);
 const marker=path.join(state,'input-mode.json');if(fs.existsSync(marker)&&read(marker).mode!=='consumer')throw Error('INPUT_MODE_CONFLICT');
 if(!fs.existsSync(marker)&&['page-bindings.json','page-blueprint.json','page-content-recipes.json'].some(f=>fs.existsSync(path.join(project,f))))throw Error('Existing low-level project: use --low-level or a separate directory');
 const walkNodes=(nodes,fn)=>{for(const n of nodes||[]){fn(n);walkNodes(n.children,fn);}};
 const capabilities=new Set(['titlebar','primary-navigation-item']);for(const g of input.groups)walkNodes(g.children,n=>{if(n.use)capabilities.add(select(n.use,n.context).id);});
 const common=['--task',input.task,'--repo',ROOT,'--skill-root',ROOT,'--framework','html',...(input.taskRoute?['--task-route',input.taskRoute]:[]),...(input.pattern?['--pattern',input.pattern]:[]),...(input.patternReason?['--pattern-reason',input.patternReason]:[]),...(input.patternBase?['--pattern-base',input.patternBase]:[]),'--capabilities',[...capabilities].join(',')];
 run('resolve-context.mjs',[...common,'--discover','--out',path.join(state,'context-discovery.json'),'--brief-out',path.join(state,'page-brief.json')]);
 const context=read(path.join(state,'context-discovery.json')),pattern=context.layout.contract;
 if(!pattern?.paneOrder)throw Error('Resolved Pattern has no pane order');
 const bindings=[],groups=[],recipes=[],stylePlan=[],regions=Object.fromEntries(pattern.paneOrder.map(r=>[r,[]])),used=new Set();
 const claim=id=>{if(!id||used.has(id))throw Error('MISSING_OR_DUPLICATE_ID: '+id);used.add(id);};
 const addBinding=(id,c,region,options,extra={})=>{const behaviorId=extra.behaviorId;bindings.push({id,logicalName:c.logicalName,region,...(c.context?{semanticContext:c.context}:{}),options,...extra});return {kind:'component',bindingId:id};};
 function node(n,region,groupId){keys(n,['id','use','context','options','slots','slot','behavior','actionBehaviors','text','tag','children','composition'],'node');claim(n.id);
 if(n.use){const c=select(n.use,n.context),options=optionsFor(c,n.options||{});const slotId=n.slot||c.requiredSlot||c.context;const slot=pattern.slots.find(s=>s.id===slotId);if(slot?.allowedComponentModes&&options.mode&&!slot.allowedComponentModes.includes(options.mode)&&!slot.allowedComponentModes.includes(options.mode+'-'+options.variant))throw Error('PATTERN_SLOT_MODE: '+slotId+' allows '+slot.allowedComponentModes.join(', '));checkSlots(c,n.slots||{});return addBinding(n.id,c,region,options,{...(n.slots?{slots:n.slots}:{}),...(n.slot||c.requiredSlot||pattern.slots.some(s=>s.id===c.context)?{patternSlot:n.slot||c.requiredSlot||c.context}:{}),...(n.behavior?{behaviorId:n.behavior}:{}),...(n.actionBehaviors?{actionBehaviors:n.actionBehaviors}: {})});}
 if(Object.hasOwn(n,'text'))return {kind:'text',id:n.id,tag:n.tag||'p',text:String(n.text)};
 if(n.children){const composition=n.composition||'stack';if(!['stack','section-header','search-toolbar','field-group'].includes(composition))throw Error('UNKNOWN_COMPOSITION: '+composition);stylePlan.push({id:n.id,region,className:'tui-business-'+composition,tokenRoles:['space/5'],componentBoundary:'preserve'});return {kind:'group',id:n.id,className:'tui-business-'+composition,children:n.children.map(x=>node(x,region,groupId))};}
 throw Error('Node must have use, text, or children');}
 // Structural shell is derived from the Pattern. No business navigation is invented.
 const shellId='system-shell',navRegion=pattern.paneOrder[0];claim(shellId);const shellChildren=[];
 const title=select('titlebar','global-titlebar');
 let titleOptions={label:input.title,layout:pattern.id==='pattern-a-two-pane'?'two-column':'three-column',segmentRole:pattern.id==='pattern-b-three-pane'?'primary-navigation':'global',size:'large'};
 shellChildren.push(addBinding('system-title',title,navRegion,optionsFor(title,titleOptions),{patternSlot:'global-title-layer'}));
 const navGroups=input.groups.filter(g=>g.region===navRegion);if(!navGroups.length)throw Error('Navigation content must be provided in '+navRegion);
 for(const g of input.groups){keys(g,['id','region','purpose','children','composition','entities','module'],'group');claim(g.id);if(!regions[g.region])throw Error('UNKNOWN_PATTERN_REGION: '+g.region);if(!g.purpose||!Array.isArray(g.children))throw Error('Group requires purpose and children');
 const before=bindings.length,composition=g.composition||'stack';if(!['stack','section-header','search-toolbar','field-group'].includes(composition))throw Error('UNKNOWN_COMPOSITION: '+composition);
 const children=g.children.map(n=>node(n,g.region,g.id));
 const rendered={kind:'group',id:g.id,className:'tui-business-'+composition,children};regions[g.region].push(rendered);
 groups.push({id:g.id,region:g.region,purpose:g.purpose,dataEntities:g.entities||input.entities.map(e=>e.id)});
 const ids=bindings.slice(before).map(b=>b.id);recipes.push({id:g.id+'-recipe',contentGroupId:g.id,region:g.region,compositionId:g.id,...(ids.length?{kind:'registered-composition',bindingIds:ids}:{kind:'content-composition'})});
 if(g.module){const m=g.module;for(const key of ['source','stylesheet','missingCapability','registryQueries','reviewedCandidates'])if(m[key]===undefined)throw Error('module requires '+key);const recipe=recipes.at(-1);Object.assign(recipe,{kind:'page-composite',fields:input.entities.flatMap(e=>e.fields),states:(input.states||[{id:'default'}]).map(s=>s.id),missingCapability:m.missingCapability,registryQueries:m.registryQueries,reviewedCandidates:m.reviewedCandidates,tokenRoles:['space/5'],disposition:'page-owned'});}
 stylePlan.push({id:g.id,region:g.region,className:'tui-business-'+composition,tokenRoles:['space/5'],componentBoundary:'preserve'});
 }
 regions[navRegion].unshift({kind:'group',id:shellId,children:shellChildren});groups.unshift({id:shellId,region:navRegion,purpose:input.title,dataEntities:input.entities.map(e=>e.id)});recipes.unshift({id:'system-shell-recipe',contentGroupId:shellId,region:navRegion,compositionId:shellId,kind:'registered-composition',bindingIds:['system-title']});stylePlan.push({id:shellId,region:navRegion,tokenRoles:['space/5'],componentBoundary:'preserve'});
 if(pattern.id==='pattern-b-three-pane'){
 const c=select('titlebar','main-detail-titlebar'),id='system-detail-title',region='main-detail',group='system-detail-header';
 regions[region].unshift({kind:'group',id:group,children:[addBinding(id,c,region,optionsFor(c,{label:input.title,paneTitle:input.groups.find(g=>g.region===region)?.purpose||input.title,size:'large'}),{patternSlot:'main-detail-title'})]});
 groups.push({id:group,region,purpose:input.title,dataEntities:input.entities.map(e=>e.id)});recipes.push({id:group+'-recipe',contentGroupId:group,region,compositionId:group,kind:'registered-composition',bindingIds:[id]});stylePlan.push({id:group,region,tokenRoles:['space/5'],componentBoundary:'preserve'});
 }
 const interactions=input.interactions.map(i=>{if(!i.id||!i.outcome||!Array.isArray(i.triggers)||!i.triggers.length)throw Error('Interaction requires id, triggers, outcome');const {triggers,...rest}=i;return {...rest,triggerBindingIds:triggers};});
 const blueprint={schemaVersion:1,id:input.id,task:input.task,user:input.user,workObject:input.workObject,primaryJob:input.primaryJob,designRationale:input.patternReason||'Use the canonical task Pattern and declared consumer combinations',pattern:{id:pattern.id},regions:pattern.paneOrder.map(id=>({id,purpose:input.groups.filter(g=>g.region===id).map(g=>g.purpose).join(' / ')||input.title})),contentGroups:groups,dataEntities:input.entities,interactions:interactions.map(i=>({id:i.id,sourceGroup:i.sourceGroup,targetGroup:i.targetGroup,trigger:i.trigger||i.kind,stateChange:i.outcome,taskOutcome:i.outcome})),states:input.states||[{id:'default',kind:'default',appliesTo:groups.map(g=>g.id)}],successCriteria:input.successCriteria,recoveryPaths:input.recoveryPaths};
 const expanded=path.join(state,'compiled');
 const generated={schemaVersion:1,blueprintRef:{id:input.id},componentBindings:bindings,composition:{regions,...(input.navigationMode?{navigationMode:input.navigationMode}:{})},stylePlan:{schemaVersion:1,compositions:stylePlan},behaviorPlan:{schemaVersion:1,interactions},pageModules:input.groups.filter(g=>g.module).map(g=>({compositionId:g.id,source:path.resolve(project,g.module.source),stylesheet:path.resolve(project,g.module.stylesheet)}))};
 json(path.join(expanded,'page-blueprint.json'),blueprint);json(path.join(expanded,'page-content-recipes.json'),{schemaVersion:1,blueprintRef:{id:input.id},recipes});json(path.join(expanded,'page-bindings.json'),generated);
 let css='.tui-business-stack, .tui-business-field-group { display:flex; flex-direction:column; gap:var(--space-5); }\n.tui-business-section-header, .tui-business-search-toolbar { display:flex; align-items:center; gap:var(--space-5); flex-wrap:wrap; }\n';
 if(input.businessCss){const file=path.resolve(project,input.businessCss);if(!file.startsWith(project+path.sep))throw Error('Business CSS must be inside project');css+=checkBusinessLayoutCss(fs.readFileSync(file,'utf8'),new Set(stylePlan.map(p=>p.id))); }
 fs.mkdirSync(path.join(project,'styles'),{recursive:true});fs.writeFileSync(path.join(project,'styles/page-composition.css'),css);
 json(marker,{mode:'consumer',skill:'text-to-ui-html-new',version:'0.1.1'});
 return {input,common,expanded,pattern:pattern.id};
}
try{
 if(command==='entry'){console.log(JSON.stringify(inspectDelivery(project),null,2));}
 else if(command==='compile'||command==='generate'){
 if(command==='generate'){markDelivery(project,'building');assertSingleEntry(project);}
 if(args.includes('--low-level')){if(command==='compile')throw Error('Low-level mode uses existing inputs directly');if(fs.existsSync(path.join(project,'.text-to-ui/input-mode.json'))&&read(path.join(project,'.text-to-ui/input-mode.json')).mode==='consumer')throw Error('INPUT_MODE_CONFLICT');const task=value('--task');if(!task)throw Error('--low-level requires --task');run('generate-compliant-page.mjs',['--project',project,'--repo',ROOT,'--skill-root',ROOT,'--task',task,...(value('--pattern')?['--pattern',value('--pattern')]:[])]);}
 else {const c=compile();if(command==='compile'){console.log(JSON.stringify({ok:true,skill:'text-to-ui-html-new',pattern:c.pattern,compiled:'.text-to-ui/compiled'}));process.exit(0);}run('generate-compliant-page.mjs',[...c.common,'--project',project,'--blueprint',path.join(c.expanded,'page-blueprint.json'),'--content-recipes',path.join(c.expanded,'page-content-recipes.json'),'--bindings',path.join(c.expanded,'page-bindings.json'),'--page-css',path.join(project,'styles/page-composition.css')]);}
 const report=exportPreview();json(path.join(project,'.text-to-ui/skill.json'),{name:'text-to-ui-html-new',version:'0.1.1'});console.log(JSON.stringify({ok:true,...report}));
 }else if(command==='export'){markDelivery(project,'building');assertSingleEntry(project);console.log(JSON.stringify({ok:true,...exportPreview()}));}
 else console.log('page.mjs entry --project <dir> | compile|generate --project <dir> | generate --low-level --task <task> | export --project <dir> [--format multi-file|single-file] [--out out/<name>/index.html]');
}catch(e){if(['generate','export'].includes(command)){try{markDelivery(project,'failed',null,e.message);}catch{}}console.error(e.message);if(/RUNTIME_RESOURCE_LOAD|EXTERNAL_RESOURCE/.test(e.message))console.error('下一步：离线交付不支持真实服务调用；明确原型演示与服务接入边界，不另写整页 HTML 绕过。');else if(/UNKNOWN_COMPOSITION|unsupported kind|bypasses the component|module requires/.test(e.message))console.error('下一步：先查询公开接口；若缺少业务编排，使用 business-module.mjs init 在现有分组内扩展，再重新生成同一项目。');process.exitCode=1;}
