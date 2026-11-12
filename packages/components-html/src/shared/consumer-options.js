export function validateValue(value,schema,location){
 if(!schema)return;
 const type=Array.isArray(value)?'array':value===null?'null':typeof value;
 if(schema.enum&&!schema.enum.includes(value))throw Error('VALUE_ENUM: '+location+' allows '+schema.enum.join(', '));
 if(schema.type&&![schema.type].flat().includes(type))throw Error('VALUE_TYPE: '+location+' requires '+schema.type);
 if(schema.nonEmpty&&type==='string'&&!value.trim())throw Error('VALUE_REQUIRED: '+location);
 if(type==='array'){
  value.forEach((item,i)=>validateValue(item,schema.items,location+'['+i+']'));
  if(schema.uniqueBy && new Set(value.map(item=>item[schema.uniqueBy])).size!==value.length)throw Error('DUPLICATE_VALUE: '+location+'.'+schema.uniqueBy);
 }
 if(type==='object'){
  for(const key of schema.required??[])if(!Object.hasOwn(value,key))throw Error('VALUE_REQUIRED: '+location+'.'+key);
  for(const [key,item] of Object.entries(value)){
   if(schema.additionalProperties===false&&!Object.hasOwn(schema.properties??{},key))throw Error('UNKNOWN_FIELD: '+location+'.'+key);
   validateValue(item,schema.properties?.[key],location+'.'+key);
  }
 }
}
export function optionsFor(contract,options={}){
 if(contract.requiresContext)throw Error(`REQUIRED_CONTEXT: ${contract.id}; choose ${contract.availableContexts.join(', ')}`);
 if(!options||typeof options!=='object'||Array.isArray(options))throw Error('options must be an object');
 for(const [key,value] of Object.entries(options)){
  if(Object.hasOwn(contract.fixed,key))throw Error(`FIXED_OPTION: ${contract.id}.${key} is system-managed (${JSON.stringify(contract.fixed[key])})`);
  const rule=contract.inputs[key];if(!rule)throw Error(`UNKNOWN_PROP: ${contract.id}.${key}`);
  if(rule.enum&&!rule.enum.includes(value))throw Error(`PROP_ENUM: ${contract.id}.${key}`);
  if(rule.type&&value!==null&&!(Array.isArray(rule.type)?rule.type:[rule.type]).includes(Array.isArray(value)?'array':typeof value))throw Error(`PROP_TYPE: ${contract.id}.${key} requires ${rule.type}`);
  if(rule.items||rule.properties||rule.nonEmpty||rule.additionalProperties===false)validateValue(value,rule,contract.id+'.'+key);
 }
 const check=value=>{if(!value||typeof value!=='object')return;for(const[k,v]of Object.entries(value)){if(['className','style','extraAttrs'].includes(k))throw Error('CONSUMER_STYLE_OVERRIDE: '+k);check(v);}};check(options);
 for(const key of contract.requiredProps||[])if(options[key]===undefined||options[key]===null||options[key]===''||(Array.isArray(options[key])&&!options[key].some(Boolean)))throw Error('REQUIRED_PROP: '+contract.id+'.'+key);
 const result={...options,...contract.fixed};
 if(contract.allowedModes&&result.mode&&!contract.allowedModes.includes(result.mode))throw Error(`PROP_ENUM: ${contract.id}.mode`);
 return result;
}
export function checkSlots(contract,slots={}){if(!slots||typeof slots!=='object'||Array.isArray(slots))throw Error('slots must be an object');const inspect=value=>{if(typeof value==='string'&&/<\/?[a-z]/i.test(value))throw Error('RAW_SLOT_HTML: use registered components or a declared business module');if(value&&typeof value==='object')for(const[k,v]of Object.entries(value)){if(['style','className','extraAttrs'].includes(k))throw Error('CONSUMER_STYLE_OVERRIDE: '+k);inspect(v);}};inspect(slots);for(const key of Object.keys(slots)){if(!contract.slots.includes(key))throw Error(`UNKNOWN_SLOT: ${contract.id}.${key}`);validateValue(slots[key],contract.slotSchemas?.[key],contract.id+'.'+key);if(['accordion','collapsible'].includes(contract.id)&&typeof slots[key]!=='string')throw Error('SLOT_TYPE: '+contract.id+'.'+key+' requires text');}return slots;}

// Modules can render only the consumer scenarios declared by their host group.
export function createModuleRenderer(render, contracts, {secondaryTitlebar=false}={}) {
 return (id, options={}, context=null)=>{
  if(id==='titlebar'&&secondaryTitlebar&&options?.size==='small'&&options.layout==='standalone'){
   if(options.segmentRole&&options.segmentRole!=='global'||options.className||options.style||options.extraAttrs||options.mainDetailActions||options.slots?.['main-detail-actions'])throw Error('SECONDARY_TITLEBAR_OPTIONS: use the standalone Secondary Page titlebar contract');
   return render(id,options);
  }
  if(!options||typeof options!=='object'||Array.isArray(options))throw Error('Module component options must be an object');
  const matches=contracts.filter(c=>c.id===id&&(!context||c.context===context)
   &&Object.entries(c.fixed).every(([key,value])=>!Object.hasOwn(options,key)||options[key]===value));
  if(matches.length!==1)throw Error('MODULE_COMPONENT_CONTEXT: '+id+' / '+(context??'auto')+'; choose one scenario declared by this group');
  const contract=matches[0],{slots,...props}=options;
  for(const key of Object.keys(contract.fixed))delete props[key]; // Accept old redundant values only when they match.
  const validated=optionsFor(contract,props);
  if(slots!==undefined){
   if(id!=='titlebar')throw Error('MODULE_COMPONENT_SLOTS: '+id+'; pass the documented component options');
   validated.slots=checkSlots(contract,slots);
  }
  return render(id,validated);
 };
}
