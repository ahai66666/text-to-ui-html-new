#!/usr/bin/env node
import {catalog,select,ROOT} from './consumer-lib.mjs';
import {pageTitlebarPolicy} from './titlebar-scene.mjs';
import {readPatternRegistry} from './pattern-contract-lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const args=process.argv.slice(2),command=args.shift()||'help';
const flags=new Map(),ids=[];
for(let i=0;i<args.length;i++){
 const arg=args[i];
 if(['--context','--since','--write-state','--pattern','--region','--scope'].includes(arg)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing '+arg);flags.set(arg,args[++i]);}
 else if(arg==='--full')flags.set(arg,true);
 else if(arg.startsWith('--'))throw Error('Unknown option '+arg);
 else ids.push(arg);
}
try {
 const data=catalog(),context=flags.get('--context')||null;
 if(command==='describe'){
  if(!ids.length)throw Error('Provide at least one exact component ID or capability');
  const previous=flags.has('--since')?JSON.parse(fs.readFileSync(flags.get('--since'),'utf8')):{schemaVersion:1,entries:{}};
  if(previous.schemaVersion!==1||!previous.entries||typeof previous.entries!=='object'||Array.isArray(previous.entries))throw Error('Invalid query state');
  const next={schemaVersion:1,entries:{...previous.entries}},seen=new Set();let changed=0,unchanged=0;
  for(const id of ids){
   const c=select(id,context),key=JSON.stringify([c.id,c.context,Boolean(flags.get('--full'))]);
   if(seen.has(key))continue;seen.add(key);
   // Hash the selected interface plus canonical source closure, not a page's business values.
   const paths=new Map();
   function source(file){if(paths.has(file))return;const full=path.join(ROOT,file);const text=fs.readFileSync(full,'utf8');paths.set(file,text);for(const m of text.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']/g)){const spec=m[1]||m[2];if(spec.startsWith('.'))source(path.posix.normalize(path.posix.join(path.posix.dirname(file),spec)));}}
   const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'packages/component-contracts/src/components',c.id+'.json'),'utf8'));source(contract.implementations.html.split('#')[0]);
   const coverage=flags.get('--full')?JSON.parse(fs.readFileSync(path.join(ROOT,'consumer/coverage.json'),'utf8')).components.find(x=>x.id===c.id):null;
   const revision=crypto.createHash('sha256').update(JSON.stringify({c,contract,sources:[...paths].sort(),coverage})).digest('hex');
   next.entries[key]=revision;
   if(previous.entries[key]===revision){unchanged++;continue;}changed++;
   if(flags.get('--full')){console.log(JSON.stringify({consumer:c,coverage},null,2));continue;}
   if(c.requiresContext){console.log(`${c.id}: 需选择语义场景\n可选 context: ${c.availableContexts.join(', ')}\n使用 describe ${c.id} --context <场景>\n`);continue;}
   const open=Object.entries(c.inputs).filter(([key])=>!Object.hasOwn(c.fixed,key));
   const options=Object.hasOwn(c.inputs,'title')?{title:'<业务文案>'}:Object.hasOwn(c.inputs,'label')?{label:'<业务文案>'}:{};
   if(c.requiredProps.includes('scopeOptions'))options.scopeOptions=['<范围选项>'];
   const slots=Object.entries(c.slotSchemas).map(([name,rule])=>name+': '+(rule.items?.required??[]).join(', ')+' 必填'+(rule.items?.properties?.buttonType?.enum?'；buttonType='+rule.items.properties.buttonType.enum.join('|'):''));
   const example={use:c.id,...(c.context?{context:c.context}:{}),options};
   if(Object.hasOwn(c.slotSchemas,'main-detail-actions')){
    example.slots={'main-detail-actions':[{id:'delete',label:'删除',icon:'action/delete'}]};
    example.actionBehaviors={delete:'delete-current'};
   }
   console.log(`${c.id}${c.context?' / '+c.context:''}: ${c.keywords||c.summary}\n可写: ${open.map(([key,r])=>key+(r.enum?':'+r.enum.join('|'):r.type?':'+r.type:'')+(Object.hasOwn(r,'default')?'='+JSON.stringify(r.default):'')).join(', ')}\n插槽: ${c.slots.join(', ')||'无'}${c.requiredProps.length?'\n必填: '+c.requiredProps.join(', '):''}${c.requiredSlot?'\nPattern槽位: '+c.requiredSlot:''}${Object.keys(c.fixed).length?'\n固定（勿填写）: '+JSON.stringify(c.fixed):''}\n示例: ${JSON.stringify(example)}${slots.length?'\n插槽结构: '+slots.join(' / '):''}\n`);
  }
  if(flags.has('--since'))console.log(`接口增量: ${changed} 更新，${unchanged} 未变化；未变化项沿用已读接口。`);
  if(flags.has('--write-state')){const file=path.resolve(flags.get('--write-state'));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n');}
 } else if(command==='list') console.log(data.components.map(c=>`${c.id}: ${c.keywords||c.summary}`).join('\n'));
 else if(command==='find'){
  const q=ids.join(' ').trim().toLowerCase();if(!q)throw Error('Provide a search intent');
  const patternId=flags.get('--pattern'),region=flags.get('--region'),scope=flags.get('--scope');
  const pattern=patternId?readPatternRegistry().patterns.find(p=>p.id===patternId):null;
  if(patternId&&!pattern)throw Error('Unknown Pattern: '+patternId);
  if(region&&(!pattern||!pattern.paneOrder.includes(region)))throw Error('--region must belong to the selected --pattern');
  if(scope&&scope!=='detail-action')throw Error('Unknown scope: '+scope);
  if(scope==='detail-action'){
   const detail=pattern&&pageTitlebarPolicy(ROOT,pattern.id).preset.segments.find(segment=>segment.businessActionSlot);
   if(!detail||(region&&region!==detail.id))throw Error('CAPABILITY_GAP: this Pattern / region has no registered detail action slot');
   console.log('组合: titlebar / '+detail.semanticContext+' → '+detail.businessActionSlot+'；page-input 使用 detailActions，动作与行为由业务声明。');
  }else{
   const terms=[...new Set([q,...(q.match(/[a-z0-9-]+|[一-鿿]+/g)||[]).flatMap(t=>/[一-鿿]/.test(t)&&t.length>2?Array.from({length:t.length-1},(_,i)=>t.slice(i,i+2)):[t])])];
   const slots=new Map((pattern?.slots??[]).map(s=>[s.id,s]));
   const hits=data.components.map(c=>{
    const rules=data.rules.filter(r=>r.rendererKey===c.id&&(!context||r.context===context)).filter(r=>{
     if(!r.requiredSlot||!pattern)return true;
     const slot=slots.get(r.requiredSlot);
     return slot&&(!region||slot.owner===region||slot.owner==='page');
    });
    const searchable=[c.id,c.summary,c.keywords,...rules.flatMap(r=>[r.context,...r.capabilities])].map(v=>v.toLowerCase());
    const n=searchable.reduce((n,v)=>n+terms.filter(t=>v.includes(t)).length,0);
    const exact=c.id===q||c.keywords.split(/\s+/).includes(q);
    const scoped=Boolean(region&&rules.some(r=>slots.get(r.requiredSlot)?.owner===region));
    return {c,rules,n,score:n+(exact?40:0)+(scoped?80:0)};
   }).filter(x=>x.n&&(!context||x.rules.length)).sort((a,b)=>b.score-a.score||a.c.id.localeCompare(b.c.id)).slice(0,3);
   console.log(hits.length?hits.map(({c,rules})=>c.id+': '+(c.keywords||c.summary)+(rules.length?'\n场景: '+[...new Set(rules.map(r=>r.context))].slice(0,3).join(', '):'')).join('\n'):'NO_QUERY_MATCH: 用组件功能名重查；确认无注册组件或槽位后，再记录能力缺口');
  }
 } else console.log('consumer.mjs list | find <意图> [--pattern <ID> --region <窗格> --scope detail-action] | describe <id...> [--context <语义>] [--full] [--since <已读接口状态.json>] [--write-state <状态.json>]');
} catch(error){console.error(error.message);process.exitCode=1;}
