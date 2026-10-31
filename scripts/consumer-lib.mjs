import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export function catalog(root=ROOT){return read(path.join(root,'consumer/catalog.json'));}
export function select(key,context=null,root=ROOT){
 const data=catalog(root), exact=data.components.find(c=>c.id===key);
 let rules=data.rules.filter(r=>(exact?r.rendererKey===exact.id:r.capabilities.includes(key))&&(!context||r.context===context));
 if(!exact&&!rules.length)throw Error(`UNKNOWN_PUBLIC_ID: ${key}; use find or declare a capability gap`);
 const ids=[...new Set(rules.map(r=>r.rendererKey))];
 if(!exact&&ids.length!==1)throw Error(`AMBIGUOUS_COMPONENT: ${key}; provide exact id and context`);
 const component=exact||data.components.find(c=>c.id===ids[0]);
 if(context&&!rules.length)throw Error(`UNSUPPORTED_CONTEXT: ${key}/${context}`);
 if(!context)rules=[];
 const variants=[...new Set(rules.map(r=>JSON.stringify(r.requiredOptions||{})))];
 if(variants.length>1){
  const precise=rules.filter(r=>r.capabilities.includes(key));
  if(precise.length===1)rules=precise;else throw Error(`AMBIGUOUS_CONTEXT: ${key}/${context}; use a capability such as toolbar-icon-action`);
 }
 const rule=rules[0]||null;
 return {...component,context:rule?.context||null,fixed:rule?.requiredOptions||{},requiredSlot:rule?.requiredSlot||null,allowedModes:rule?.allowedModes||null};
}
export function optionsFor(contract,options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw Error('options must be an object');
 for(const [key,value] of Object.entries(options)){
  if(Object.hasOwn(contract.fixed,key))throw Error(`FIXED_OPTION: ${contract.id}.${key} is system-managed (${JSON.stringify(contract.fixed[key])})`);
  const rule=contract.inputs[key];if(!rule)throw Error(`UNKNOWN_PROP: ${contract.id}.${key}`);
  if(rule.enum&&!rule.enum.includes(value))throw Error(`PROP_ENUM: ${contract.id}.${key}`);
  if(rule.type&&value!==null&&(rule.type==='array'?!Array.isArray(value):typeof value!==rule.type))throw Error(`PROP_TYPE: ${contract.id}.${key} requires ${rule.type}`);
 }
 const check=value=>{if(!value||typeof value!=='object')return;for(const[k,v]of Object.entries(value)){if(['className','style','extraAttrs'].includes(k))throw Error('CONSUMER_STYLE_OVERRIDE: '+k);check(v);}};check(options);
 const result={...options,...contract.fixed};
 if(contract.allowedModes&&result.mode&&!contract.allowedModes.includes(result.mode))throw Error(`PROP_ENUM: ${contract.id}.mode`);
 return result;
}
export function checkSlots(contract,slots={}){if(!slots||typeof slots!=='object'||Array.isArray(slots))throw Error('slots must be an object');const inspect=value=>{if(typeof value==='string'&&/<\/?[a-z]/i.test(value))throw Error('RAW_SLOT_HTML: use registered components or a declared business module');if(value&&typeof value==='object')for(const[k,v]of Object.entries(value)){if(['style','className','extraAttrs'].includes(k))throw Error('CONSUMER_STYLE_OVERRIDE: '+k);inspect(v);}};inspect(slots);for(const key of Object.keys(slots))if(!contract.slots.includes(key))throw Error(`UNKNOWN_SLOT: ${contract.id}.${key}`);return slots;}
export function ruleForOptions(logicalName,context,options,root=ROOT){
 const candidates=catalog(root).rules.filter(r=>r.logicalName===logicalName&&r.context===context);
 if(!candidates.length)return null;
 const matches=candidates.filter(r=>Object.entries(r.requiredOptions||{}).every(([k,v])=>options[k]===v)&&(!r.allowedModes||r.allowedModes.includes(options.mode)));
 if(matches.length!==1)throw Error(`SEMANTIC_OPTIONS: ${logicalName}/${context} must match exactly one published scenario`);
 return matches[0];
}
