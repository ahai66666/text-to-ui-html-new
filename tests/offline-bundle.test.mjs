import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT} from '../scripts/consumer-lib.mjs';
import {exportOffline} from '../scripts/offline.mjs';

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'tui-multifile-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'styles'));
 fs.writeFileSync(path.join(root,'styles/index.css'),'body{margin:0}');
 fs.writeFileSync(path.join(root,'value.js'),'export const value=42;');
 fs.writeFileSync(path.join(root,'main.js'),'import "./styles/index.css"; import {value} from "./value.js";globalThis.answer=value;');
 return root;
}
function run(root,report){
 const html=fs.readFileSync(path.join(root,report.output),'utf8');
 const script=html.match(/<script defer src="([^"]+)"/)[1];
 const context={};
 vm.runInNewContext(fs.readFileSync(path.resolve(root,path.dirname(report.output),script),'utf8'),context);
 return {html,context};
}
test('multi-file is portable, external and deterministic; source can be re-exported',t=>{
 const root=fixture(t),report=exportOffline(root),{html,context}=run(root,report);
 assert.equal(report.distribution,'multi-file');assert.equal(report.requiresServer,false);
 assert.equal(context.answer,42);assert.match(html,/<link rel="stylesheet" href=".\/styles\/app.css"/);
 assert.doesNotMatch(html,/<style|type="module"|<script>/);
 assert(fs.existsSync(path.join(root,'out/preview/src/value.js')));
 assert.equal(exportOffline(root).bundleSha256,report.bundleSha256);
 const second=exportOffline(path.join(root,'out/preview/src'));
 assert.equal(run(path.join(root,'out/preview/src'),second).context.answer,42);
});
test('CSS and HTML resource paths stay valid after moving the complete folder',t=>{
 const root=fixture(t);
 fs.mkdirSync(path.join(root,'images'));fs.writeFileSync(path.join(root,'images/icon.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
 fs.writeFileSync(path.join(root,'styles/index.css'),'body{background:url("../images/icon.svg#shape")}');
 fs.writeFileSync(path.join(root,'main.js'),'globalThis.image={src:"./images/icon.svg"};');
 const report=exportOffline(root),moved=path.join(root,'renamed folder 中文');
 fs.cpSync(path.join(root,'out/preview'),moved,{recursive:true});
 const {context}=run(moved,{output:'index.html'});
 assert(fs.existsSync(path.resolve(moved,context.image.src)));
 const css=fs.readFileSync(path.join(moved,'styles/app.css'),'utf8');
 const ref=css.match(/url\("([^"]+)"\)/)[1];
 assert(ref.endsWith('#shape'));assert(fs.existsSync(path.resolve(moved,'styles',ref.split('#')[0])));
 assert.equal(report.assets,1);assert.equal(fs.readdirSync(path.join(moved,'assets')).length,1);
 assert.doesNotMatch(css,/data:image/);
});
test('unsupported code preserves a previous good preview; unrelated folders are not replaced',t=>{
 const root=fixture(t),report=exportOffline(root),entry=path.join(root,report.output),previous=fs.readFileSync(entry,'utf8');
 fs.writeFileSync(path.join(root,'main.js'),'fetch("./data.json")');
 assert.throws(()=>exportOffline(root),/RUNTIME_RESOURCE_LOAD/);assert.equal(fs.readFileSync(entry,'utf8'),previous);
 fs.writeFileSync(path.join(root,'main.js'),'globalThis.answer=1');
 fs.mkdirSync(path.join(root,'unrelated'));fs.writeFileSync(path.join(root,'unrelated/index.html'),'user file');
 assert.throws(()=>exportOffline(root,{output:'unrelated/index.html'}),/OUTPUT_NOT_OWNED/);
 assert.equal(fs.readFileSync(path.join(root,'unrelated/index.html'),'utf8'),'user file');
});
test('output symlinks cannot escape the project',t=>{
 const root=fixture(t),outside=fs.mkdtempSync(path.join(os.tmpdir(),'tui-outside-'));
 t.after(()=>fs.rmSync(outside,{recursive:true,force:true}));
 fs.symlinkSync(outside,path.join(root,'linked'),'dir');
 assert.throws(()=>exportOffline(root,{output:'linked/index.html'}),/OUTPUT_ESCAPE/);
 assert.deepEqual(fs.readdirSync(outside),[]);
});

test('CLI generates all four Patterns without Vite and retains the single-file option',async t=>{
 for(const name of ['settings','records','workspace','inspector']){
  const root=fixture(t);
  fs.rmSync(path.join(root,'main.js'));fs.rmSync(path.join(root,'value.js'));fs.rmSync(path.join(root,'styles'),{recursive:true});
  fs.copyFileSync(path.join(ROOT,'examples',name,'page-input.json'),path.join(root,'page-input.json'));
  const cp=spawnSync(process.execPath,[path.join(ROOT,'scripts/page.mjs'),'generate','--project',root],{encoding:'utf8',maxBuffer:20*1024*1024});
  assert.equal(cp.status,0,cp.stderr||cp.stdout);
  const report=JSON.parse(cp.stdout.trim());
  assert.equal(report.output,'out/'+name+'/index.html');assert.equal(report.distribution,'multi-file');
  assert(!fs.existsSync(path.join(root,'vite.config.mjs')));
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert(!Object.values(pkg.scripts).some(x=>x.includes('vite')));
  const pageModule=await import(pathToFileURL(path.join(root,'generated-page.js')).href);
  assert.match(pageModule.renderGeneratedPage(),/data-tui-pattern=/);
  const html=fs.readFileSync(path.join(root,report.output),'utf8');
  assert.doesNotMatch(html,/type="module"/);
  new vm.Script(fs.readFileSync(path.join(root,path.dirname(report.output),'runtime/app.js'),'utf8'));
  if(name==='settings'){
   const source=path.join(root,path.dirname(report.output),'src');
   const rebuilt=spawnSync(process.execPath,[path.join(ROOT,'scripts/page.mjs'),'generate','--project',source],{encoding:'utf8',maxBuffer:20*1024*1024});
   assert.equal(rebuilt.status,0,rebuilt.stderr);
   const single=spawnSync(process.execPath,[path.join(ROOT,'scripts/page.mjs'),'export','--project',root,'--format','single-file'],{encoding:'utf8'});
   assert.equal(single.status,0,single.stderr);
   assert(fs.existsSync(path.join(root,'out/settings.html')));
  }
 }
});
