#!/usr/bin/env node

/**
 * One-shot new-page pipeline.
 *
 * The model still owns the page decision files (blueprint, recipes, bindings
 * and page CSS), but it must not orchestrate the delivery gates by hand. This
 * command resolves the route/context closure, verifies both read receipts,
 * compiles the shared page, and commits generated outputs only after every
 * generation preflight passes.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { locateMonorepo, parseArgs, resolveSkillRoot, stableJson } from "./navigation-index-lib.mjs";
import { resolveComponentSelection, validateComponentSelection } from "./component-selection.mjs";
import { preparePageComponents, verifyPageComponents, assertDynamicPageHost } from "./prepare-page-components.mjs";
import { preparePageStyles, verifyPageStyles } from "./prepare-page-styles.mjs";

const args = parseArgs(process.argv.slice(2));
const value = (name) => args[name] && args[name] !== true ? String(args[name]) : null;
const flag = (name) => args[name] === true || String(args[name] ?? "").toLowerCase() === "true";
const usage = `Usage: generate-compliant-page.mjs --project <dir> --framework html
  --task <request> [--task-route <canonical-task-route-id>] [--pattern <canonical-pattern-id>] [--repo <monorepo>] [--skill-root <text-to-ui>]
  [--capabilities <capability,...>] [--optional-capabilities <capability,...>]
  --blueprint <page-blueprint.json> --content-recipes <page-content-recipes.json>
  --bindings <page-bindings.json> --page-css <page-composition.css>
  [--context <context-packet.json>] [--layout-contract <layout-contract.json>]
  [--route <workflow-route-id>] [--mode fast-preview|release|release-validation]
  [--out <page-module>] [--entry-out <generated-entry>]
  [--manifest <html-page-manifest.json>] [--component-selection <component-selection.json>] [--component-usage <component-usage.json>]
  [--ui-scene <ui-scene.json>] [--titlebar-scene <titlebar-scene.json>] [--receipt-out <generation-receipt.json>]
  [--scaffold] [--build]`;

if (flag("help")) {
  process.stdout.write(`${usage}\n`);
  process.exit(0);
}

const projectPath = value("project");
const frameworkArg = value("framework") || "html";
if (!projectPath) throw new Error(usage);
if (frameworkArg !== "html") throw new Error("text-to-ui-html supports HTML output only");

const located = locateMonorepo({ start: process.cwd(), explicitRepo: value("repo") });
if (!located.root) throw new Error(`Text-to-UI Monorepo not found. Tried:\n${located.attempted.join("\n")}`);
const repoRoot = located.root;
const skillRoot = resolveSkillRoot(repoRoot, value("skill-root"));
const projectRoot = path.resolve(projectPath);
const stateRoot = path.resolve(value("state-dir") || path.join(projectRoot, ".text-to-ui"));
fs.mkdirSync(stateRoot, { recursive: true });

const run = (script, scriptArgs, label) => {
  const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts", script), ...scriptArgs], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) throw new Error(`${label || script} failed with exit code ${result.status ?? "unknown"}`);
  return result;
};
run("build-resource-index.mjs", ["--skill-root", skillRoot, "--check"], "focused resource freshness");
const appendListArg = (target, name) => {
  const raw = args[name];
  if (!raw) return;
  for (const item of (Array.isArray(raw) ? raw : [raw])) target.push(`--${name}`, String(item));
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const sha256 = (contents) => crypto.createHash("sha256").update(contents).digest("hex");
const sha256File = (file) => sha256(fs.readFileSync(file));
const posixRelative = (from, to) => path.relative(path.dirname(path.resolve(from)), path.resolve(to)).replaceAll(path.sep, "/") || path.basename(to);
const importPath = (from, to) => `./${posixRelative(from, to)}`;

const routeId = value("route") || "new-page";
if (!["new-page","normalize-demo"].includes(routeId)) throw new Error("This generator handles new-page or normalize-demo");
if(routeId==="normalize-demo"&&!fs.existsSync(path.join(projectRoot,".text-to-ui/demo-baseline.json")))throw new Error("Use normalize-demo.mjs to preserve and fingerprint the original");
const requestedMode = value("mode") || "fast-preview";
const mode = requestedMode === "release" ? "release-validation" : requestedMode;
if (!new Set(["fast-preview", "release-validation"]).has(mode)) throw new Error(`Unsupported mode '${requestedMode}'. Use fast-preview or release-validation.`);
const task = value("task");
const taskRouteId = value("task-route");
const blueprintPath = path.resolve(value("blueprint") || path.join(projectRoot, "page-blueprint.json"));
const recipesPath = path.resolve(value("content-recipes") || path.join(projectRoot, "page-content-recipes.json"));
const bindingsPath = path.resolve(value("bindings") || path.join(projectRoot, "page-bindings.json"));
const componentSelectionPath = path.resolve(value("component-selection") || path.join(stateRoot, "component-selection.json"));
const pageCssPath = path.resolve(value("page-css") || path.join(projectRoot, "styles/page-composition.css"));
const contextPath = path.resolve(value("context") || path.join(stateRoot, "context-packet.json"));
const routeReceiptPath = path.resolve(value("route-receipt") || path.join(stateRoot, "route-read-receipt.json"));
const contextReceiptPath = path.resolve(value("context-receipt") || path.join(stateRoot, "context-material-receipt.json"));
const layoutPath = path.resolve(value("layout-contract") || path.join(stateRoot, "layout-contract.json"));
const receiptOut = path.resolve(value("receipt-out") || path.join(stateRoot, "generation-receipt.json"));
// Never leave a previous successful receipt advertising compliance after a
// later run is blocked. This is the exact generated receipt path, not a broad
// project cleanup.
if (fs.existsSync(receiptOut)) fs.rmSync(receiptOut, { force: true });

if (!fs.existsSync(contextPath) || (!value("context") && task)) {
  if (!task) throw new Error("No Context Packet found. Provide --task so the one-shot pipeline can resolve it.");
  if (!fs.existsSync(blueprintPath)) throw new Error(`Page blueprint not found: ${blueprintPath}`);
  run("resolve-workflow-route.mjs", ["--route", routeId, "--repo", repoRoot, "--receipt-out", routeReceiptPath], "route resolution");
  const contextArgs = [
    "--task", task,
    "--workflow-route", routeId,
    ...(taskRouteId ? ["--task-route", taskRouteId] : []),
    ...(value("pattern") ? ["--pattern", value("pattern")] : []),
    ...(value("pattern-reason") ? ["--pattern-reason", value("pattern-reason")] : []),
    ...(value("pattern-base") ? ["--pattern-base", value("pattern-base")] : []),
    ...(value("primary-task") ? ["--primary-task", value("primary-task")] : []),
    "--repo", repoRoot,
    "--skill-root", skillRoot,
    "--framework", frameworkArg,
    "--mode", mode,
    "--auto",
    "--confirmed",
    "--blueprint", blueprintPath,
    "--out", contextPath,
    "--brief-out", path.join(stateRoot, "page-brief.json"),
    "--receipt-out", contextReceiptPath
  ];
  appendListArg(contextArgs, "capabilities");
  appendListArg(contextArgs, "optional-capabilities");
  run("resolve-context.mjs", contextArgs, "context resolution");
} else if (!fs.existsSync(routeReceiptPath) || !fs.existsSync(contextReceiptPath)) {
  if (!task) throw new Error("Existing Context Packet requires route/context read receipts. Provide --task to refresh them automatically.");
  if (!fs.existsSync(blueprintPath)) throw new Error(`Page blueprint not found: ${blueprintPath}`);
  run("resolve-workflow-route.mjs", ["--route", routeId, "--repo", repoRoot, "--receipt-out", routeReceiptPath], "route receipt refresh");
  const contextArgs = [
    "--task", task,
    "--workflow-route", routeId,
    ...(taskRouteId ? ["--task-route", taskRouteId] : []),
    ...(value("pattern") ? ["--pattern", value("pattern")] : []),
    ...(value("pattern-reason") ? ["--pattern-reason", value("pattern-reason")] : []),
    ...(value("pattern-base") ? ["--pattern-base", value("pattern-base")] : []),
    ...(value("primary-task") ? ["--primary-task", value("primary-task")] : []),
    "--repo", repoRoot,
    "--skill-root", skillRoot,
    "--framework", frameworkArg,
    "--mode", mode,
    "--auto",
    "--confirmed",
    "--blueprint", blueprintPath,
    "--out", contextPath,
    "--brief-out", path.join(stateRoot, "page-brief.json"),
    "--receipt-out", contextReceiptPath
  ];
  appendListArg(contextArgs, "capabilities");
  appendListArg(contextArgs, "optional-capabilities");
  run("resolve-context.mjs", contextArgs, "context receipt refresh");
}

if (!fs.existsSync(routeReceiptPath)) throw new Error(`Route read receipt not found: ${routeReceiptPath}`);
if (!fs.existsSync(contextReceiptPath)) throw new Error(`Context material receipt not found: ${contextReceiptPath}`);
run("verify-route-materials.mjs", ["--route", routeId, "--repo", repoRoot, "--skill-root", skillRoot, "--receipt", routeReceiptPath], "route material verification");
run("verify-context-materials.mjs", ["--repo", repoRoot, "--skill-root", skillRoot, "--context", contextPath, "--receipt", contextReceiptPath], "context material verification");

const context = readJson(contextPath);
if (context.request?.framework !== frameworkArg) throw new Error(`Context Packet framework '${context.request?.framework}' does not match --framework '${frameworkArg}'`);
if (context.route?.workflowRouteId !== routeId) throw new Error("Context Workflow does not match the generation route");
if (taskRouteId && context.route?.id !== taskRouteId) throw new Error(`Context Packet task route '${context.route?.id ?? "missing"}' does not match --task-route '${taskRouteId}'`);
if (context.request?.confirmed !== true || context.request?.confirmation?.status !== "confirmed") throw new Error("One-shot generation requires a confirmed Context Packet");
if (!fs.existsSync(layoutPath) || !value("layout-contract")) run("generate-layout-contract.mjs", ["--context", contextPath, "--out", layoutPath], "layout contract generation");
if (!fs.existsSync(blueprintPath)) throw new Error(`Page blueprint not found: ${blueprintPath}`);
if (!fs.existsSync(recipesPath)) throw new Error(`Page content recipes not found: ${recipesPath}`);
if (!fs.existsSync(bindingsPath)) throw new Error(`Page bindings not found: ${bindingsPath}`);
if (!fs.existsSync(pageCssPath)) throw new Error(`Page CSS not found: ${pageCssPath}`);
if (!fs.existsSync(componentSelectionPath) || !value("component-selection")) {
  fs.mkdirSync(path.dirname(componentSelectionPath), { recursive: true });
  fs.writeFileSync(componentSelectionPath, `${JSON.stringify(resolveComponentSelection({ repo: repoRoot, skillRoot, contextPath, bindingsPath, recipesPath }), null, 2)}\n`);
}
validateComponentSelection(readJson(componentSelectionPath), { repo: repoRoot, skillRoot, contextPath, bindingsPath, recipesPath });

let componentBundle;
let styleBundle;

const extension = "js";
const finalPaths = {
  source: path.resolve(value("out") || path.join(projectRoot, `generated-page.${extension}`)),
  entry: path.resolve(value("entry-out") || path.join(projectRoot, `generated-entry.${extension}`)),
  manifest: path.resolve(value("manifest") || path.join(projectRoot, "html-page-manifest.json")),
  usage: path.resolve(value("component-usage") || path.join(projectRoot, "component-usage.json")),
  uiScene: path.resolve(value("ui-scene") || path.join(projectRoot, "ui-scene.json")),
  titlebarScene: path.resolve(value("titlebar-scene") || path.join(projectRoot, "titlebar-scene.json")),
};
for (const file of Object.values(finalPaths)) if (file) fs.mkdirSync(path.dirname(file), { recursive: true });

const stageToken = `${process.pid}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
const stagePaths = Object.fromEntries(Object.entries(finalPaths).map(([key, file]) => [
  key,
  file ? path.join(path.dirname(file), `.${path.basename(file)}.${stageToken}.tmp`) : null
]));
const generatedArgs = [
  "--components-root", projectRoot,
  "--context", contextPath,
  "--layout-contract", layoutPath,
  "--blueprint", blueprintPath,
  "--content-recipes", recipesPath,
  "--page-css", pageCssPath,
  "--bindings", bindingsPath,
  "--out", stagePaths.source,
  "--entry-out", stagePaths.entry,
  "--manifest", stagePaths.manifest,
  "--ui-scene", stagePaths.uiScene,
  "--titlebar-scene", stagePaths.titlebarScene,
  "--require-blueprint", "--require-content-recipes", "--require-slots"
];
generatedArgs.push("--component-usage", stagePaths.usage, "--component-selection", componentSelectionPath);

const cleanup = () => {
  for (const file of Object.values(stagePaths)) if (file && fs.existsSync(file)) fs.rmSync(file, { force: true });
};

try {
  componentBundle = preparePageComponents({ projectRoot, contextPath, bindingsPath, skillRoot });
// An empty target is made runnable as part of the same entry point. Existing
// projects are never rewritten unless the caller explicitly asks for
// `--scaffold`; scaffold-standalone-project.mjs itself preserves existing
// entry files and only fills missing setup.
if (flag("scaffold") || !fs.existsSync(path.join(projectRoot, "package.json"))) {
  run("scaffold-standalone-project.mjs", [
    "--project", projectRoot,
    "--repo", repoRoot,
    "--components-root", projectRoot,
    "--entry", `./${path.relative(projectRoot, finalPaths.entry).replaceAll(path.sep, "/")}`
  ], "project scaffold");
}

assertDynamicPageHost(projectRoot);
  styleBundle = preparePageStyles({ projectRoot, pageCssPath, entryPath: finalPaths.entry, skillRoot });
  run("generate-html-page.mjs", generatedArgs, "strict page generation");
  for (const file of Object.values(stagePaths)) if (file && !fs.existsSync(file)) throw new Error(`Generator did not produce staged output: ${file}`);

  // The staged files share the final directories, so relative provenance is
  // already correct except for generated source/entry/usage filenames. Patch
  // those references before the atomic rename.
  const manifest = readJson(stagePaths.manifest);
  manifest.generatedSource.path = posixRelative(finalPaths.manifest, finalPaths.source);
  manifest.generatedEntry.path = posixRelative(finalPaths.manifest, finalPaths.entry);
  manifest.uiScene.path = posixRelative(finalPaths.manifest, finalPaths.uiScene);
  if (manifest.titlebarScene && finalPaths.titlebarScene) manifest.titlebarScene.path = posixRelative(finalPaths.manifest, finalPaths.titlebarScene);
  if (manifest.componentUsage && finalPaths.usage) manifest.componentUsage.path = posixRelative(finalPaths.manifest, finalPaths.usage);

  const entryTempImport = JSON.stringify(importPath(stagePaths.entry, stagePaths.source));
  const entryFinalImport = JSON.stringify(importPath(finalPaths.entry, finalPaths.source));
  let entrySource = fs.readFileSync(stagePaths.entry, "utf8").split(entryTempImport).join(entryFinalImport);
  fs.writeFileSync(stagePaths.entry, entrySource);
  manifest.generatedEntry.sha256 = sha256(entrySource);

  if (finalPaths.usage) {
    const usage = readJson(stagePaths.usage);
    const temporaryRoot = path.relative(repoRoot, stagePaths.source).replaceAll(path.sep, "/");
    const finalRoot = path.relative(repoRoot, finalPaths.source).replaceAll(path.sep, "/");
    usage.sourceRoots = (usage.sourceRoots ?? []).map((source) => source === temporaryRoot ? finalRoot : source);
    const usageSource = `${JSON.stringify(usage, null, 2)}\n`;
    fs.writeFileSync(stagePaths.usage, usageSource);
    manifest.componentUsage.sha256 = sha256(usageSource);
  }
  fs.writeFileSync(stagePaths.manifest, `${JSON.stringify(manifest, null, 2)}\n`);

  verifyPageComponents({ projectRoot, contextPath, bindingsPath, skillRoot });
  verifyPageStyles({ projectRoot, pageCssPath, entryPath: finalPaths.entry, skillRoot });
  // Commit only after every preflight and provenance rewrite has succeeded.
  for (const key of ["source", "entry", "usage", "uiScene", "titlebarScene", "manifest"]) {
    const staged = stagePaths[key];
    const target = finalPaths[key];
    if (staged && target) fs.renameSync(staged, target);
  }
} catch (error) {
  cleanup();
  styleBundle?.rollback();
  componentBundle?.rollback();
  throw error;
}

const finalManifest = readJson(finalPaths.manifest);
const routeReceipt = readJson(routeReceiptPath);
const contextReceipt = readJson(contextReceiptPath);
const generationReceipt = {
  schemaVersion: 1,
  kind: "text-to-ui-compliant-generation-receipt",
  generatedAt: new Date().toISOString(),
  task: task || context.request.task || null,
  framework: frameworkArg,
  mode,
  route: {
    workflowRouteId: routeId,
    routeDigest: routeReceipt.routeDigest,
    materialsDigest: routeReceipt.materialsDigest,
    readReceipt: path.relative(projectRoot, routeReceiptPath).replaceAll(path.sep, "/")
  },
  context: {
    materialsDigest: contextReceipt.materialsDigest,
    packet: path.relative(projectRoot, contextPath).replaceAll(path.sep, "/"),
    readReceipt: path.relative(projectRoot, contextReceiptPath).replaceAll(path.sep, "/")
  },
  pattern: finalManifest.patternContract,
  componentBundle: { path: path.relative(projectRoot, componentBundle.path).replaceAll(path.sep, "/"), sha256: componentBundle.sha256, componentCount: componentBundle.componentCount },
  gates: ["style-bundle", "unified-style-entry", "dynamic-host", "route-materials", "context-materials", "layout-contract", "blueprint", "content-recipes", "component-selection", "component-adapter", "pattern-slots", "titlebar-scene", "token-css", "page-composite-boundaries", "atomic-output"].map((id) => ({ id, status: "passed" })),
  styleBundle: { path: path.relative(projectRoot, styleBundle.path).replaceAll(path.sep, "/"), sha256: styleBundle.sha256 },
  componentSelection: { path: path.relative(projectRoot, componentSelectionPath).replaceAll(path.sep, "/"), sha256: sha256File(componentSelectionPath) },
  outputs: Object.fromEntries(Object.entries(finalPaths).filter(([, file]) => file).map(([key, file]) => [key, { path: path.relative(projectRoot, file).replaceAll(path.sep, "/"), sha256: sha256File(file) }])),
  manifest: { path: path.relative(projectRoot, finalPaths.manifest).replaceAll(path.sep, "/"), sha256: sha256File(finalPaths.manifest) },
  build: "pending"
};
if (flag("build")) {
  const result = spawnSync("pnpm", ["build"], { cwd: projectRoot, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Project build failed with exit code ${result.status ?? "unknown"}`);
  generationReceipt.build = "passed";
} else {
  generationReceipt.build = "not-requested";
}
fs.mkdirSync(path.dirname(receiptOut), { recursive: true });
fs.writeFileSync(receiptOut, stableJson(generationReceipt));

console.log(JSON.stringify({
  ok: true,
  status: "compliant-generation-ready",
  framework: frameworkArg,
  patternId: finalManifest.patternContract.id,
  patternDigest: finalManifest.patternContract.patternDigest,
  structureDigest: finalManifest.patternContract.structureDigest,
  receipt: receiptOut,
  manifest: finalPaths.manifest,
  outputs: Object.values(finalPaths).filter(Boolean)
}, null, 2));
