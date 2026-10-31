#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseArgs } from "./navigation-index-lib.mjs";
import { assertDynamicPageHost, verifyPageComponents } from "./prepare-page-components.mjs";
import { verifyPageStyles } from "./prepare-page-styles.mjs";
import { inspectHtmlArtifact } from "./html-artifact-graph.mjs";
import { readPageBlueprint } from "./page-blueprint.mjs";
import { validatePageContentRecipes } from "./page-content-recipes.mjs";
import { validateComponentSelection } from "./component-selection.mjs";
import { loadReadinessPolicy, resolveComponentReadiness } from "./component-readiness-policy.mjs";
const args = parseArgs(process.argv.slice(2));
if (!args.project) throw new Error("Usage: validate-page-project.mjs --project <dir> [--skill-root <dir>] [--mode fast-preview|release-validation] [--runtime-evidence <json>] [--require-runtime]");
const root = fs.realpathSync(path.resolve(args.project));
const skillRoot = fs.realpathSync(path.resolve(args["skill-root"] || path.join(path.dirname(fileURLToPath(import.meta.url)), "..")));
const mode = args.mode || "fast-preview";
if (!["fast-preview","release-validation"].includes(mode)) throw new Error("Unknown page validation mode: " + mode);
const read = file => JSON.parse(fs.readFileSync(file,"utf8"));
const manifestPath = path.resolve(args.manifest || path.join(root,"html-page-manifest.json"));
const manifest = read(manifestPath);
const resolve = relative => path.resolve(path.dirname(manifestPath),relative);
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const componentManifest = read(path.join(root,"components/component-manifest.json"));
const contextPath = path.resolve(root,componentManifest.inputs.context.path);
const bindingsPath = path.resolve(root,componentManifest.inputs.bindings.path);
const context = read(contextPath), bindings = read(bindingsPath);
if (context.request?.framework !== "html" || context.request.confirmed !== true) throw new Error("Confirmed HTML context required");
if (manifest.targetFramework !== "html" || context.layout.id !== manifest.patternContract?.id) throw new Error("Manifest/context Pattern mismatch");
assertDynamicPageHost(root);
verifyPageComponents({projectRoot:root,contextPath,bindingsPath,skillRoot});
const styles = verifyPageStyles({projectRoot:root,skillRoot});
for (const key of ["generatedSource","generatedEntry","componentUsage","uiScene","titlebarScene"]) {
  const item = manifest[key];
  if (!item?.path || !item.sha256 || hash(fs.readFileSync(resolve(item.path))) !== item.sha256) throw new Error("Generated artifact changed: " + key);
}
const blueprintPath = resolve(manifest.pageBlueprint.path);
const recipesPath = resolve(manifest.pageContentRecipes.path);
const blueprint = readPageBlueprint(blueprintPath,{patternId:context.layout.id});
for (const [file,evidence] of [[blueprintPath,manifest.pageBlueprint],[recipesPath,manifest.pageContentRecipes]]) {
  if(hash(JSON.stringify(read(file)))!==evidence.sha256) throw new Error("Design input hash mismatch: " + file);
}
const recipeErrors = validatePageContentRecipes(read(recipesPath),{blueprint,bindings:bindings.componentBindings});
if(recipeErrors.length)throw new Error(recipeErrors.join("\n"));
validateComponentSelection(read(resolve(manifest.componentSelection?.path || read(resolve(manifest.componentUsage.path)).selection.path)),{repo:skillRoot,skillRoot,contextPath,bindingsPath,recipesPath});
if(mode==="release-validation") {
  const policy=loadReadinessPolicy(skillRoot);
  const pending=componentManifest.components.filter(c=>!resolveComponentReadiness(read(path.join(root,c.contract)),policy).allowedInRelease);
  if(pending.length)throw new Error("Release requires verified component maturity: "+pending.map(c=>c.id).join(", "));
}
const run = (script, extra) => {
  const cp=spawnSync(process.execPath,[path.join(skillRoot,"scripts",script),...extra],{cwd:root,encoding:"utf8"});
  if(cp.status!==0)throw new Error(script+": "+(cp.stderr||cp.stdout));
};
const usageFile = resolve(manifest.componentUsage.path);
run("validate-web-component-reuse.mjs",["--manifest",usageFile,"--project-root",skillRoot,"--skill-root",skillRoot,"--stage",mode==="fast-preview"?"fast-preview":"release"]);
const cssFile = path.resolve(root,styles.pageCss.path);
const layoutPath = path.resolve(path.dirname(usageFile),read(usageFile).layout.contractPath);
run("validate-pc-framework-layout.mjs",["--contract",layoutPath]);
for (const file of [cssFile,...(styles.businessComponentStyles || []).map(item => path.resolve(root,item.path))]) {
run("validate-page-css-boundaries.mjs",["--source",file]);
run("validate-page-token-usage.mjs",["--project-root",root,"--source",file,"--layout-contract",layoutPath,"--token-root",path.join(skillRoot,"packages/tokens/src")]);
}
for(const module of manifest.pageModules||[]) {
  if(hash(fs.readFileSync(resolve(module.path)))!==module.sha256)throw new Error("Business module changed: "+module.path);
  run("validate-page-composite-boundaries.mjs",["--source",resolve(module.path)]);
}
const graph=inspectHtmlArtifact(path.join(root,"index.html"),{projectRoot:root});
if(!graph.stylesheets.includes(path.join(root,"styles/index.css")))throw new Error("Module graph does not load styles/index.css");
const runtimeFile=args["runtime-evidence"];
if((args["require-runtime"]||mode==="release-validation")&&!runtimeFile)throw new Error("Actual browser runtime evidence required; source checks do not prove browser readiness");
if(runtimeFile)run("validate-runtime-component-reuse.mjs",["--manifest",usageFile,"--evidence",path.resolve(runtimeFile)]);
console.log(JSON.stringify({ok:true,status:runtimeFile?"page-source-and-component-evidence-valid":"page-source-valid-browser-pending",mode,project:root,artifactGraph:graph.digest,dependencyFiles:graph.files.length,runtimeEvidence:runtimeFile?"checked":"not-provided",visualParity:"not-verified",remainingChecks:context.browserChecks},null,2));
