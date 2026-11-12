import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateValue} from '../packages/components-html/src/shared/consumer-options.js';
export {optionsFor,checkSlots,validateValue} from '../packages/components-html/src/shared/consumer-options.js';
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
 const availableContexts=[...new Set(rules.map(r=>r.context))];
 const requiresContext=Boolean(exact&&!context&&availableContexts.length>1);
 if(!context&&requiresContext)rules=[];
 const variants=[...new Set(rules.map(r=>JSON.stringify(r.requiredOptions||{})))];
 if(variants.length>1){
  const precise=rules.filter(r=>r.capabilities.includes(key));
  if(precise.length===1)rules=precise;else throw Error(`AMBIGUOUS_CONTEXT: ${key}/${context}; use a capability such as toolbar-icon-action`);
 }
 const rule=rules[0]||null;
 return {...consumerContract(component,rule),requiresContext,availableContexts};
}
export function consumerContract(component,rule){
 const fixed=rule?.requiredOptions||{};
 const visible=rule?.allowedProps ? Object.fromEntries(Object.entries(component.inputs).filter(([key])=>rule.allowedProps.includes(key)||Object.hasOwn(fixed,key))) : component.inputs;
 const inputs=Object.fromEntries(Object.entries(visible).map(([key,schema])=>[key,{...schema,...rule?.optionSchemas?.[key]}]));
 return {...component,inputs,slotSchemas:rule?.slotSchemas??{},slots:rule?.allowedSlots??component.slots,context:rule?.context||null,fixed,requiredProps:rule?.requiredProps||[],requiredSlot:rule?.requiredSlot||null,allowedModes:rule?.allowedModes||null};
}
export function ruleForOptions(logicalName,context,options,root=ROOT){
 const candidates=catalog(root).rules.filter(r=>r.logicalName===logicalName&&r.context===context);
 if(!candidates.length)return null;
 const matches=candidates.filter(r=>Object.entries(r.requiredOptions||{}).every(([k,v])=>options[k]===v)&&(!r.allowedModes||r.allowedModes.includes(options.mode)));
 if(matches.length!==1)throw Error(`SEMANTIC_OPTIONS: ${logicalName}/${context} must match exactly one published scenario`);
 const rule=matches[0];
 if(rule.allowedProps){const allowed=new Set([...rule.allowedProps,...Object.keys(rule.requiredOptions||{}),...(rule.rendererKey==='titlebar'?['slots']:[])]);for(const key of Object.keys(options))if(!allowed.has(key))throw Error('SCENARIO_PROP: '+context+'.'+key);}
 if(options.slots)for(const key of Object.keys(options.slots)){
  if(rule.allowedSlots&&!rule.allowedSlots.includes(key))throw Error('SCENARIO_SLOT: '+context+'.'+key);
  validateValue(options.slots[key],rule.slotSchemas?.[key],context+'.'+key);
 }
 for(const [key,schema] of Object.entries(rule.optionSchemas??{}))if(Object.hasOwn(options,key))validateValue(options[key],schema,context+'.'+key);
 for(const key of rule.requiredProps||[])if(options[key]===undefined||options[key]===null||options[key]===''||(Array.isArray(options[key])&&!options[key].some(Boolean)))throw Error('REQUIRED_PROP: '+context+'.'+key);
 return rule;
}
