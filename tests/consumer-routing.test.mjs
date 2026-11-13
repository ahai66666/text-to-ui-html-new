import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT,select,optionsFor,ruleForOptions,checkSlots} from '../scripts/consumer-lib.mjs';
import {render as accordion} from '../packages/components-html/src/accordion/index.js';
import {render as sidebar, sidebarInstanceCount} from '../packages/components-html/src/sidebar/index.js';
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
 const title=select('titlebar','main-detail-titlebar');assert(!Object.hasOwn(title.inputs,'logoSrc'));assert(!Object.hasOwn(title.inputs,'mainDetailActions'));
 assert.deepEqual(title.slots,['main-detail-actions']);
 assert.throws(()=>checkSlots(title,{'main-content-title':'详情'}),/UNKNOWN_SLOT/);
 assert.throws(()=>checkSlots(title,{actions:false}),/UNKNOWN_SLOT/);
 assert.throws(()=>checkSlots(title,{'main-detail-actions':[{id:'bad',label:'查看',buttonType:'text'}]}),/VALUE_ENUM/);
 assert.throws(()=>optionsFor(scoped,{scopeOptions:[{icon:'action/delete'}]}),/scopeOptions\[0\].label/);
 assert.throws(()=>optionsFor(title,{logoSrc:'./logo.svg'}),/UNKNOWN_PROP/);
});

test('compact discover retains task, Workflow and allowed Pattern decisions',()=>{
 const response=run('discover-page.mjs',['--task','邮箱工作台']);assert.equal(response.status,0,response.stderr);const data=JSON.parse(response.stdout);
 assert.equal(data.workflow,'new-page');assert.equal(data.taskRoute,'communication-workbench');assert(data.allowedPatterns.includes(data.pattern));assert(data.defaultPattern);assert(data.slots.some(s=>s.id==='global-title-layer'));assert(Buffer.byteLength(response.stdout)<8192);
 const mode = data.navigationModes.find(entry => entry.input.navigationMode === 'two-level');
 assert.deepEqual(mode.slots.find(slot => slot.placement === 'bottom'), {
  id: 'primary-navigation-bottom', placement: 'bottom', required: true, contexts: ['primary-navigation-shell'],
 });
 assert.equal(mode.slots.find(slot => slot.id === 'global-primary-action').required, false);
 assert.equal(data.geometry.regions['secondary-list'].scrollOwner,'secondary-list');
 assert.equal(data.titlebar.segments.find(segment=>segment.region==='secondary-list').context,'secondary-list-search');
 assert.deepEqual(data.slots.find(slot => slot.id === 'main-detail-actions').componentOwner, {
  context: 'main-detail-titlebar', slot: 'main-detail-actions',
 });
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
 input.id='disclosure-slots';input.groups.find(group=>group.id==='preferences').children=[{id:'disclosure',use:'accordion',options:{contentId:'real-panel'},slots:{label:'业务分组',content:'业务内容 & 详情'},behavior:'disclose'}];
 input.interactions=[{id:'disclose',kind:'component-native',triggers:['disclosure'],outcome:'展开业务内容'}];
 fs.writeFileSync(path.join(dir,'page-input.json'),JSON.stringify(input));const response=run('page.mjs',['generate','--project',dir]);assert.equal(response.status,0,response.stderr);
 const rendered=fs.readFileSync(path.join(dir,'generated-page.js'),'utf8');assert.match(rendered,/业务分组/);assert.match(rendered,/业务内容 &amp; 详情/);assert(fs.existsSync(path.join(dir,'out/disclosure-slots/index.html')));
});

test('explicit Pattern B Titlebar owns the detail action and replaces the structural default', t => {
 const dir = temporary(t);
 const input = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples/records/page-input.json')));
 input.groups.find(group => group.region === 'main-detail').children.push({
  id: 'detail-title', use: 'titlebar', context: 'main-detail-titlebar',
  slots: {'main-detail-actions': [{id: 'inspect', label: '查看', icon: 'action/settings'}]},
  actionBehaviors: {inspect: 'inspect-record'},
 });
 input.interactions.push({
  id: 'inspect-record', kind: 'toggle-hidden', triggers: ['detail-title'],
  targetSelector: '[data-composition-id="info-1"]', outcome: '切换记录信息',
 });
 fs.writeFileSync(path.join(dir, 'page-input.json'), JSON.stringify(input));
 const response = run('page.mjs', ['generate', '--project', dir]);
 assert.equal(response.status, 0, response.stderr);
 const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'html-page-manifest.json')));
 const detail = manifest.registered.filter(binding => binding.slot === 'main-detail-title');
 assert.deepEqual(detail.map(binding => binding.id), ['detail-title']);
 assert.deepEqual(detail[0].actionBehaviors, {inspect: 'inspect-record'});
 assert.equal(detail[0].slots['main-detail-actions'][0].id, 'inspect');
});

test('detailActions expands once and a copy revision inherits the resolved scene',t=>{
 const dir=temporary(t),file=path.join(dir,'page-input.json');
 const input=JSON.parse(fs.readFileSync(path.join(ROOT,'examples/records/page-input.json')));
 input.titlebarSize='medium';
 input.navigationMode='two-level';
 input.groups.push({id:'navigation',region:'primary-navigation',purpose:'切换工作区',children:[
  {id:'nav-records',use:'primary-navigation-item',options:{label:'记录',icon:'navigation/grid',selected:true},behavior:'navigate'},
  {id:'nav-settings',use:'primary-navigation-item',options:{label:'设置',icon:'action/settings'},behavior:'navigate'},
 ]});
 input.interactions.push({id:'navigate',kind:'component-native',triggers:['nav-records','nav-settings'],outcome:'选择工作区'});
 input.groups.push({id:'folders',region:'primary-navigation',purpose:'记录分组',children:[{id:'folder-list',use:'sidebar',context:'secondary-navigation',options:{items:[{label:'全部记录',icon:'navigation/list'}]},behavior:'choose-folder'}]});
 input.detailActions=[{id:'inspect',label:'查看',icon:'action/settings',behavior:'inspect-record'}];
 input.interactions.push({id:'choose-folder',kind:'component-native',triggers:['folder-list'],outcome:'选择分组'},
  {id:'inspect-record',kind:'toggle-hidden',sourceGroup:'content-1',targetGroup:'content-1',targetSelector:'[data-composition-id="info-1"]',stateChange:'展开状态取反',outcome:'可切换记录信息'});
 input.design={regionPurposes:{'main-detail':'显示当前记录'},relationships:[{from:'content-0',to:'content-1',entity:'preference',key:'name'}]};
 fs.writeFileSync(file,JSON.stringify(input));
 const generated=run('page.mjs',['generate','--project',dir]);assert.equal(generated.status,0,generated.stderr);
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name)));
 const layout=read('.text-to-ui/layout-selection.json'),bindings=read('.text-to-ui/compiled/page-bindings.json');
 assert.equal(layout.navigationMode,'two-level');
 assert.equal(layout.titlebarSize,'medium');
 assert.equal(layout.detailTitlebarSize,'medium');
 assert.equal(bindings.componentBindings.find(b=>b.id===layout.detailTitlebar).slots['main-detail-actions'][0].id,'inspect');
 assert.deepEqual(bindings.behaviorPlan.interactions.find(i=>i.id==='inspect-record').triggerBindingIds,[layout.detailTitlebar]);
 const blueprint=read('.text-to-ui/compiled/page-blueprint.json');
 assert.equal(blueprint.regions.find(r=>r.id==='main-detail').purpose,'显示当前记录');
 assert.equal(blueprint.design.relationships[0].key,'name');
 assert.equal(blueprint.interactions.find(i=>i.id==='inspect-record').stateChange,'展开状态取反');
 assert.equal(blueprint.interactions.find(i=>i.id==='inspect-record').taskOutcome,'可切换记录信息');
 input.groups.find(g=>g.id==='content-1').children[0].text='修改后的正文';
 delete input.navigationMode;
 delete input.titlebarSize;
 // Projects generated before layout-selection.json recover from their existing scene.
 fs.unlinkSync(path.join(dir,'.text-to-ui/layout-selection.json'));
 fs.writeFileSync(file,JSON.stringify(input));
 const revised=run('page.mjs',['generate','--project',dir,'--revision']);assert.equal(revised.status,0,revised.stderr);
 assert.deepEqual(read('.text-to-ui/layout-selection.json'),layout);
 assert.match(fs.readFileSync(path.join(dir,'out/records/runtime/app.js'),'utf8'),/修改后的正文/);
 input.titlebarSize='xlarge';
 fs.writeFileSync(file,JSON.stringify(input));
 const rejected=run('page.mjs',['compile','--project',dir,'--revision']);
 assert.match(rejected.stderr,/REVISION_LAYOUT_CHANGE: titlebarSize/);
});

test('scoped search distinguishes the titlebar composition from a missing component',()=>{
 const base=['--pattern','pattern-b-three-pane'];
 const search=run('consumer.mjs',['find','搜索',...base,'--region','secondary-list']);
 assert.equal(search.status,0,search.stderr);assert.match(search.stdout,/^search:/);
 const detail=run('consumer.mjs',['find','归档邮件',...base,'--region','main-detail','--scope','detail-action']);
 assert.equal(detail.status,0,detail.stderr);assert.match(detail.stdout,/main-detail-titlebar → main-detail-actions/);
});

test('consumer accepts zero or two to four primary navigation items per page', t => {
 const dir = temporary(t);
 const file = path.join(dir, 'page-input.json');
 const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples/settings/page-input.json')));
 const description = run('consumer.mjs', ['describe', 'primary-navigation-item', '--context', 'primary-navigation-shell']);
 assert.equal(description.status, 0, description.stderr);
 assert.match(description.stdout, /2–4 个时使用/);
 assert.match(description.stdout, /Pattern槽位: primary-navigation-bottom/);
 for (const count of [0, 1, 2, 3, 4, 5]) {
  const input = structuredClone(base);
  const entries = Array.from({length:count}, (_, index) => ({
   id:'nav-'+index, use:'primary-navigation-item', context:'primary-navigation-shell',
   options:{label:'模块 '+(index+1), icon:'navigation/grid'}, behavior:'navigate',
  }));
  if (count) {
   input.groups.push(
    {id:'nav-a', region:'primary-navigation', purpose:'一级入口', children:entries.slice(0,1)},
    {id:'nav-b', region:'primary-navigation', purpose:'其余一级入口', children:entries.slice(1)},
   );
   input.interactions.push({id:'navigate', kind:'component-native', triggers:entries.map(entry=>entry.id), outcome:'切换模块'});
  }
  fs.writeFileSync(file, JSON.stringify(input));
  const result = run('page.mjs', ['compile', '--project', dir]);
  if (count === 1 || count === 5) {
   assert.equal(result.status, 1);
   assert.match(result.stderr, new RegExp('PRIMARY_NAVIGATION_ITEM_COUNT: found '+count));
  } else {
   assert.equal(result.status, 0, result.stderr);
   const compiled = JSON.parse(fs.readFileSync(path.join(dir,'.text-to-ui/compiled/page-bindings.json')));
   const items = compiled.componentBindings.filter(binding=>binding.logicalName==='Primary Navigation Item/Level 1');
   assert.equal(items.length, count);
   assert.ok(items.every(binding => binding.patternSlot === 'primary-navigation-bottom'));
  }
 }
});

test('every Pattern places first-level entries outside the scroll body without a navigation mode', async t => {
 for (const example of ['settings', 'records', 'workspace', 'inspector']) {
  await t.test(example, async t => {
   const dir = temporary(t);
   const file = path.join(dir, 'page-input.json');
   const input = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', example, 'page-input.json')));
   input.groups.unshift({id:'level-one', region:'primary-navigation', purpose:'切换模块', children:[
    {id:'home', use:'primary-navigation-item', slot:'primary-navigation-shell', options:{label:'主页', icon:'navigation/grid'}, behavior:'navigate'},
    {id:'tools', use:'primary-navigation-item', options:{label:'工具', icon:'action/settings'}, behavior:'navigate'},
   ]});
   input.groups.push({id:'menu-context', region:'primary-navigation', purpose:'导航提示', children:[{id:'menu-hint', text:'导航提示'}]});
   input.interactions.push({id:'navigate', kind:'component-native', triggers:['home','tools'], outcome:'切换模块'});
   fs.writeFileSync(file, JSON.stringify(input));
   const result = run('page.mjs', ['generate', '--project', dir]);
   assert.equal(result.status, 0, result.stderr);
   const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'html-page-manifest.json')));
   assert.equal(manifest.navigationMode, null);
   assert.equal(manifest.registered.find(binding => binding.id === 'home').slot, 'primary-navigation-bottom');
   const {renderGeneratedPage} = await import(pathToFileURL(path.join(dir, 'generated-page.js')).href);
   const nav = renderGeneratedPage().match(/<section[^>]*data-pattern-region="primary-navigation"[^>]*>([\s\S]*?)<\/section>/)?.[1];
   assert.match(nav, /data-pattern-scroll-body>.*data-composition-id="menu-hint".*<\/div><div class="tui-pattern-runtime__slot" data-pattern-slot="primary-navigation-bottom"[^>]+data-pattern-shell-placement="bottom"/);
   assert.equal((nav.match(/data-component="primary-navigation-item"/g) ?? []).length, 2);

   if (example === 'settings') {
    input.groups[0].children[0].slot = 'primary-navigation-footer';
    fs.writeFileSync(file, JSON.stringify(input));
    const conflict = run('page.mjs', ['compile', '--project', dir]);
    assert.match(conflict.stderr, /PATTERN_SLOT_CONFLICT: level-one\/home.*requires primary-navigation-bottom/);
   }
  });
 }
});

test('Sidebar uses a flat list without titles and retains a single labeled disclosure', () => {
 const items=[{label:'收件箱',selected:true},{label:'草稿箱'}];
 const plain=sidebar({items});
 assert.doesNotMatch(plain,/aria-expanded/);
 assert.equal((plain.match(/data-component="sidebar"/g)??[]).length,2);
 const options={groups:[{label:'工作邮箱',expanded:false,items}]};
 const grouped=sidebar(options);
 assert.match(grouped,/data-component="collapsible"[^>]*aria-expanded="false"/);
 assert.match(grouped,/aria-controls="sidebar-group-content-1"/);
 assert.match(grouped,/id="sidebar-group-content-1"[^>]*hidden/);
 assert.match(grouped,/aria-current="page"/);
 assert.equal(sidebarInstanceCount(options),2);
});

test('Block candidates are scoped by workflow, task and resolved Pattern; only a requested Block returns rules', () => {
 const discover = args => run('discover-page.mjs', args);
 const mail = discover(['--task','邮箱']);
 assert.equal(mail.status,0,mail.stderr);
 const summary = JSON.parse(mail.stdout);
 assert.deepEqual(summary.blockCandidates.map(block=>[block.id,block.region]),[
  ['grouped-mail-list','secondary-list'],['collapsible-navigation-group','primary-navigation'],
  ['titlebar-action-overflow','main-detail']
 ]);
 assert.equal(summary.block,undefined);
 assert.equal(summary.blockCandidates[0].rules,undefined);
 for (const task of ['邮箱','设置','文件管理']) {
  const navigation = discover(['--task',task,'--block','collapsible-navigation-group']);
  assert.equal(navigation.status,0,navigation.stderr);
  assert.equal(JSON.parse(navigation.stdout).block.region,'primary-navigation');
 }
 const grouped = discover(['--task','邮箱','--block','grouped-mail-list']);
 assert.equal(grouped.status,0,grouped.stderr);
 assert.equal(JSON.parse(grouped.stdout).block.id,'grouped-mail-list');
 const records = discover(['--task','记录管理','--block','grouped-mail-list']);
 assert.equal(records.status,0,records.stderr);
 assert.equal(JSON.parse(records.stdout).block.title,'分组列表');
 assert.ok(JSON.parse(records.stdout).block.scenarios.some(scene=>scene.id==='status-groups'));
 const titlebar = discover(['--task','记录管理','--block','titlebar-action-overflow']);
 assert.equal(titlebar.status,0,titlebar.stderr);
 assert.ok(JSON.parse(titlebar.stdout).block.rules.some(rule=>rule.includes('detailActions')));
 const wrongPattern = discover(['--task','设置','--block','titlebar-action-overflow']);
 assert.match(wrongPattern.stderr,/BLOCK_NOT_APPLICABLE/);
 for (const id of ['list-toolbar','list-states','mail-reading-header']) {
  const removed = discover(['--task','邮箱','--block',id]);
  assert.equal(removed.status,1);
  assert.match(removed.stderr,/BLOCK_NOT_APPLICABLE/);
 }
 const outside = [
  ['--task','设置'],
  ['--task','邮箱','--pattern','pattern-a-two-pane','--pattern-reason','只浏览内容'],
  ['--task','邮箱','--workflow-route','micro-revision']
 ];
 for (const args of outside) {
  const result = discover(args);
  assert.equal(result.status,0,result.stderr);
  const candidates = JSON.parse(result.stdout).blockCandidates?.map(block=>block.id) ?? [];
  assert.deepEqual(candidates,args.includes('micro-revision') ? [] : ['collapsible-navigation-group']);
  const rejected = discover([...args,'--block','grouped-mail-list']);
  assert.equal(rejected.status,1);
  assert.match(rejected.stderr,/BLOCK_NOT_APPLICABLE/);
 }
});
