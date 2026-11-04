import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,select,optionsFor,ruleForOptions} from '../scripts/consumer-lib.mjs';
import {render as accordion} from '../packages/components-html/src/accordion/index.js';
import {render as collapsible} from '../packages/components-html/src/collapsible/index.js';
import {toggleDisclosure} from '../packages/components-html/src/shared/disclosure-behavior.js';
const run=(script,args=[])=>spawnSync(process.execPath,[path.join(ROOT,'scripts',script),...args],{cwd:ROOT,encoding:'utf8'});
function temporary(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tui-query-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}

test('published disclosure parameters affect the rendered identity button',()=>{
 for(const [id,render] of [['accordion',accordion],['collapsible',collapsible]]){
  const selected=select(id);const html=render(optionsFor(selected,{title:'用户分组',expanded:true,contentId:'unique-panel',disabled:true}));
  assert.match(html,/>用户分组<\/span>/);assert.match(html,new RegExp('<button[^>]+data-component="'+id+'"[^>]+disabled[^>]+aria-expanded="true"[^>]+aria-controls="unique-panel"'));
  assert.doesNotMatch(html,/<div[^>]+data-logical-component=/);assert.match(html,/data-state="disabled"/);assert.match(html,/data-variant="open"/);assert.doesNotMatch(html,/'unique-panel'[^>]+hidden/);
  assert.match(render(optionsFor(selected,{label:'兼容文案'})),/>兼容文案<\/span>/);
  assert.match(render(optionsFor(selected,{title:'优先文案',label:'被覆盖文案'})),/>优先文案<\/span>/);
  assert.match(render(optionsFor(selected,{state:'open'})),/aria-expanded="true"/);
  assert.match(render(optionsFor(selected,{state:'pressed'})),/data-state="pressed"/);
  assert.match(render(optionsFor(selected,{state:'disabled'})),/ disabled /);
  assert.throws(()=>optionsFor(selected,{size:'small'}),/UNKNOWN_PROP/);
  assert.throws(()=>optionsFor(selected,{state:'unfocus'}),/PROP_ENUM/);
  assert.throws(()=>optionsFor(selected,{expanded:'yes'}),/PROP_TYPE/);
 }
});

test('toggleDisclosure keeps enabled state, ARIA and content synchronized and ignores disabled triggers',()=>{
 const panel={id:'panel',hidden:true};const attributes={'aria-expanded':'false','aria-controls':'panel'};
 const trigger={disabled:false,dataset:{state:'default',variant:'default'},matches:()=>true,closest:()=>({querySelector:()=>panel}),getAttribute:k=>attributes[k],setAttribute:(k,v)=>attributes[k]=v};
 assert.equal(toggleDisclosure(trigger),true);assert.equal(panel.hidden,false);assert.equal(trigger.dataset.state,'open');assert.equal(attributes['aria-expanded'],'true');
 assert.equal(toggleDisclosure(trigger),true);assert.equal(panel.hidden,true);assert.equal(trigger.dataset.variant,'default');
 trigger.disabled=true;assert.equal(toggleDisclosure(trigger),false);assert.equal(panel.hidden,true);
});

test('missing semantics cannot bypass fixed options; capability aliases select their exact scene',()=>{
 assert.throws(()=>optionsFor(select('button'),{label:'保存',variant:'danger'}),/REQUIRED_CONTEXT/);
 assert.throws(()=>optionsFor(select('search'),{placeholder:'查找'}),/REQUIRED_CONTEXT/);
 assert.equal(select('toolbar-icon-action').context,'toolbar-action');
 assert.equal(select('toolbar-icon-action').fixed.mode,'icon');
 assert.throws(()=>select('icon-button'),/AMBIGUOUS/);
});

test('search and titlebar scenes expose only supported parameters',()=>{
 const standard=select('search-standard');assert.equal(standard.fixed.advancedSearch,false);assert(!Object.hasOwn(standard.inputs,'scopeOptions'));
 assert.throws(()=>optionsFor(standard,{scopeOptions:['全部']}),/UNKNOWN_PROP/);
 assert.throws(()=>ruleForOptions(standard.logicalName,standard.context,{advancedSearch:false,scopeOptions:['全部']}),/SCENARIO_PROP/);
 const scoped=select('search-scoped');assert.equal(scoped.inputs.scopeOptions.type,'array');
 assert.throws(()=>optionsFor(scoped,{}),/REQUIRED_PROP/);assert.throws(()=>optionsFor(scoped,{scopeOptions:[]}),/REQUIRED_PROP/);assert.throws(()=>optionsFor(scoped,{scopeOptions:'全部'}),/PROP_TYPE/);
 assert.equal(optionsFor(scoped,{scopeOptions:['业务范围']}).advancedSearch,false);
 const advanced=select('search-scoped-advanced');assert.equal(optionsFor(advanced,{scopeOptions:['业务范围']}).advancedSearch,true);
 const title=select('titlebar','main-detail-titlebar');assert(!Object.hasOwn(title.inputs,'logoSrc'));assert(Object.hasOwn(title.inputs,'mainDetailActions'));
 assert.throws(()=>optionsFor(title,{logoSrc:'./logo.svg'}),/UNKNOWN_PROP/);
});

test('compact discover retains task, Workflow and allowed Pattern decisions',()=>{
 const response=run('discover-page.mjs',['--task','邮箱工作台']);assert.equal(response.status,0,response.stderr);const data=JSON.parse(response.stdout);
 assert.equal(data.workflow,'new-page');assert.equal(data.taskRoute,'communication-workbench');assert(data.allowedPatterns.includes(data.pattern));assert(data.defaultPattern);assert(data.slots.some(s=>s.id==='global-title-layer'));assert(Buffer.byteLength(response.stdout)<8192);
 const rejected=run('discover-page.mjs',['--task','邮箱工作台','--pattern','pattern-c-tool-workspace']);assert.notEqual(rejected.status,0);
});

test('component query deduplicates, reuses read versions and returns stale interfaces',t=>{
 const dir=temporary(t),state=path.join(dir,'read-state.json');
 const first=run('consumer.mjs',['describe','accordion','accordion','collapsible','--write-state',state]);assert.equal(first.status,0,first.stderr);assert.equal((first.stdout.match(/^accordion:/gm)||[]).length,1);
 const second=run('consumer.mjs',['describe','accordion','collapsible','--since',state,'--write-state',state]);assert.equal(second.status,0,second.stderr);assert.match(second.stdout,/0 更新，2 未变化/);assert.doesNotMatch(second.stdout,/可写:/);
 const stale=JSON.parse(fs.readFileSync(state));const key=Object.keys(stale.entries).find(k=>JSON.parse(k)[0]==='accordion');stale.entries[key]='stale';fs.writeFileSync(state,JSON.stringify(stale));
 const third=run('consumer.mjs',['describe','accordion','collapsible','--since',state]);assert.equal(third.status,0,third.stderr);assert.match(third.stdout,/1 更新，1 未变化/);assert.match(third.stdout,/^accordion:/m);assert.doesNotMatch(third.stdout,/^collapsible:/m);
 const otherScene=run('consumer.mjs',['describe','search-scoped','--since',state]);assert.match(otherScene.stdout,/必填: scopeOptions/);
 const full=run('consumer.mjs',['describe','accordion','--full','--since',state]);assert.equal(full.status,0,full.stderr);assert.match(full.stdout,/"coverage"/);
 const unknown=run('consumer.mjs',['describe','accordion','--silent-fallback']);assert.notEqual(unknown.status,0);
});


test('disclosure text slots survive the complete consumer generation pipeline',t=>{
 const dir=temporary(t),input=JSON.parse(fs.readFileSync(path.join(ROOT,'examples/settings/page-input.json')));
 input.id='disclosure-slots';input.groups[1].children=[{id:'disclosure',use:'accordion',options:{contentId:'real-panel'},slots:{label:'业务分组',content:'业务内容 & 详情'},behavior:'disclose'}];
 input.interactions=[input.interactions[0],{id:'disclose',kind:'component-native',triggers:['disclosure'],outcome:'展开业务内容'}];
 fs.writeFileSync(path.join(dir,'page-input.json'),JSON.stringify(input));const response=run('page.mjs',['generate','--project',dir]);assert.equal(response.status,0,response.stderr);
 const rendered=fs.readFileSync(path.join(dir,'generated-page.js'),'utf8');assert.match(rendered,/业务分组/);assert.match(rendered,/业务内容 &amp; 详情/);assert(fs.existsSync(path.join(dir,'out/disclosure-slots/index.html')));
});
