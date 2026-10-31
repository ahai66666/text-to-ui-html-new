#!/usr/bin/env node
import {catalog,select,ROOT} from './consumer-lib.mjs';import fs from 'node:fs';import path from 'node:path';
const args=process.argv.slice(2),command=args.shift()||'help';
const value=f=>{const i=args.indexOf(f);return i<0?null:args[i+1];};
const context=value('--context');const ids=args.filter((x,i)=>!x.startsWith('--')&&!(i&&['--context','--out'].includes(args[i-1])));
try{
 const data=catalog();
 if(command==='describe')for(const id of ids){const c=select(id,context);if(args.includes('--full')){console.log(JSON.stringify({consumer:c,coverage:JSON.parse(fs.readFileSync(path.join(ROOT,'consumer/coverage.json'))).components.find(x=>x.id===c.id)},null,2));continue;}
 const open=Object.entries(c.inputs).filter(([k])=>!Object.hasOwn(c.fixed,k));
 console.log(`${c.id}${c.context?' / '+c.context:''}: ${c.keywords||c.summary}\n可写: ${open.map(([k,r])=>k+(r.enum?':'+r.enum.join('|'):r.type?':'+r.type:'')+(Object.hasOwn(r,'default')?'='+JSON.stringify(r.default):'')).join(', ')}\n插槽: ${c.slots.join(', ')||'无'}${c.requiredSlot?'\nPattern槽位: '+c.requiredSlot:''}${Object.keys(c.fixed).length?'\n固定（勿填写）: '+JSON.stringify(c.fixed):''}\n示例: ${JSON.stringify({use:id,...(context?{context}:{}),options:Object.hasOwn(c.inputs,'label')?{label:'<业务文案>'}:{}})}\n`);
 }else if(command==='list')console.log(data.components.map(c=>`${c.id}: ${c.keywords||c.summary}`).join('\n'));
 else if(command==='find'){const q=ids.join(' ').toLowerCase();const terms=[...new Set([q,...(q.match(/[a-z0-9-]+|[一-鿿]+/g)||[]).flatMap(t=>/[一-鿿]/.test(t)&&t.length>2?Array.from({length:t.length-1},(_,i)=>t.slice(i,i+2)):[t])])];const hits=data.components.map(c=>({c,n:[c.id,c.summary,c.keywords,...data.rules.filter(r=>r.rendererKey===c.id).flatMap(r=>[r.context,...r.capabilities])].reduce((n,v)=>n+terms.filter(t=>v.toLowerCase().includes(t)).length,0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n||a.c.id.localeCompare(b.c.id)).slice(0,3);console.log(hits.length?hits.map(x=>`${x.c.id}: ${x.c.keywords||x.c.summary}`).join('\n'):'CAPABILITY_GAP: no public match; describe a known candidate or record a missing capability');}
 else console.log('consumer.mjs list | find <意图> | describe <id...> [--context <语义>] [--full]');
}catch(e){console.error(e.message);process.exitCode=1;}
