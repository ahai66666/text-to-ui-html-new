#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {parse} from '../vendor/acorn.mjs';import {ROOT,read} from './consumer-lib.mjs';
const args=process.argv.slice(2),i=args.indexOf('--out-dir'),out=path.resolve(i<0?path.join(ROOT,'outputs'):args[i+1]);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function files(dir,rel=''){return fs.readdirSync(path.join(dir,rel),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?files(dir,path.join(rel,e.name)):e.isFile()?[path.join(rel,e.name).replaceAll(path.sep,'/')]:[]);}
function copy(file,target){fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,file),target);}
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'tui-new-pack-'));fs.mkdirSync(out,{recursive:true});
try{
 const root=path.join(stage,'text-to-ui-html-new');fs.mkdirSync(root);
 const selected=new Set(['README.md','SKILL.md','LICENSE','package.json','skill-profile.json','pnpm-workspace.yaml','shared-data-lock.json','agents/openai.yaml','vendor/acorn.mjs','vendor/ACORN-LICENSE','consumer/catalog.json']);
 // Runtime assets, contracts, normative resources and existing source checks are explicit entry families.
 for(const file of files(ROOT))if(['schemas/','assets/','packages/tokens/','packages/component-contracts/','packages/component-styles/','packages/pattern-runtime/','references/'].some(p=>file.startsWith(p)))selected.add(file);
 const denied=new Set(['preview-components.mjs','skill-distribution.mjs','pack-consumer.mjs','build-consumer.mjs','register-approved-page-reference.mjs','audit-icons.mjs']);
 for(const file of files(path.join(ROOT,'scripts')))if(!denied.has(path.basename(file)))selected.add('scripts/'+file);
 // Keep all 49 implementation roots, then close static JS and CSS imports. Exclude gallery/legacy registries.
 function dependency(file){if(selected.has(file))return;selected.add(file);const full=path.join(ROOT,file);if(!fs.existsSync(full))throw Error('Missing dependency '+file);const text=fs.readFileSync(full,'utf8');
 for(const m of text.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|@import\s+(?:url\(\s*)?["']([^"']+)["']/g)){const spec=m[1]||m[2]||m[3];if(spec.startsWith('.'))dependency(path.posix.normalize(path.posix.join(path.posix.dirname(file),spec)));}}
 for(const c of read(path.join(ROOT,'consumer/catalog.json')).components){const contract=read(path.join(ROOT,'packages/component-contracts/src/components',c.id+'.json'));dependency(contract.implementations.html.split('#')[0]);}
 for(const file of ['runtime.js','color-references/index.js','shared/disclosure-behavior.js','shared/sidebar-behavior.js','input/behavior.js','titlebar-overflow.js','styles.css','pattern-shell.css'])dependency('packages/components-html/src/'+file);
 // Full query provenance is loaded only on request. Keep coverage machine-side for that command.
 selected.add('consumer/coverage.json');
 const visitedScripts=new Set();
 function scriptDependencies(file){if(visitedScripts.has(file))return;visitedScripts.add(file);const tree=parse(fs.readFileSync(path.join(ROOT,file),'utf8'),{ecmaVersion:'latest',sourceType:'module'});for(const node of tree.body)if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(node.type)&&node.source?.value.startsWith('.')){const dep=path.posix.normalize(path.posix.join(path.posix.dirname(file),node.source.value));selected.add(dep);scriptDependencies(dep);}}
 for(const file of [...selected])if(file.startsWith('scripts/'))scriptDependencies(file);
 // Design/token maps copied into two trees in the source snapshot are not both runtime authorities.
 for(const file of [...selected])if(file.startsWith('assets/design-system/')){const other='packages/tokens/src/'+path.posix.basename(file);if(selected.has(other)&&fs.existsSync(path.join(ROOT,other))&&sha(fs.readFileSync(path.join(ROOT,file)))===sha(fs.readFileSync(path.join(ROOT,other))))selected.delete(file);}
 for(const file of ['packages/tokens/src/dual-output-token-map.json','packages/tokens/src/token-utility-map.json'])selected.delete(file);

 for(const file of selected)if(fs.existsSync(path.join(ROOT,file)))copy(file,path.join(root,file));else throw Error('Missing allowlisted file '+file);
 for(const file of files(root))if(file.endsWith('.json')&&!file.startsWith('references/index/generated/'))fs.writeFileSync(path.join(root,file),JSON.stringify(read(path.join(root,file))));
 copy('scripts/build-consumer.mjs',path.join(root,'scripts/build-consumer.mjs'));
 const rebuildConsumer=spawnSync(process.execPath,[path.join(root,'scripts/build-consumer.mjs')],{cwd:root,encoding:'utf8'});if(rebuildConsumer.status!==0)throw Error(rebuildConsumer.stderr);fs.rmSync(path.join(root,'scripts/build-consumer.mjs'));
 const compatibility=read(path.join(root,'references/components/compatibility-modules.json'));compatibility.modules=[];fs.writeFileSync(path.join(root,'references/components/compatibility-modules.json'),JSON.stringify(compatibility,null,2)+'\n');
 const pkg=read(path.join(root,'package.json'));pkg.scripts=Object.fromEntries(Object.entries(pkg.scripts).filter(([k])=>['page:plan','consumer:query','page:compile','page:generate','page:validate','page:handoff','preview'].includes(k)));delete pkg.dependencies;fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const profile=read(path.join(root,'skill-profile.json'));profile.distribution='consumer';fs.writeFileSync(path.join(root,'skill-profile.json'),JSON.stringify(profile,null,2)+'\n');
 for(const script of ['build-resource-index.mjs','build-skill-catalog-index.mjs','build-navigation-index.mjs']){const cp=spawnSync(process.execPath,[path.join(root,'scripts',script),'--repo',root,'--skill-root',root],{cwd:root,encoding:'utf8'});if(cp.status!==0)throw Error(cp.stderr||cp.stdout);}
 fs.rmSync(path.join(root,'references/index/generated/skill-catalog-index.json'),{force:true});
 const report=[];
 function archive(name,dir){const list=files(dir),manifest={schemaVersion:1,name,version:'0.1.1',files:Object.fromEntries(list.map(f=>[f,sha(fs.readFileSync(path.join(dir,f)))]))};fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));const zip=path.join(out,name+'-0.1.1.zip');if(fs.existsSync(zip))fs.rmSync(zip);const py='import os,sys,zipfile\nroot,out=sys.argv[1:]\nwith zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED) as z:\n for d,ds,fs in os.walk(root):\n  ds.sort()\n  for f in sorted(fs):\n   p=os.path.join(d,f); info=zipfile.ZipInfo(os.path.join(os.path.basename(root),os.path.relpath(p,root)),(2026,10,31,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,open(p,"rb").read())';const cp=spawnSync('python3',['-c',py,dir,zip],{encoding:'utf8'});if(cp.status!==0)throw Error(cp.stderr);const item={name,files:list.length+1,bytes:list.reduce((n,f)=>n+fs.statSync(path.join(dir,f)).size,0)+fs.statSync(path.join(dir,'manifest.json')).size,zipBytes:fs.statSync(zip).size,sha256:sha(fs.readFileSync(zip))};fs.writeFileSync(zip+'.sha256',item.sha256+'  '+path.basename(zip)+'\n');report.push(item);}
 archive('text-to-ui-html-new',root);
 const preview=path.join(stage,'text-to-ui-html-new-preview');fs.mkdirSync(preview);for(const file of files(ROOT))if(file.startsWith('apps/')||file==='scripts/preview-components.mjs'||file.startsWith('packages/components-html/')&&!selected.has(file))copy(file,path.join(preview,file));fs.writeFileSync(path.join(preview,'README.md'),'Optional preview overlay for text-to-ui-html-new 0.1.1. Copy this directory contents into the consumer skill, then run node scripts/preview-components.mjs. Page output does not need a server; the optional gallery does.\n');archive('text-to-ui-html-new-preview',preview);
 const examples=path.join(stage,'text-to-ui-html-new-examples');fs.mkdirSync(examples);for(const file of files(path.join(ROOT,'examples')))if(file.endsWith('page-input.json')||file.includes('/out/'))copy('examples/'+file,path.join(examples,file));archive('text-to-ui-html-new-examples',examples);
 fs.writeFileSync(path.join(out,'package-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:true,packages:report},null,2));
}finally{fs.rmSync(stage,{recursive:true,force:true});}
