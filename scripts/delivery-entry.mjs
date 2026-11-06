import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function local(root,relative){if(typeof relative!=='string'||path.isAbsolute(relative))throw Error('DELIVERY_PATH_ESCAPE');const f=path.resolve(root,relative);if(!f.startsWith(root+path.sep))throw Error('DELIVERY_PATH_ESCAPE');let p=f;while(p!==root){if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())throw Error('DELIVERY_SYMLINK');p=path.dirname(p);}return f;}
export function competingHtml(project){return fs.readdirSync(project,{withFileTypes:true}).filter(e=>e.isFile()&&/\.html?$/i.test(e.name)&&e.name!=='index.html').map(e=>e.name);}
export function assertSingleEntry(project){const files=competingHtml(project);if(files.length)throw Error('UNMANAGED_HTML: '+files.join(', ')+'; migrate business logic into a declared module. Preserve reference pages under .text-to-ui/reference-pages/; do not delete user work.');}
export function markDelivery(project,status,report=null,message=null){
 project=fs.realpathSync(project);const file=local(project,'.text-to-ui/delivery.json');fs.mkdirSync(path.dirname(file),{recursive:true});const old=fs.existsSync(file)?read(file):{};
 const result={schemaVersion:1,skill:'text-to-ui-html-new',status,...(old.primary?{primary:old.primary}:{})};
 if(report){
  const sources={};for(const [name,entry] of Object.entries(report.files||{})){if(!name.startsWith('src/')||name==='src/package.json')continue;const rel=name.slice(4),f=local(project,rel);if(fs.existsSync(f))sources[rel]=hash(fs.readFileSync(f));}
  for(const name of ['page-input.json']){const f=local(project,name);if(fs.existsSync(f))sources[name]=hash(fs.readFileSync(f));}
  result.primary={entry:report.output,distribution:report.distribution,files:report.files||{[path.basename(report.output)]:{sha256:report.sha256}},sourceDigests:sources};
 }
 if(message)result.error=String(message).slice(0,1000);
 const temp=local(project,'.text-to-ui/delivery-'+crypto.randomBytes(8).toString('hex')+'.tmp');try{fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});fs.renameSync(temp,file);}finally{fs.rmSync(temp,{force:true});}
 return result;
}
export function inspectDelivery(project){
 project=fs.realpathSync(project);const file=local(project,'.text-to-ui/delivery.json'),unmanagedHtml=competingHtml(project);
 if(!fs.existsSync(file))return {status:'not-registered',unmanagedHtml,next:'Generate or export once to register the official preview entry.'};
 const saved=read(file),changed=[];
 if(saved.primary){for(const [name,entry]of Object.entries(saved.primary.files)){const rel=path.posix.join(path.posix.dirname(saved.primary.entry),name),f=local(project,rel);if(!fs.existsSync(f)||hash(fs.readFileSync(f))!==entry.sha256)changed.push(rel);}
 for(const [rel,digest]of Object.entries(saved.primary.sourceDigests)){const f=local(project,rel);if(!fs.existsSync(f)||hash(fs.readFileSync(f))!==digest)changed.push(rel);}}
 return {status:saved.status==='ready'&&(changed.length||unmanagedHtml.length)?'stale':saved.status,primaryEntry:saved.primary?.entry||null,distribution:saved.primary?.distribution||null,changed,unmanagedHtml,...(saved.error?{error:saved.error}:{})};
}
