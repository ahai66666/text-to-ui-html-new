#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function initBusinessModule({project,group,name,reason,query}) {
 project=fs.realpathSync(project);
 const safe=relative=>{const file=path.resolve(project,relative);if(!file.startsWith(project+path.sep))throw Error('MODULE_PATH_ESCAPE');let p=file;while(p!==project){if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())throw Error('MODULE_SYMLINK');p=path.dirname(p);}return file;};
 const file=safe('page-input.json'),original=fs.readFileSync(file,'utf8'),input=JSON.parse(original);
 if(!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(group||'')||!/^[a-z][a-z0-9-]*$/.test(name||'')||!reason?.trim()||!query?.trim())throw Error('Provide --name, --reason and --query');
 const groups=input.groups?.filter(g=>g.id===group)||[];if(groups.length!==1)throw Error('Choose exactly one existing group');
 const target=groups[0];if(target.region==='primary-navigation')throw Error('MODULE_PATTERN_OWNED: choose a business content group, not the navigation shell');if(target.module)throw Error('MODULE_EXISTS: edit the declared module');
 const dir=safe('page-components/'+name);if(fs.existsSync(dir))throw Error('Preserve existing module directory');
 const found=spawnSync(process.execPath,[path.join(root,'scripts/consumer.mjs'),'find',query],{encoding:'utf8'});if(found.status!==0)throw Error(found.stderr);
 const source='page-components/'+name+'/index.js',stylesheet='page-components/'+name+'/styles.css';
 const code=`import {createModuleState} from '../../components/_runtime/packages/components-html/src/shared/business-module.js';

// Extend this group's business behavior; the compiler renders its existing controls.
export function mount(host, api) {
  const state = createModuleState();
  const status = host.ownerDocument.createElement('p');
  status.dataset.moduleStatus = '';
  status.setAttribute('role', 'status');
  host.append(status);
  // Add only user-requested handlers, keyed by existing behavior IDs.
  // Example: actions.cancel = () => state.cancel();
  // A real operation uses state.run(({signal, update}) => applicationOperation(...)).
  // Do not add a fake success response or claim model inference is implemented.
  const actions = Object.create(null);
  const unsubscribe = state.subscribe(value => {
    status.textContent = value.status === 'idle' ? '' : value.error || value.status;
  });
  const handle = event => {
    const owner = event.target.closest?.('[data-tui-behavior]');
    if (owner && host.contains(owner)) actions[owner.dataset.tuiBehavior]?.(event, state, api);
  };
  host.addEventListener('click', handle);
  return () => { host.removeEventListener('click', handle); unsubscribe(); state.dispose(); status.remove(); };
}
`;
 const css=`/* Private business content only; retain standard controls and Pattern geometry. */\n[data-composition-id="${group}"] [data-module-status] { color: var(--color-text); margin: 0; }\n`;
 if(fs.existsSync(safe('page-input.json.module.tmp')))throw Error('Preserve existing staging file');
 const declaration={source,stylesheet,missingCapability:reason,registryQueries:[query],reviewedCandidates:[]};
 // Query results are evidence of discovery, not automatically rejected candidates.
 target.module=declaration;
 try { fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(safe(source),code,{flag:'wx'});fs.writeFileSync(safe(stylesheet),css,{flag:'wx'});fs.writeFileSync(file+'.module.tmp',JSON.stringify(input,null,2)+'\n',{flag:'wx'});fs.renameSync(file+'.module.tmp',file); }
 catch(error){fs.rmSync(dir,{recursive:true,force:true});fs.rmSync(file+'.module.tmp',{force:true});throw error;}
 return {ok:true,group,source,stylesheet,queriedCandidates:found.stdout.trim(),next:'Implement only the requested business handlers in this module. Reuse existing controls or api.renderComponent. Generate the same project; never create another HTML entry. Record actual rejected candidates if any.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const a=process.argv.slice(2),cmd=a.shift(),v={};while(a.length){const k=a.shift();if(!['--project','--group','--name','--reason','--query'].includes(k)||!a.length)throw Error('Unknown/incomplete '+k);v[k.slice(2)]=a.shift();}if(cmd!=='init')throw Error('business-module.mjs init --project <dir> --group <id> --name <id> --reason <gap> --query <intent>');console.log(JSON.stringify(initBusinessModule(v),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
