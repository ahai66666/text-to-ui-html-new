#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {parseArgs} from "./navigation-index-lib.mjs";
import {collectProjectDependencies,sha256} from "./artifact-dependencies.mjs";
const args=parseArgs(process.argv.slice(2));
if(args.help){console.log("normalize-demo.mjs --source <original> --project <separate-output> --task <task>");process.exit(0);}
if(!args.source||!args.project||!args.task)throw new Error("Provide --source --project --task and prepared page inputs");
const source=fs.realpathSync(path.resolve(args.source)),project=path.resolve(args.project);
if(source===project||project.startsWith(source+path.sep)||source.startsWith(project+path.sep))throw new Error("Preserve the original Demo; use a separate output project");
const recordFile=path.join(project,"demo-preservation.json"),record=JSON.parse(fs.readFileSync(recordFile));
if(record.schemaVersion!==1||!record.items?.length)throw new Error("demo-preservation.json requires schemaVersion 1 and nonempty items");
const ids=new Set();for(const item of record.items){if(!item.id||ids.has(item.id)||!["content","navigation","state","interaction"].includes(item.kind)||!item.expected||!item.action)throw new Error("Each unique preservation item needs id, kind, action and expected");ids.add(item.id);}
const dependencies=collectProjectDependencies(source);
const baseline={schemaVersion:1,kind:"text-to-ui-demo-baseline",sourceDigest:dependencies.digest,preservationSha256:sha256(fs.readFileSync(recordFile)),sourceFiles:dependencies.files};
fs.mkdirSync(path.join(project,".text-to-ui"),{recursive:true});fs.writeFileSync(path.join(project,".text-to-ui/demo-baseline.json"),JSON.stringify(baseline,null,2)+"\n");
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
// These flags belong to this wrapper; forwarding and appending them twice
// turns parser values into arrays and breaks standalone path resolution.
const forwarded=[];
const owned=new Set(["--source","--repo","--skill-root","--route"]);
const pathFlags=new Set(["--project","--context","--blueprint","--content-recipes","--bindings","--page-css","--layout-contract","--component-selection","--route-receipt","--context-receipt","--receipt-out"]);
for(let i=2;i<process.argv.length;i++) {
 const value=process.argv[i];
 if(owned.has(value)){i++;continue;}
 if(pathFlags.has(value)){if(!process.argv[i+1] || process.argv[i+1].startsWith("--"))throw new Error("Missing path for "+value);forwarded.push(value,path.resolve(process.argv[++i]));continue;}
 forwarded.push(value);
}
const cp=spawnSync(process.execPath,[path.join(skill,"scripts/generate-compliant-page.mjs"),...forwarded,"--route","normalize-demo","--repo",skill,"--skill-root",skill],{cwd:skill,stdio:"inherit"});
if(cp.status!==0)process.exit(cp.status||1);
console.log(JSON.stringify({ok:true,workflow:"normalize-demo",sourceDigest:dependencies.digest,preservedItems:[...ids],behaviorValidation:"pending-browser-checks"}));
