import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {workPlan} from '../scripts/work-plan.mjs';
import {markDelivery} from '../scripts/delivery-entry.mjs';
function fixture(t){const project=fs.mkdtempSync(path.join(os.tmpdir(),'tui-plan-'));t.after(()=>fs.rmSync(project,{recursive:true,force:true}));workPlan('init',{project,modules:['list','detail']});const file=path.join(project,'.text-to-ui/work-plan.json');const plan=JSON.parse(fs.readFileSync(file));plan.goal='搜索并查看记录';plan.decisions={taskRoute:'record-management-workbench',pattern:'pattern-b-three-pane',sharedData:[{name:'selectedId',writes:'list',reads:'detail',type:'string|null'}],behaviorBoundaries:['本地原型']};for(const step of plan.steps)step.doneWhen=['完成所声明范围'];const save=()=>fs.writeFileSync(file,JSON.stringify(plan));save();return {project,plan,save};}
function firstTwo(project){workPlan('complete',{project,step:'requirements',note:'需求范围明确'});workPlan('complete',{project,step:'structure',note:'共享 ID 约定与 Pattern 已确定'});}
function artifact(project) {
 const output='out/preview.html',html='<html>preview</html>';
 fs.mkdirSync(path.join(project,'out'),{recursive:true});
 fs.writeFileSync(path.join(project,output),html);
 const report={skill:'text-to-ui-html-new',output,requiresServer:false,sha256:crypto.createHash('sha256').update(html).digest('hex')};
 const file='.text-to-ui/offline-preview.json';
 fs.writeFileSync(path.join(project,file),JSON.stringify(report));
 markDelivery(project,'ready',report);
 return file;
}
test('plans persist across invocations; out-of-order completion is refused',t=>{const {project}=fixture(t);assert.throws(()=>workPlan('init',{project}),/exists/);assert.throws(()=>workPlan('complete',{project,step:'structure',note:'skip'}),/current step/);firstTwo(project);assert.equal(workPlan('resume',{project}).current.id,'minimal-page');assert.equal(workPlan('status',{project}).progress.filter(s=>s.status==='done').length,2);});
test('required gaps block progress; preview completion checks actual artifact bytes',t=>{const {project,plan,save}=fixture(t);plan.unresolved=['缺少列表字段'];save();assert.throws(()=>workPlan('complete',{project,step:'requirements',note:'done'}),/Resolve/);plan.unresolved=[];save();firstTwo(project);assert.throws(()=>workPlan('complete',{project,step:'minimal-page',note:'done'}),/artifact/);const file=artifact(project);fs.writeFileSync(path.join(project,'out/preview.html'),'changed');assert.throws(()=>workPlan('complete',{project,step:'minimal-page',note:'done',artifact:file}),/does not match/);artifact(project);workPlan('complete',{project,step:'minimal-page',note:'打开并操作主要路径',artifact:file});assert.equal(workPlan('resume',{project}).current.id,'module-list');});
test('plan cannot complete from a stale official preview even when its entry still matches',t=>{
 const {project}=fixture(t);
 firstTwo(project);
 const input=path.join(project,'page-input.json');
 fs.writeFileSync(input,'{"title":"First"}');
 const file=artifact(project);
 fs.writeFileSync(input,'{"title":"Revised"}');
 assert.throws(()=>workPlan('complete',{project,step:'minimal-page',note:'旧入口',artifact:file}),/OFFLINE_ARTIFACT_STALE/);
 assert.equal(workPlan('resume',{project}).current.id,'minimal-page');
});
test('new-session packets include fresh interfaces and only selected page groups',t=>{const {project,plan,save}=fixture(t);plan.steps[0].read=[{path:'page-input.json',groups:['list']}];plan.steps[0].interfaces=[{id:'button',context:'page-primary-action'}];save();fs.writeFileSync(path.join(project,'page-input.json'),JSON.stringify({title:'记录',groups:[{id:'list',children:[{id:'search'}]},{id:'detail',children:[{id:'private',text:'UNRELATED_DETAIL_BODY'}]}],interactions:[{id:'filter',triggers:['search']},{id:'private',triggers:['private']}]}));const packet=workPlan('resume',{project});assert.match(packet.interfaces[0],/page-primary-action/);assert.equal(packet.inputSlices[0].groups.length,1);assert.equal(packet.inputSlices[0].interactions.length,1);assert.doesNotMatch(JSON.stringify(packet),/UNRELATED_DETAIL_BODY/);assert.throws(()=>workPlan('resume',{project,maxBytes:100}),/TOO_LARGE/);});
test('changed shared decisions require reopening structure and invalidate later statuses',t=>{const {project}=fixture(t);firstTwo(project);const file=path.join(project,'.text-to-ui/work-plan.json'),p=JSON.parse(fs.readFileSync(file));p.decisions.pattern='pattern-a-two-pane';fs.writeFileSync(file,JSON.stringify(p));assert.throws(()=>workPlan('resume',{project}),/DECISIONS_CHANGED/);workPlan('reopen',{project,step:'structure',note:'用户调整布局'});const r=workPlan('resume',{project});assert.equal(r.current.id,'structure');assert.equal(r.progress[0].status,'done');assert.ok(r.progress.slice(1).every(s=>s.status==='pending'));});
test('plan references cannot escape the project through paths or symlinks',t=>{const {project,plan,save}=fixture(t);plan.steps[0].read=[{path:'../secret'}];save();assert.throws(()=>workPlan('resume',{project}),/escapes/);plan.steps[0].read=[{path:'link/file'}];save();fs.symlinkSync(os.tmpdir(),path.join(project,'link'));assert.throws(()=>workPlan('resume',{project}),/symlinks/);});
