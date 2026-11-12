import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {parse} from '../vendor/acorn.mjs';import {ROOT,read} from './consumer-lib.mjs';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const {rules,optionSchemasByComponent}=read(path.join(ROOT,'references/components/component-selection-rules.json'));
const sceneSource=read(path.join(ROOT,'assets/design-system/titlebar-scene-contracts.json'));
for(const rule of rules){
 const scene=Object.values(sceneSource.scenes).find(s=>s.segments.some(seg=>seg.semanticContext===rule.context && seg.businessActionSlot));
 const segment=scene?.segments.find(seg=>seg.semanticContext===rule.context);
 for(const [prop,schema] of Object.entries(rule.optionSchemas??{}))if(schema.from==='pattern-titlebar-size'){
  if(!scene)throw Error('No Pattern titlebar scene for '+rule.context);
  rule.optionSchemas[prop]={type:'string',enum:scene.titleLayer.sizePolicy.allowedSizes};
 }
 for(const [slot,schema] of Object.entries(rule.slotSchemas??{}))if(schema.from==='pattern-titlebar-actions'){
  if(segment?.businessActionSlot!==slot)throw Error('No Pattern action slot for '+rule.context);
  rule.slotSchemas[slot]={type:'array',items:{type:'object',required:['id','label'],properties:{id:{type:'string',nonEmpty:true},label:{type:'string',nonEmpty:true},icon:{type:'string',nonEmpty:true},buttonType:{enum:segment.businessActionModes},disabled:{type:'boolean'},overflowTrigger:{type:'boolean'}},additionalProperties:false},uniqueBy:'id'};
 }
}
const dir=path.join(ROOT,'packages/component-contracts/src/components');
const components=[],coverage=[];
const search=read(path.join(ROOT,'references/components/consumer-search.json')).keywords;
function defaultsFrom(source){
 const out=new Map();
 const visit=n=>{if(!n||typeof n!=='object')return;
 if(/Function/.test(n.type)||n.type==='ArrowFunctionExpression')for(let param of n.params||[]){if(param.type==='AssignmentPattern')param=param.left;if(param.type==='ObjectPattern')for(const p of param.properties){if(p.type!=='Property'||p.value.type!=='AssignmentPattern')continue;const v=p.value.right;if((v.type==='Literal'&&v.value!==null)||(v.type==='ArrayExpression'&&v.elements.length===0)||(v.type==='ObjectExpression'&&v.properties.length===0)){const k=p.key.name||p.key.value;const entries=out.get(k)||[];entries.push(v.type==='ArrayExpression'?[]:v.type==='ObjectExpression'?{}:v.value);out.set(k,entries);}}}
 for(const [k,v]of Object.entries(n))if(k!=='start'&&k!=='end'){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}};
 visit(parse(source,{ecmaVersion:'latest',sourceType:'module'}));
 return out;
}
for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
 const contract=read(path.join(dir,file)),impl=contract.implementations?.html?.split('#')[0];
 if(!impl)throw Error('Missing HTML implementation: '+contract.id);
 const sourceText=fs.readFileSync(path.join(ROOT,impl),'utf8');
 const defaults=defaultsFrom(fs.readFileSync(path.join(ROOT,impl),'utf8'));
 const inputs={},managed=['className','extraAttrs','slots'],unsupported=(contract.props||[]).filter(k=>/^on[A-Z]/.test(k));
 for(const name of contract.props||[]){
  if(managed.includes(name)||unsupported.includes(name))continue;
  const enumKey={variant:'variants',size:'sizes',mode:'modes',state:'states'}[name];
  const values=defaults.get(name)||[],types=[...new Set(values.map(v=>Array.isArray(v)?'array':typeof v))];
  inputs[name]={...(enumKey&&contract[enumKey]?{enum:contract[enumKey]}:{}),...(types.length===1?{type:types[0]}:{})};
  // Defaults are documented only when every inspected declaration agrees.
  if(values.length&&values.every(v=>JSON.stringify(v)===JSON.stringify(values[0])))inputs[name].default=values[0];
  Object.assign(inputs[name],optionSchemasByComponent?.[contract.id]?.[name]);
 }
 components.push({revision:sha(JSON.stringify(contract)+sourceText+JSON.stringify(rules.filter(r=>r.rendererKey===contract.id))),id:contract.id,logicalName:contract.logicalName,summary:contract.purpose||contract.logicalName,keywords:search[contract.id]||'',inputs,slots:contract.slots||[],states:contract.states||[],icons:contract.iconAliases||[]});
 coverage.push({id:contract.id,source:impl,contractSha256:sha(fs.readFileSync(path.join(dir,file))),parameters:Object.fromEntries(Object.keys(inputs).map(k=>[k,{disposition:'model-writable',...(inputs[k].type?{}:{typeStatus:'not-declared; upstream validation retained'})}])),scenarios:rules.filter(r=>r.rendererKey===contract.id).map(r=>({context:r.context,capabilities:r.capabilities,parameters:Object.fromEntries(Object.keys(inputs).map(k=>[k,{disposition:Object.hasOwn(r.requiredOptions||{},k)?'scenario-fixed':r.systemManaged?.includes(k)?'system-managed':r.allowedProps&&!r.allowedProps.includes(k)?'not-exposed-in-context':'model-writable',...(Object.hasOwn(r.requiredOptions||{},k)?{value:r.requiredOptions[k]}:{})}]))})),systemManaged:['component-identity','implementation','canonical-style-loading',...managed.filter(k=>(contract.props||[]).includes(k))],unsupported:unsupported.map(name=>({name,reason:'JSON consumer binds behavior through interactions; function callbacks require a declared business module'}))});
}
for(const r of rules){const c=components.find(c=>c.id===r.rendererKey);if(!c)throw Error('Unknown rule component '+r.rendererKey);for(const key of r.allowedSlots||[])if(!c.slots.includes(key))throw Error('Unknown scenario slot '+r.context+'.'+key);for(const key of [...(r.allowedProps||[]),...(r.requiredProps||[])])if(!c.inputs[key])throw Error('Unknown scenario property '+r.context+'.'+key);for(const key of r.requiredProps||[])if(r.allowedProps&&!r.allowedProps.includes(key))throw Error('Required scenario property hidden: '+r.context+'.'+key);for(const[k,v]of Object.entries(r.requiredOptions||{}))if(!c.inputs[k]||(c.inputs[k].enum&&!c.inputs[k].enum.includes(v)))throw Error('Invalid fixed option '+r.context+'.'+k);}
fs.mkdirSync(path.join(ROOT,'consumer'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'consumer/catalog.json'),JSON.stringify({schemaVersion:1,skill:'text-to-ui-html-new',version:'0.1.1',components,rules}));
fs.writeFileSync(path.join(ROOT,'consumer/coverage.json'),JSON.stringify({schemaVersion:1,components:coverage},null,2)+'\n');
console.log(JSON.stringify({ok:true,components:components.length,scenarios:rules.length}));
