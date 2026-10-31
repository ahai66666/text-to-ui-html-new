import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {parse} from '../vendor/acorn.mjs';
const mime={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function exportOffline(project,{title='页面',output='out/页面.html'}={}){
 const root=fs.realpathSync(project),modules=new Map(),cssSeen=new Set(),assets=new Set(),active=new Set();
 const inside=file=>{const real=fs.realpathSync(file);if(!real.startsWith(root+path.sep))throw Error('OFFLINE_PATH_ESCAPE: '+file);return real;};
 const resource=(ref,owner)=>{if(/^(data:|#)/.test(ref))return ref;if(/^(https?:|\/\/|blob:)/.test(ref))throw Error('OFFLINE_EXTERNAL_RESOURCE: '+ref);const match=ref.match(/^([^?#]+)(.*)$/);const file=inside(path.resolve(path.dirname(owner),decodeURIComponent(match[1])));const type=mime[path.extname(file).toLowerCase()];if(!type)throw Error('OFFLINE_RESOURCE_TYPE: '+ref);assets.add(file);return 'data:'+type+';base64,'+fs.readFileSync(file).toString('base64')+(match[2].includes('#')?'#'+match[2].split('#')[1]:'');};
 function css(file){file=inside(file);if(active.has(file))throw Error('CSS_IMPORT_CYCLE: '+file);if(cssSeen.has(file))return '';cssSeen.add(file);active.add(file);let text=fs.readFileSync(file,'utf8');
 text=text.replace(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*([^;]*);/g,(_,ref,condition)=>{if(condition.trim())throw Error('OFFLINE_CONDITIONAL_IMPORT: '+ref);return css(path.resolve(path.dirname(file),ref));});
 if(/@import\b/.test(text.replace(/\/\*[\s\S]*?\*\//g,'')))throw Error('OFFLINE_UNSUPPORTED_CSS_IMPORT: '+file);
 text=text.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g,(_,q,ref)=>'url("'+resource(ref,file)+'")');active.delete(file);return text;
 }
 const names=decl=>{const out=[];const walk=n=>{if(n.type==='Identifier')out.push(n.name);else if(n.type==='ObjectPattern')n.properties.forEach(p=>walk(p.value||p.argument));else if(n.type==='ArrayPattern')n.elements.filter(Boolean).forEach(walk);else if(n.type==='AssignmentPattern')walk(n.left);else if(n.type==='RestElement')walk(n.argument);};for(const d of decl.declarations||[])walk(d.id);if(decl.id)out.push(decl.id.name);return out;};
 function js(file){file=inside(file);if(active.has(file))throw Error('OFFLINE_MODULE_CYCLE: '+file);if(modules.has(file))return modules.get(file).id;const id=modules.size;modules.set(file,{id,code:''});active.add(file);
 const source=fs.readFileSync(file,'utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'}),edits=[],prefix=[],exports=[];
 const dep=ref=>{if(!ref.startsWith('.'))throw Error('OFFLINE_BARE_IMPORT: '+ref);const p=path.resolve(path.dirname(file),ref);if(p.endsWith('.css'))throw Error('CSS must be loaded by styles/index.css');return js(p);};
 const put=(start,end,text)=>edits.push({start,end,text});
 for(const node of ast.body){
 if(node.type==='ImportDeclaration'){
  if(node.source.value.endsWith('.css')){if(file!==path.join(root,'main.js'))throw Error('OFFLINE_CSS_IMPORT_OUTSIDE_ENTRY: '+file);put(node.start,node.end,'');continue;}
  const did=dep(node.source.value);for(const spec of node.specifiers){if(spec.type==='ImportNamespaceSpecifier')prefix.push(`const ${spec.local.name}=__require(${did});`);else prefix.push(`const ${spec.local.name}=__require(${did})[${JSON.stringify(spec.type==='ImportDefaultSpecifier'?'default':spec.imported.name||spec.imported.value)}];`);}if(!node.specifiers.length)prefix.push(`__require(${did});`);put(node.start,node.end,'');
 }else if(node.type==='ExportNamedDeclaration'){
  if(node.declaration){if(['let','var'].includes(node.declaration.kind))throw Error('OFFLINE_MUTABLE_EXPORT: '+file);put(node.start,node.declaration.start,'');for(const name of names(node.declaration))exports.push(`Object.defineProperty(__exports,${JSON.stringify(name)},{enumerable:true,get:()=>${name}});`);}
  else {const did=node.source?dep(node.source.value):null;for(const spec of node.specifiers)exports.push(`Object.defineProperty(__exports,${JSON.stringify(spec.exported.name||spec.exported.value)},{enumerable:true,get:()=>${did===null?spec.local.name:`__require(${did})[${JSON.stringify(spec.local.name||spec.local.value)}]`}});`);put(node.start,node.end,'');}
 }else if(node.type==='ExportDefaultDeclaration'){
  const decl=node.declaration;if((decl.type==='FunctionDeclaration'||decl.type==='ClassDeclaration')&&decl.id){put(node.start,decl.start,'');exports.push(`__exports.default=${decl.id.name};`);}else {put(node.start,decl.start,'const __default=');exports.push('__exports.default=__default;');}
 }else if(node.type==='ExportAllDeclaration'){const did=dep(node.source.value);exports.push(`for(const k of Object.keys(__require(${did})))if(k!=='default')Object.defineProperty(__exports,k,{enumerable:true,get:()=>__require(${did})[k]});`);put(node.start,node.end,'');}
 }
 function walk(node,parent=null){if(!node||typeof node!=='object')return;
 if(node.type==='ImportExpression'||node.type==='MetaProperty'||node.type==='AwaitExpression'&&node===ast.body[0])throw Error('OFFLINE_UNSUPPORTED_MODULE_FEATURE: '+file);
 if((node.type==='CallExpression'||node.type==='NewExpression')&&((node.callee.type==='Identifier'&&['fetch','XMLHttpRequest','importScripts','Worker','SharedWorker'].includes(node.callee.name))||(node.callee.type==='MemberExpression'&&['fetch','XMLHttpRequest','importScripts'].includes(node.callee.property.name))))throw Error('OFFLINE_RUNTIME_RESOURCE_LOAD: '+file);
 if(node.type==='Literal'&&typeof node.value==='string'&&/<(?:img|source|script|link)\b/i.test(node.value)&&/\b(?:src|href)\s*=/i.test(node.value)&&!edits.some(e=>node.start>=e.start&&node.end<=e.end)){const value=node.value.replace(/(\b(?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,(_,a,ref,b)=>a+resource(ref,file)+b);if(value!==node.value)put(node.start,node.end,JSON.stringify(value));}
 if(node.type==='TemplateElement'&&/<(?:img|source|script|link)\b/i.test(node.value.raw)){const raw=node.value.raw;const updated=raw.replace(/(\b(?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,(_,a,ref,b)=>a+resource(ref,file)+b);if(updated!==raw)put(node.start,node.end,updated);}
 if(node.type==='Literal'&&parent?.type==='Property'&&/^(?:src|logoSrc|image|imageUrl|iconUrl|avatarUrl|thumbnail|poster)$/.test(parent.key.name||parent.key.value)&&typeof node.value==='string'&&/\.(png|jpe?g|webp|gif|svg|woff2?|ttf)(?:[?#].*)?$/i.test(node.value)&&!edits.some(e=>node.start>=e.start&&node.end<=e.end))put(node.start,node.end,JSON.stringify(resource(node.value,file)));
 for(const [k,v]of Object.entries(node)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(child=>walk(child,node));else if(v&&typeof v==='object')walk(v,node);}}
 walk(ast);edits.sort((a,b)=>b.start-a.start);let text=source;for(const e of edits)text=text.slice(0,e.start)+e.text+text.slice(e.end);
 modules.get(file).code=prefix.join('\n')+'\n'+text+'\n'+exports.join('\n');active.delete(file);return id;
 }
 const entry=js(path.join(root,'main.js')),style=css(path.join(root,'styles/index.css'));
 const runtime=`(()=>{'use strict';const __modules={${[...modules.values()].map(m=>`${m.id}:(__exports,__require)=>{\n${m.code}\n}`).join(',\n')}};const __cache={};function __require(id){if(__cache[id])return __cache[id];const exports=__cache[id]={};__modules[id](exports,__require);return exports;}__require(${entry});})();`;
 // Parse the final classic script as a syntax check before committing the artifact.
 parse(runtime,{ecmaVersion:'latest',sourceType:'script'});
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="text-to-ui-skill" content="text-to-ui-html-new@0.1.0"><title>${esc(title)}</title><style>${style.replace(/<\/style/gi,'<\\/style')}</style></head><body><div id="app"></div><script>${runtime.replace(/<\/script/gi,'<\\/script')}</script></body></html>\n`;
 const out=path.resolve(root,output);if(!out.startsWith(root+path.sep)||!out.endsWith('.html')||out===path.join(root,'index.html'))throw Error('OFFLINE_OUTPUT must be a separate project HTML artifact');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.tmp',html);fs.renameSync(out+'.tmp',out);
 const report={schemaVersion:1,skill:'text-to-ui-html-new',version:'0.1.0',output:path.relative(root,out),sha256:digest(html),bytes:Buffer.byteLength(html),modules:modules.size,stylesheets:cssSeen.size,assets:assets.size,format:'classic-script',requiresServer:false};fs.writeFileSync(out+'.json',JSON.stringify(report,null,2)+'\n');return report;
}
