#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./navigation-index-lib.mjs";
import { assertDynamicPageHost, verifyPageComponents } from "./prepare-page-components.mjs";

const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const posix = (value) => value.split(path.sep).join("/");
const safe = (root, relative) => {
  const full = path.resolve(root, relative);
  const base = path.resolve(root);
  if (!full.startsWith(base + path.sep)) throw new Error("Styles path is outside project: " + relative);
  for (let current = full; current !== base; current = path.dirname(current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error("Managed styles path contains a symlink: " + relative);
  }
  return full;
};
const specifier = (from, to) => {
  const value = posix(path.relative(path.dirname(from), to));
  return value.startsWith(".") ? value : "./" + value;
};
export const baseStyles = "html, body, #app { margin: 0; padding: 0; width: 100%; height: 100%; }\nbody { overflow: hidden; }\n";
export const oldInlineReset = "<style>html,body,#app{margin:0;padding:0;width:100%;height:100%}body{overflow:hidden}</style>";

export function collectBusinessComponentStyles({projectRoot,bindingsPath,pageCssPath}) {
  const cssFile = safe(projectRoot,pageCssPath || "styles/page-composition.css");
  const bindings = bindingsPath ? read(bindingsPath) : {};
  return (bindings.pageModules || []).map(item => {
    if (!item.stylesheet || typeof item.stylesheet !== "string") throw new Error("Business component requires an independent stylesheet: " + item.compositionId);
    const file = safe(projectRoot, path.resolve(path.dirname(path.resolve(bindingsPath)), item.stylesheet));
    const moduleFile = safe(projectRoot, path.resolve(path.dirname(path.resolve(bindingsPath)), item.source));
    if (!fs.existsSync(moduleFile)) throw new Error("Business component module missing: " + item.source);
    if (!file.endsWith(".css") || file === cssFile || !fs.existsSync(file)) throw new Error("Business component CSS must be an existing separate .css file: " + item.stylesheet);
    const bytes = fs.readFileSync(file);
    if (/@import\b/i.test(bytes.toString("utf8").replace(/\/\*[\s\S]*?\*\//g, ""))) throw new Error("Business component CSS cannot import other stylesheets: " + item.stylesheet);
    return {compositionId:item.compositionId, path:posix(path.relative(projectRoot,file)), sha256:hash(bytes), ownership:"model-business-component"};
  });
}

export function planPageStyles({ projectRoot, pageCssPath, entryPath = null, skillRoot = ownRoot }) {
  projectRoot = path.resolve(projectRoot);
  const cssFile = safe(projectRoot, pageCssPath || "styles/page-composition.css");
  const entryFile = safe(projectRoot, entryPath || "generated-entry.js");
  const cssRelative = posix(path.relative(projectRoot, cssFile));
  if (!cssFile.endsWith(".css") || ["styles/index.css", "styles/base.css"].includes(cssRelative)) throw new Error("Page CSS must be a separate .css file, normally styles/page-composition.css");
  if (!fs.existsSync(cssFile)) throw new Error("Write page-owned CSS before preparing styles: " + cssFile);
  const pageCss = fs.readFileSync(cssFile);
  const cssText = pageCss.toString("utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  if (/@import\b/i.test(cssText)) throw new Error("page-composition.css cannot import other stylesheets; styles/index.css owns style loading");
  const componentManifestFile = safe(projectRoot, "components/component-manifest.json");
  const componentManifestBytes = fs.readFileSync(componentManifestFile);
  const componentManifest = JSON.parse(componentManifestBytes);
  verifyPageComponents({
    projectRoot,
    contextPath: path.resolve(projectRoot, componentManifest.inputs.context.path),
    bindingsPath: componentManifest.inputs.bindings ? path.resolve(projectRoot, componentManifest.inputs.bindings.path) : null,
    skillRoot
  });
  assertDynamicPageHost(projectRoot);
  const mainFile = safe(projectRoot, "main.js");
  const sourceMain = fs.readFileSync(mainFile, "utf8");
  const mountImport = 'import { mountGeneratedPage } from ' + JSON.stringify(specifier(mainFile, entryFile)) + ';\nmountGeneratedPage();\n';
  const main = 'import "./styles/index.css";\n' + mountImport;
  if (![mountImport.trim(), main.trim()].includes(sourceMain.trim())) throw new Error("main.js contains project edits; migrate it to the standard styles entry explicitly before generation");
  const htmlFile = safe(projectRoot, "index.html");
  const originalHtml = fs.readFileSync(htmlFile, "utf8");
  const html = originalHtml.replace(oldInlineReset, "");
  if (/<style\b|\bstyle\s*=|<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])/i.test(html)) throw new Error("index.html must load styles through main.js and styles/index.css; move custom CSS into styles/page-composition.css");

  const businessComponentStyles = collectBusinessComponentStyles({
    projectRoot,
    bindingsPath: componentManifest.inputs.bindings ? path.resolve(projectRoot, componentManifest.inputs.bindings.path) : null,
    pageCssPath: cssFile
  });
  const imports = [
    "components/_runtime/packages/tokens/src/index.css",
    "styles/base.css",
    "components/_runtime/packages/components-html/src/styles.css",
    "components/_runtime/packages/components-html/src/pattern-shell.css",
    "components/_runtime/packages/pattern-runtime/src/styles.css",
    ...new Set(businessComponentStyles.map(item => item.path)),
    posix(path.relative(projectRoot, cssFile))
  ];
  const dependencyHashes = {};
  for (const relative of imports.filter((file) => file.startsWith("components/"))) {
    const full = safe(projectRoot, relative);
    const expected = componentManifest.files[relative]?.sha256;
    if (!expected || hash(fs.readFileSync(full)) !== expected) throw new Error("Unverified canonical stylesheet: " + relative);
    dependencyHashes[relative] = expected;
  }
  const indexCss = imports.map((relative) => '@import url(' + JSON.stringify(specifier("styles/index.css", relative)) + ');').join("\n") + "\n";
  const files = new Map([
    ["styles/index.css", indexCss],
    ["styles/base.css", baseStyles],
    ["main.js", main],
    ["index.html", html]
  ]);
  const manifest = {
    schemaVersion: 1, kind: "text-to-ui-page-styles",
    entryModule: posix(path.relative(projectRoot, entryFile)),
    entryPoint: "main.js", stylesheet: "styles/index.css",
    pageCss: { path: posix(path.relative(projectRoot, cssFile)), sha256: hash(pageCss), ownership: "model-page-composition" },
    componentBundle: { path: "components/component-manifest.json", sha256: hash(componentManifestBytes) },
    loadOrder: imports,
    dependencies: dependencyHashes,
    businessComponentStyles,
    files: Object.fromEntries([...files].map(([file, contents]) => [file, { sha256: hash(contents), ownership: "script-managed" }]))
  };
  return { projectRoot, files, manifest, canAdopt: new Set(["main.js", "index.html"]) };
}

export function verifyPageStyles(options) {
  const projectRoot = path.resolve(options.projectRoot);
  const manifestFile = safe(projectRoot, "styles/style-manifest.json");
  if (!fs.existsSync(manifestFile)) throw new Error("Missing styles/style-manifest.json; prepare page styles first");
  const saved = read(manifestFile);
  const plan = planPageStyles({
    ...options,
    pageCssPath: options.pageCssPath || saved.pageCss?.path,
    entryPath: options.entryPath || saved.entryModule
  });
  if (json(saved) !== json(plan.manifest)) throw new Error("Page style manifest is stale; regenerate styles from current page inputs");
  for (const [relative, contents] of plan.files) {
    const full = safe(projectRoot, relative);
    if (!fs.existsSync(full) || hash(fs.readFileSync(full)) !== hash(contents)) throw new Error("Managed stylesheet or entry changed: " + relative);
  }
  return plan.manifest;
}

export function preparePageStyles(options) {
  const plan = planPageStyles(options);
  const manifestFile = safe(plan.projectRoot, "styles/style-manifest.json");
  const previous = fs.existsSync(manifestFile) ? read(manifestFile) : null;
  if (previous && previous.kind !== plan.manifest.kind) throw new Error("Unrecognized style manifest");
  for (const [relative, contents] of plan.files) {
    const full = safe(plan.projectRoot, relative);
    if (!fs.existsSync(full)) continue;
    const actual = hash(fs.readFileSync(full));
    if (actual === hash(contents) || actual === previous?.files?.[relative]?.sha256) continue;
    if (!previous && plan.canAdopt.has(relative)) continue;
    throw new Error("Preserve edited or unowned style file: " + relative);
  }
  const backup = new Map([...plan.files.keys(), "styles/style-manifest.json"].map((relative) => {
    const full = safe(plan.projectRoot, relative);
    return [relative, fs.existsSync(full) ? fs.readFileSync(full) : null];
  }));
  const rollback = () => {
    for (const [relative, bytes] of backup) {
      const full = safe(plan.projectRoot, relative);
      if (bytes === null) fs.rmSync(full, { force: true });
      else { fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, bytes); }
    }
  };
  try {
    for (const [relative, contents] of plan.files) {
      const full = safe(plan.projectRoot, relative);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, contents);
    }
    fs.writeFileSync(manifestFile, json(plan.manifest));
    verifyPageStyles(options);
  } catch (error) { rollback(); throw error; }
  return { path: manifestFile, sha256: hash(fs.readFileSync(manifestFile)), rollback };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) throw new Error("Usage: prepare-page-styles.mjs --project <dir> [--page-css <file>] [--entry <module>] [--skill-root <dir>] [--check]");
  const options = { projectRoot: args.project, pageCssPath: args["page-css"], entryPath: args.entry, skillRoot: args["skill-root"] || ownRoot };
  const result = args.check ? { ok: true, stylesheet: verifyPageStyles(options).stylesheet } : { ok: true, ...preparePageStyles(options) };
  console.log(json(result));
}
