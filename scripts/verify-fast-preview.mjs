#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson } from './navigation-index-lib.mjs';

const args = parseArgs(process.argv.slice(2));
const dynamicProject = path.resolve(args.project || args["project-root"] || path.dirname(path.resolve(args.artifact || ".")));
if (fs.existsSync(path.join(dynamicProject,"styles/style-manifest.json"))) {
  const skillRoot = path.resolve(args["skill-root"] || fileURLToPath(new URL("..",import.meta.url)));
  const forwarded = ["--project",dynamicProject,"--skill-root",skillRoot,"--mode","fast-preview","--require-runtime"];
  if (args["framework-manifest"]) forwarded.push("--manifest",path.resolve(args["framework-manifest"]));
  if (args["runtime-evidence"]) forwarded.push("--runtime-evidence",path.resolve(args["runtime-evidence"]));
  const result = spawnSync(process.execPath,[path.join(skillRoot,"scripts/validate-page-project.mjs"),...forwarded],{stdio:"inherit"});
  process.exit(result.status || (result.error ? 1 : 0));
}
const requiredArgs = ['context', 'layout-contract', 'page-spec', 'component-usage', 'framework-manifest', 'artifact'];
for (const name of requiredArgs) if (!args[name]) throw new Error(`Missing --${name}`);
for (const name of requiredArgs) {
  const file = path.resolve(args[name]);
  if (!fs.existsSync(file)) throw new Error(`${name} file not found: ${file}`);
}
const context = readJson(path.resolve(args.context));
const componentUsage = readJson(path.resolve(args['component-usage']));
const layoutContract = readJson(path.resolve(args['layout-contract']));
const frameworkManifestPath = path.resolve(args['framework-manifest']);
const frameworkManifest = readJson(frameworkManifestPath);
if (context.request?.mode !== 'fast-preview') throw new Error('Context packet mode must be fast-preview');
if (context.request?.confirmed !== true || context.request?.confirmation?.status !== 'confirmed') throw new Error('Fast Preview requires an explicitly confirmed Context Packet');
const artifact = path.resolve(args.artifact);
if (fs.statSync(artifact).size === 0) throw new Error('Preview artifact is empty');
const sha256 = (contents) => crypto.createHash('sha256').update(contents).digest('hex');
if (frameworkManifest.targetFramework !== context.request?.framework) throw new Error('Framework manifest target does not match Context Packet framework');
const expectedPattern = context.patternContract?.pattern;
const manifestPattern = frameworkManifest.patternContract;
if (!expectedPattern?.id || !manifestPattern?.id) throw new Error('Pattern provenance is required in both Context Packet and Framework Manifest');
if (manifestPattern.id !== expectedPattern.id || manifestPattern.id !== layoutContract.pattern) throw new Error('Pattern ID mismatch between Context Packet, Layout Contract, and Framework Manifest');
if (manifestPattern.patternDigest !== context.patternContract?.patternDigest) throw new Error('Pattern digest mismatch between Context Packet and Framework Manifest');
if (!manifestPattern.structureDigest) throw new Error('Framework Manifest is missing structureDigest provenance');
if (componentUsage.layout?.pattern !== manifestPattern.id) throw new Error('component-usage Pattern does not match Framework Manifest');
if (componentUsage.layout?.patternDigest !== manifestPattern.patternDigest) throw new Error('component-usage patternDigest does not match Framework Manifest');
if (componentUsage.layout?.structureDigest !== manifestPattern.structureDigest) throw new Error('component-usage structureDigest does not match Framework Manifest');
if (!frameworkManifest.generatedSource?.path || !frameworkManifest.generatedSource?.sha256) throw new Error('Framework manifest is missing generatedSource provenance');
if (!frameworkManifest.pageBlueprint?.id || !frameworkManifest.pageBlueprint?.sha256) throw new Error('Framework manifest is missing page blueprint provenance');
const blueprintPath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.pageBlueprint.path);
if (!fs.existsSync(blueprintPath)) throw new Error(`Page blueprint not found: ${blueprintPath}`);
if (sha256(JSON.stringify(readJson(blueprintPath))) !== frameworkManifest.pageBlueprint.sha256) throw new Error('Page blueprint hash mismatch');
if (!frameworkManifest.pageContentRecipes?.path || !frameworkManifest.pageContentRecipes?.sha256) throw new Error('Framework manifest is missing page content recipe provenance');
const contentRecipesPath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.pageContentRecipes.path);
if (!fs.existsSync(contentRecipesPath)) throw new Error(`Page content recipes not found: ${contentRecipesPath}`);
if (sha256(JSON.stringify(readJson(contentRecipesPath))) !== frameworkManifest.pageContentRecipes.sha256) throw new Error('Page content recipes hash mismatch');
const generatedSourcePath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.generatedSource.path);
if (!fs.existsSync(generatedSourcePath)) throw new Error(`Framework generated source not found: ${generatedSourcePath}`);
if (sha256(fs.readFileSync(generatedSourcePath)) !== frameworkManifest.generatedSource.sha256) throw new Error('Framework generated source hash mismatch');
if (!frameworkManifest.generatedEntry?.path || !frameworkManifest.generatedEntry?.sha256) throw new Error('Framework manifest is missing generatedEntry provenance');
const generatedEntryPath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.generatedEntry.path);
if (!fs.existsSync(generatedEntryPath)) throw new Error(`Framework generated entry not found: ${generatedEntryPath}`);
if (sha256(fs.readFileSync(generatedEntryPath)) !== frameworkManifest.generatedEntry.sha256) throw new Error('Framework generated entry hash mismatch');
for (const module of frameworkManifest.pageModules ?? []) {
  const file = path.resolve(path.dirname(frameworkManifestPath), module.path);
  if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== module.sha256) throw new Error(`Page composite source changed: ${module.path}`);
}
if (context.request?.framework === 'html' || componentUsage.schemaVersion === 3) {
  if (![2, 3].includes(componentUsage.schemaVersion) || componentUsage.enforcement !== 'strict-source') throw new Error('New Fast Preview requires strict component-usage');
  if (!frameworkManifest.componentUsage?.path || !frameworkManifest.componentUsage?.sha256) throw new Error('HTML framework manifest is missing componentUsage provenance');
  const declaredUsagePath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.componentUsage.path);
  if (declaredUsagePath !== path.resolve(args['component-usage'])) throw new Error('The supplied component-usage file is not the one declared by the framework manifest');
  if (sha256(fs.readFileSync(declaredUsagePath)) !== frameworkManifest.componentUsage.sha256) throw new Error('component-usage hash mismatch');
  if (!frameworkManifest.deliveryArtifact?.path || !frameworkManifest.deliveryArtifact?.sha256) throw new Error('HTML framework manifest is missing stamped deliveryArtifact provenance');
  const declaredArtifactPath = path.resolve(path.dirname(frameworkManifestPath), frameworkManifest.deliveryArtifact.path);
  if (declaredArtifactPath !== artifact) throw new Error('The supplied artifact is not the stamped delivery artifact');
  if (sha256(fs.readFileSync(declaredArtifactPath)) !== frameworkManifest.deliveryArtifact.sha256) throw new Error('Delivery artifact hash mismatch');
  if (!Array.isArray(frameworkManifest.deliveryArtifact.stylesheets) || frameworkManifest.deliveryArtifact.stylesheets.length === 0) throw new Error('Stamped HTML artifact must declare at least one local stylesheet');
  const artifactHtml = fs.readFileSync(artifact, 'utf8');
  for (const stylesheet of frameworkManifest.deliveryArtifact.stylesheets) {
    const stylesheetPath = path.resolve(path.dirname(frameworkManifestPath), stylesheet.path);
    if (!fs.existsSync(stylesheetPath)) throw new Error(`Stamped stylesheet not found: ${stylesheetPath}`);
    if (sha256(fs.readFileSync(stylesheetPath)) !== stylesheet.sha256) throw new Error(`Stamped stylesheet hash mismatch: ${stylesheet.href}`);
    if (!artifactHtml.includes(stylesheet.href)) throw new Error(`Stamped stylesheet is no longer linked by the delivery artifact: ${stylesheet.href}`);
  }
}
const projectRoot = path.resolve(args['project-root'] || path.dirname(artifact));
const skillRoot = path.resolve(args['skill-root'] || path.join(context.repository.root, 'skill-support'));
const commands = [
  [path.join(skillRoot, 'scripts/validate-pc-framework-layout.mjs'), ['--contract', path.resolve(args['layout-contract'])]],
  [path.join(skillRoot, 'scripts/validate-page-spec.mjs'), [path.resolve(args['page-spec'])]],
  [path.join(skillRoot, 'scripts/validate-page-layout-binding.mjs'), ['--page-spec', path.resolve(args['page-spec']), '--layout-contract', path.resolve(args['layout-contract']), '--component-usage', path.resolve(args['component-usage'])]],
  [path.join(skillRoot, 'scripts/validate-page-css-boundaries.mjs'), componentUsage.sourceRoots.flatMap((sourceRoot) => ['--source', path.resolve(projectRoot, sourceRoot)])],
  [path.join(skillRoot, 'scripts/validate-layout-markers.mjs'), ['--artifact', artifact, '--layout-contract', path.resolve(args['layout-contract']), ...(args['runtime-evidence'] ? ['--runtime-evidence', path.resolve(args['runtime-evidence'])] : []), ...((componentUsage.sourceRoots || []).flatMap((sourceRoot) => ['--source', path.resolve(projectRoot, sourceRoot)]))]],
  [path.join(skillRoot, 'scripts/validate-web-component-reuse.mjs'), ['--manifest', path.resolve(args['component-usage']), '--project-root', projectRoot, '--skill-root', skillRoot, '--stage', 'fast-preview']]
];
if ((frameworkManifest.pageModules ?? []).length) {
  commands.push([path.join(skillRoot, 'scripts/validate-page-composite-boundaries.mjs'), frameworkManifest.pageModules.flatMap((module) => ['--source', path.resolve(path.dirname(frameworkManifestPath), module.path)])]);
}
if (componentUsage.schemaVersion >= 2 || componentUsage.enforcement === 'strict-source') {
  if (!args['runtime-evidence']) throw new Error('Strict Fast Preview requires --runtime-evidence captured from collectHtmlComponentEvidence(document)');
  commands.push(
    [path.join(skillRoot, 'scripts/validate-page-token-usage.mjs'), ['--project-root', projectRoot, '--layout-contract', path.resolve(args['layout-contract']), ...componentUsage.sourceRoots.flatMap((sourceRoot) => ['--source', sourceRoot])]],
    [path.join(skillRoot, 'scripts/validate-runtime-component-reuse.mjs'), ['--manifest', path.resolve(args['component-usage']), '--evidence', path.resolve(args['runtime-evidence'])]]
  );
}
for (const [script, scriptArgs] of commands) {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const provisionalComponents = (componentUsage.registered ?? []).filter((entry) => entry.readinessLevel === 'provisional').map((entry) => entry.logicalName);
console.log(JSON.stringify({
  status: 'fast-preview-ready',
  deliveryStatus: provisionalComponents.length ? 'preview-only-provisional-components' : 'preview-ready-release-check-required',
  provisionalComponents,
  artifact, framework: context.request.framework,
  enforcement: componentUsage.enforcement ?? 'legacy-import',
  remainingManualChecks: context.browserChecks
}, null, 2));
