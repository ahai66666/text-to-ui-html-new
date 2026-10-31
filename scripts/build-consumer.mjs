import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {parse} from '../vendor/acorn.mjs';import {ROOT,read} from './consumer-lib.mjs';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const rules=read(path.join(ROOT,'references/components/component-selection-rules.json')).rules;
const dir=path.join(ROOT,'packages/component-contracts/src/components');
const components=[],coverage=[];
const search=read(path.join(ROOT,'references/components/consumer-search.json')).keywords;
function defaultsFrom(source){
 const out=new Map();
 const visit=n=>{if(!n||typeof n!=='object')return;
 if(/Function/.test(n.type)||n.type==='ArrowFunctionExpression')for(let param of n.params||[]){if(param.type==='AssignmentPattern')param=param.left;if(param.type==='ObjectPattern')for(const p of param.properties){if(p.type!=='Property'||p.value.type!=='AssignmentPattern')continue;const v=p.value.right;if(v.type==='Literal'&&v.value!==null){const k=p.key.name||p.key.value;const entries=out.get(k)||[];entries.push(v.value);out.set(k,entries);}}}
 for(const [k,v]of Object.entries(n))if(k!=='start'&&k!=='end'){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}};
 visit(parse(source,{ecmaVersion:'latest',sourceType:'module'}));
 return out;
}
for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
 const contract=read(path.join(dir,file)),impl=contract.implementations?.html?.split('#')[0];
 if(!impl)throw Error('Missing HTML implementation: '+contract.id);
 const defaults=defaultsFrom(fs.readFileSync(path.join(ROOT,impl),'utf8'));
 const inputs={},managed=['className','extraAttrs','slots'],unsupported=(contract.props||[]).filter(k=>/^on[A-Z]/.test(k));
 for(const name of contract.props||[]){
  if(managed.includes(name)||unsupported.includes(name))continue;
  const enumKey={variant:'variants',size:'sizes',mode:'modes',state:'states'}[name];
  const values=defaults.get(name)||[],types=[...new Set(values.map(v=>typeof v))];
  inputs[name]={...(enumKey&&contract[enumKey]?{enum:contract[enumKey]}:{}),...(types.length===1?{type:types[0]}:{})};
  // Defaults are documented only when every inspected declaration agrees.
  if(values.length&&values.every(v=>v===values[0]))inputs[name].default=values[0];
 }
 components.push({id:contract.id,logicalName:contract.logicalName,summary:contract.purpose||contract.logicalName,keywords:search[contract.id]||'',inputs,slots:contract.slots||[],states:contract.states||[],icons:contract.iconAliases||[]});
 coverage.push({id:contract.id,source:impl,contractSha256:sha(fs.readFileSync(path.join(dir,file))),parameters:Object.fromEntries(Object.keys(inputs).map(k=>[k,{disposition:'model-writable',...(inputs[k].type?{}:{typeStatus:'not-declared; upstream validation retained'})}])),scenarios:rules.filter(r=>r.rendererKey===contract.id).map(r=>({context:r.context,capabilities:r.capabilities,parameters:Object.fromEntries(Object.keys(inputs).map(k=>[k,{disposition:Object.hasOwn(r.requiredOptions||{},k)?'scenario-fixed':'model-writable',...(Object.hasOwn(r.requiredOptions||{},k)?{value:r.requiredOptions[k]}:{})}]))})),systemManaged:['component-identity','implementation','canonical-style-loading',...managed.filter(k=>(contract.props||[]).includes(k))],unsupported:unsupported.map(name=>({name,reason:'JSON consumer binds behavior through interactions; function callbacks require a declared business module'}))});
}
for(const r of rules){const c=components.find(c=>c.id===r.rendererKey);if(!c)throw Error('Unknown rule component '+r.rendererKey);for(const[k,v]of Object.entries(r.requiredOptions||{}))if(!c.inputs[k]||(c.inputs[k].enum&&!c.inputs[k].enum.includes(v)))throw Error('Invalid fixed option '+r.context+'.'+k);}
fs.mkdirSync(path.join(ROOT,'consumer'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'consumer/catalog.json'),JSON.stringify({schemaVersion:1,skill:'text-to-ui-html-new',version:'0.1.0',components,rules}));
fs.writeFileSync(path.join(ROOT,'consumer/coverage.json'),JSON.stringify({schemaVersion:1,components:coverage},null,2)+'\n');
console.log(JSON.stringify({ok:true,components:components.length,scenarios:rules.length}));
