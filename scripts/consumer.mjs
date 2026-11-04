#!/usr/bin/env node
import {catalog,select,ROOT} from './consumer-lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const args=process.argv.slice(2),command=args.shift()||'help';
const flags=new Map(),ids=[];
for(let i=0;i<args.length;i++){
 const arg=args[i];
 if(['--context','--since','--write-state'].includes(arg)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing '+arg);flags.set(arg,args[++i]);}
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
   console.log(`${c.id}${c.context?' / '+c.context:''}: ${c.keywords||c.summary}\n可写: ${open.map(([key,r])=>key+(r.enum?':'+r.enum.join('|'):r.type?':'+r.type:'')+(Object.hasOwn(r,'default')?'='+JSON.stringify(r.default):'')).join(', ')}\n插槽: ${c.slots.join(', ')||'无'}${c.requiredProps.length?'\n必填: '+c.requiredProps.join(', '):''}${c.requiredSlot?'\nPattern槽位: '+c.requiredSlot:''}${Object.keys(c.fixed).length?'\n固定（勿填写）: '+JSON.stringify(c.fixed):''}\n示例: ${JSON.stringify({use:c.id,...(c.context?{context:c.context}:{}),options})}\n`);
  }
  if(flags.has('--since'))console.log(`接口增量: ${changed} 更新，${unchanged} 未变化；未变化项沿用已读接口。`);
  if(flags.has('--write-state')){const file=path.resolve(flags.get('--write-state'));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n');}
 } else if(command==='list') console.log(data.components.map(c=>`${c.id}: ${c.keywords||c.summary}`).join('\n'));
 else if(command==='find'){
  const q=ids.join(' ').toLowerCase();if(!q)throw Error('Provide a search intent');
  const terms=[...new Set([q,...(q.match(/[a-z0-9-]+|[一-鿿]+/g)||[]).flatMap(t=>/[一-鿿]/.test(t)&&t.length>2?Array.from({length:t.length-1},(_,i)=>t.slice(i,i+2)):[t])])];
  const hits=data.components.map(c=>({c,n:[c.id,c.summary,c.keywords,...data.rules.filter(r=>r.rendererKey===c.id).flatMap(r=>[r.context,...r.capabilities])].reduce((n,v)=>n+terms.filter(t=>v.toLowerCase().includes(t)).length,0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n||a.c.id.localeCompare(b.c.id)).slice(0,3);
  console.log(hits.length?hits.map(({c})=>`${c.id}: ${c.keywords||c.summary}${data.rules.some(r=>r.rendererKey===c.id)?'\n场景: '+[...new Set(data.rules.filter(r=>r.rendererKey===c.id).map(r=>r.context))].join(', '):''}`).join('\n'):'CAPABILITY_GAP: no public match; describe a known candidate or record a missing capability');
 } else console.log('consumer.mjs list | find <意图> | describe <id...> [--context <语义>] [--full] [--since <已读接口状态.json>] [--write-state <状态.json>]');
} catch(error){console.error(error.message);process.exitCode=1;}
