#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {inspectDelivery} from './delivery-entry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
export function workPlan(command,{project,modules=[],step,note,artifact,maxBytes=16000}={}){
 if(!project)throw Error('Provide --project');project=fs.realpathSync(project);
 function local(relative){if(typeof relative!=='string'||path.isAbsolute(relative))throw Error('Project paths must be relative');const full=path.resolve(project,relative);if(!full.startsWith(project+path.sep))throw Error('Path escapes project');let p=full;while(p!==project){if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())throw Error('Plan path cannot contain symlinks');p=path.dirname(p);}return full;}
 const file=local('.text-to-ui/work-plan.json');
 function save(value){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
 if(command==='init'){
  if(fs.existsSync(file))throw Error('Plan exists; use resume');
  if(new Set(modules).size!==modules.length||modules.some(id=>!/^\w[\w-]*$/.test(id)))throw Error('Module IDs must be unique simple identifiers');
  const stage=(id,goal)=>({id,goal,status:'pending',read:[],write:[],interfaces:[],doneWhen:[],note:''});
  const plan={schemaVersion:1,goal:'',decisions:{taskRoute:'',pattern:'',sharedData:[],behaviorBoundaries:[]},unresolved:[],steps:[stage('requirements','明确任务、用户内容、主要操作与必要缺口'),stage('structure','确定 Task/Pattern、模块边界及跨模块数据与事件约定'),stage('minimal-page','生成真实骨架并打开离线入口，跑通一条主要交互'),...modules.map(id=>stage('module-'+id,'完成业务模块 '+id+' 的输入、生成和必要修正')),stage('integration','串联跨模块数据、导航和主要操作，记录剩余问题')]};
  save(plan);return {ok:true,plan:'.text-to-ui/work-plan.json',next:'Fill goal, confirmed decisions, scoped read/write paths, interfaces and doneWhen before completing steps.'};
 }
 if(!fs.existsSync(file))throw Error('No plan; init first');
 const plan=JSON.parse(fs.readFileSync(file,'utf8'));
 if(plan.schemaVersion!==1||!Array.isArray(plan.steps)||!plan.steps.length||new Set(plan.steps.map(s=>s.id)).size!==plan.steps.length)throw Error('Invalid plan');
 for(const s of plan.steps){if(!['pending','done'].includes(s.status))throw Error('Invalid status: '+s.id);for(const r of s.read||[])local(r.path);for(const w of s.write||[])local(w);}
 const current=plan.steps.find(s=>s.status!=='done');
 const decisionsHash=hash(JSON.stringify(plan.decisions));
 const structure=plan.steps.find(s=>s.id==='structure');
 if(command==='reopen'){
  const index=plan.steps.findIndex(s=>s.id===step);if(index<0||!note?.trim())throw Error('reopen requires --step and --note');
  for(const s of plan.steps.slice(index)){s.status='pending';delete s.artifact;delete s.decisionsHash;s.note='';}plan.steps[index].note=note;save(plan);return {ok:true,reopened:step};
 }
 if(structure?.status==='done'&&structure.decisionsHash!==decisionsHash)throw Error('DECISIONS_CHANGED: reopen structure and reconcile downstream work before continuing');
 if(command==='complete'){
  if(!current||current.id!==step)throw Error('Complete only the current step: '+(current?.id||'none'));
  if(!plan.goal?.trim()||!note?.trim()||note.length>600||!current.doneWhen?.length)throw Error('Fill goal, doneWhen and a concise observed result (--note, max 600 chars)');
  if(step==='structure'&&(!plan.decisions?.taskRoute||!plan.decisions?.pattern||!Array.isArray(plan.decisions.sharedData)||!Array.isArray(plan.decisions.behaviorBoundaries)))throw Error('Confirm Task, Pattern and shared data/behavior contracts');
  if(step==='requirements'&&plan.unresolved?.length)throw Error('Resolve required information or explicitly record agreed scope before implementation');
  if(step==='minimal-page'||step==='integration'||step.startsWith('module-')){
   if(!artifact)throw Error('Provide --artifact pointing to the current offline-preview.json');
   const artifactPath=local(artifact);
   const reportBytes=fs.readFileSync(artifactPath);
   const report=JSON.parse(reportBytes),entry=local(report.output);
   if(report.skill!=='text-to-ui-html-new'||report.requiresServer!==false||!report.sha256||hash(fs.readFileSync(entry))!==report.sha256)throw Error('Offline artifact does not match its report');
   const delivery=inspectDelivery(project);
   const currentReport=local('.text-to-ui/offline-preview.json');
   if(delivery.status!=='ready'||delivery.primaryEntry!==report.output||!fs.existsSync(currentReport)||!reportBytes.equals(fs.readFileSync(currentReport))){
    throw Error('OFFLINE_ARTIFACT_STALE: generate and verify the current official preview before completing the step');
   }
   current.artifact={path:artifact,sha256:hash(reportBytes)};
  }
  current.status='done';current.note=note;if(step==='structure')current.decisionsHash=decisionsHash;save(plan);
  return {ok:true,completed:step,next:plan.steps.find(s=>s.status!=='done')?.id||null};
 }
 if(command!=='resume'&&command!=='status')throw Error('Use init|status|resume|complete|reopen');
 const result={goal:plan.goal,decisions:plan.decisions,unresolved:plan.unresolved,progress:plan.steps.map(s=>({id:s.id,status:s.status,note:s.note})),current:current||null};
 if(command==='resume'&&current){
  const snippets=[];
  for(const r of current.read||[])if(r.groups){
   if(r.path!=='page-input.json'||!Array.isArray(r.groups)||!r.groups.length)throw Error('Group selection requires page-input.json and nonempty groups');
   const input=JSON.parse(fs.readFileSync(local(r.path),'utf8'));const groups=input.groups.filter(g=>r.groups.includes(g.id));if(groups.length!==new Set(r.groups).size)throw Error('Unknown group in current read scope');
   const ids=new Set();const walk=ns=>{for(const n of ns||[]){if(n.id)ids.add(n.id);walk(n.children);}};groups.forEach(g=>walk(g.children));
   snippets.push({path:r.path,title:input.title,task:input.task,pattern:input.pattern,groups,interactions:(input.interactions||[]).filter(i=>(i.triggers||[]).some(id=>ids.has(id)))});
  }
  result.inputSlices=snippets;result.interfaces=[];
  const seen=new Set();for(const q of current.interfaces||[]){if(!/^[a-z0-9][a-z0-9-]*$/.test(q.id||'')||(q.context&&!/^[a-z0-9][a-z0-9-]*$/.test(q.context)))throw Error('Interface needs an exact id/capability and valid context');const key=JSON.stringify(q);if(seen.has(key))continue;seen.add(key);const cp=spawnSync(process.execPath,[path.join(root,'scripts/consumer.mjs'),'describe',q.id,...(q.context?['--context',q.context]:[])],{encoding:'utf8',maxBuffer:1024*1024});if(cp.status!==0)throw Error(cp.stderr||cp.stdout);result.interfaces.push(cp.stdout.trim());}
  result.instructions='Read only current scoped files/sections; interfaces above are freshly loaded, not a cache-hit claim. Edit current.write only. Generate and open the preview before recording observed completion. Do not read compiled files, whole output bundles or full logs by default.';
 }
 const text=JSON.stringify(result,null,2);if(Buffer.byteLength(text)>maxBytes)throw Error('RESUME_TOO_LARGE: split the current module or narrow read groups/interfaces; nothing was truncated');return result;
}
if(process.argv[1]&&fs.realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),command=args.shift(),values={};while(args.length){const k=args.shift();if(!['--project','--modules','--step','--note','--artifact'].includes(k)||!args.length)throw Error('Unknown or incomplete argument '+k);values[k.slice(2)]=args.shift();}if(values.modules)values.modules=values.modules.split(',').filter(Boolean);console.log(JSON.stringify(workPlan(command,values),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
