#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadComponentContract, resolveHtmlComponentRuntime } from "./component-contract-loader.mjs";
import { loadReadinessPolicy, resolveComponentReadiness } from "./component-readiness-policy.mjs";
import { parseArgs } from "./navigation-index-lib.mjs";
import { materialSnapshot } from "./route-material-lib.mjs";

const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const posix = (value) => value.split(path.sep).join("/");
const relativeImport = (from, to) => {
  const value = posix(path.relative(path.dirname(from), to));
  return value.startsWith(".") ? value : "./" + value;
};
const safePath = (base, relative) => {
  const full = path.resolve(base, relative);
  if (!full.startsWith(path.resolve(base) + path.sep)) throw new Error("Unsafe managed path: " + relative);
  let ancestor = full;
  while (ancestor !== path.resolve(base)) {
    if (fs.existsSync(ancestor) && fs.lstatSync(ancestor).isSymbolicLink()) throw new Error("Managed path contains a symlink: " + relative);
    ancestor = path.dirname(ancestor);
  }
  return full;
};
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

export function planPageComponents({ projectRoot, contextPath, bindingsPath = null, skillRoot = ownRoot }) {
  projectRoot = path.resolve(projectRoot);
  skillRoot = path.resolve(skillRoot);
  const context = read(contextPath);
  if (context.request?.framework !== "html") throw new Error("Component preparation requires an HTML Context Packet");
  if (!context.materialsDigest || !context.materials?.length) throw new Error("Context Packet requires current material evidence");
  const snapshot = materialSnapshot({ repo: context.repository.root, skillRoot, definitions: context.materials });
  if (snapshot.digest !== context.materialsDigest) throw new Error("Context materials changed; resolve the route again");
  const index = read(path.join(skillRoot, "references/index/generated/component-index.json"));
  const selected = new Map();
  const input = bindingsPath ? read(bindingsPath) : null;
  const rows = input ? (input.componentBindings ?? input.components ?? input.bindings ?? []) : context.renderer?.components ?? [];
  if (!Array.isArray(rows) || !rows.length) throw new Error("No selected component bindings");
  const policy = loadReadinessPolicy(skillRoot);
  for (const row of rows) {
    const allowed = context.renderer?.components?.find((entry) => entry.logicalName === row.logicalName);
    if (!allowed) throw new Error("Component is outside the resolved route: " + row.logicalName);
    const indexed = index.components.find((entry) => entry.logicalName === row.logicalName);
    if (!indexed || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(indexed.id)) throw new Error("Unknown component: " + row.logicalName);
    const contract = loadComponentContract(skillRoot, context.repository.root, indexed);
    const runtime = resolveHtmlComponentRuntime(skillRoot, context.repository.root, contract);
    if (!runtime.exists) throw new Error("Missing registered HTML implementation: " + indexed.id);
    const readiness = resolveComponentReadiness(contract, policy);
    const release = context.request.mode === "release-validation";
    if (release ? !readiness.allowedInRelease : !readiness.allowedInFastPreview) throw new Error(indexed.id + ": " + readiness.reason);
    for (const key of Object.keys(row.options ?? {})) if (!(contract.props ?? []).includes(key)) throw new Error(indexed.id + ": unsupported prop " + key);
    for (const key of Object.keys(row.slots ?? {})) if (!(contract.slots ?? []).includes(key)) throw new Error(indexed.id + ": unsupported slot " + key);
    for (const [key, values] of [["variant", contract.variants], ["state", contract.states], ["size", contract.sizes], ["mode", contract.modes]]) {
      if (row.options?.[key] && values?.length && !values.includes(row.options[key])) throw new Error(indexed.id + ": unsupported " + key + " " + row.options[key]);
    }
    selected.set(indexed.id, { id: indexed.id, logicalName: indexed.logicalName, contractPath: indexed.contractPath, rendererKey: runtime.rendererKey, implementation: runtime.source.split("#")[0], contract, readiness });
  }

  const files = new Map();
  const runtimeBase = "components/_runtime";
  const add = (file, contents, source = null, sourceBytes = null) => {
    safePath(projectRoot, file);
    files.set(file, { contents, source, sourceSha256: sourceBytes === null ? null : digest(sourceBytes), sha256: digest(contents) });
  };
  const bareModules = { "@text-to-ui/component-contracts/titlebar-segments": "packages/component-contracts/src/titlebar-segments.js" };
  const loadRuntime = (relative) => {
    if (["index.js", "advanced.js", "gallery.js"].some(name => relative === "packages/components-html/src/" + name)) throw new Error("Page runtime cannot depend on the full component registry or gallery: " + relative);
    const target = runtimeBase + "/" + relative;
    if (files.has(target)) return;
    const absolute = safePath(skillRoot, relative);
    const bytes = fs.readFileSync(absolute);
    let contents = bytes.toString("utf8");
    add(target, contents, relative, bytes);
    const dependencies = [...contents.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|@import\s+(?:url\(\s*)?["']([^"']+)["']/g)];
    for (const match of dependencies) {
      const specifier = match[1] ?? match[2] ?? match[3];
      const dependency = specifier.startsWith(".") ? posix(path.normalize(path.join(path.dirname(relative), specifier))) : bareModules[specifier];
      if (!dependency) throw new Error("Unresolved runtime import " + specifier + " in " + relative);
      safePath(skillRoot, dependency);
      if (!specifier.startsWith(".")) contents = contents.split(JSON.stringify(specifier)).join(JSON.stringify(relativeImport(relative, dependency)));
      loadRuntime(dependency);
    }
    add(target, contents, relative, bytes);
  };
  for (const entry of [
    "packages/components-html/src/color-references/index.js",
    "packages/components-html/src/shared/disclosure-behavior.js",
    "packages/components-html/src/shared/sidebar-behavior.js",
    "packages/components-html/src/runtime.js", "packages/components-html/src/input/behavior.js",
    "packages/components-html/src/titlebar-overflow.js", "packages/components-html/src/styles.css",
    "packages/components-html/src/pattern-shell.css", "packages/pattern-runtime/src/index.js",
    "packages/pattern-runtime/src/styles.css", "packages/tokens/src/index.css",
    "packages/component-styles/src/index.css"
  ]) loadRuntime(entry);
  add("components/package.json", json({ private: true, type: "module" }));
  const ordered = [...selected.values()].sort((a, b) => a.id.localeCompare(b.id));
  ordered.forEach((component) => {
    const file = "components/" + component.id + "/index.js";
    loadRuntime(component.implementation);
    const runtime = relativeImport(file, runtimeBase + "/" + component.implementation);
    add(file, 'import { render as renderComponent } from ' + JSON.stringify(runtime) + ';\nexport const componentId = ' + JSON.stringify(component.id) + ';\nexport const logicalName = ' + JSON.stringify(component.logicalName) + ';\nexport const render = (options = {}) => renderComponent(options);\nexport default render;\n');
    const contractBytes = fs.readFileSync(path.join(skillRoot, component.contractPath));
    add("components/" + component.id + "/contract.json", contractBytes, component.contractPath, contractBytes);
  });
  const imports = ordered.map((component, index) => 'import { render as render' + index + ' } from "./' + component.id + '/index.js";');
  const entries = ordered.map((component, index) => JSON.stringify(component.id) + ": render" + index);
  add("components/index.js", [
    ...imports,
    'export { bindColorReferences } from "./_runtime/packages/components-html/src/color-references/index.js";',
    'export { selectSidebarItem } from "./_runtime/packages/components-html/src/shared/sidebar-behavior.js";',
    'export { toggleDisclosure } from "./_runtime/packages/components-html/src/shared/disclosure-behavior.js";',
    'export { collectHtmlComponentEvidence } from "./_runtime/packages/components-html/src/runtime.js";',
    'export { bindInputTagEntry } from "./_runtime/packages/components-html/src/input/behavior.js";',
    'export { bindTitlebarOverflow } from "./_runtime/packages/components-html/src/titlebar-overflow.js";',
    "const components = Object.freeze({ " + entries.join(", ") + " });",
    "export const selectedComponentIds = Object.freeze(Object.keys(components));",
    "export function renderHtmlComponent(id, options = {}) {",
    '  if (!Object.hasOwn(components, id)) throw new Error("Component is not prepared for this page: " + id);',
    "  return components[id](options);",
    "}", ""
  ].join("\n"));
  const manifest = {
    schemaVersion: 1, kind: "text-to-ui-page-components",
    inputs: {
      context: { path: posix(path.relative(projectRoot, path.resolve(contextPath))), sha256: digest(fs.readFileSync(contextPath)) },
      bindings: bindingsPath ? { path: posix(path.relative(projectRoot, path.resolve(bindingsPath))), sha256: digest(fs.readFileSync(bindingsPath)) } : null
    },
    route: { workflow: context.route.workflowRouteId, task: context.route.id, pattern: context.layout.id },
    sharedRuntime: "Selected component implementation modules and their transitive dependencies are copied once; the full registry and gallery are excluded.",
    components: ordered.map(({ contract, ...entry }) => ({ ...entry, module: "components/" + entry.id + "/index.js", contract: "components/" + entry.id + "/contract.json" })),
    files: Object.fromEntries([...files.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([file, { contents, ...metadata }]) => [file, metadata]))
  };
  return { projectRoot, files, manifest };
}

export function assertDynamicPageHost(projectRoot) {
  const file = path.join(projectRoot, "index.html");
  if (!fs.existsSync(file)) throw new Error("Dynamic page requires index.html with #app and an external module");
  const html = fs.readFileSync(file, "utf8");
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1];
  if (body === undefined || !/<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["'][^"']+["'])[^>]*>\s*<\/script>/i.test(body)) throw new Error("index.html must load an external ES module");
  const mount = /<div\b(?=[^>]*\bid=["']app["'])[^>]*>\s*<\/div>/gi;
  if (!mount.test(body)) throw new Error("index.html requires an empty #app mount");
  const remainder = body.replace(/<!--[\s\S]*?-->/g, "").replace(mount, "").replace(/<script\b(?=[^>]*\bsrc=["'][^"']+["'])[^>]*>\s*<\/script>/gi, "").trim();
  if (remainder) throw new Error("index.html must be a host only; move screen markup into dynamic page/component modules");
  return { host: file, mount: "#app", rendering: "dynamic-local-components" };
}

export function verifyPageComponents(options) {
  const plan = planPageComponents(options);
  const file = path.join(plan.projectRoot, "components/component-manifest.json");
  if (!fs.existsSync(file) || json(read(file)) !== json(plan.manifest)) throw new Error("Page component manifest is stale; prepare components again");
  for (const [relative, entry] of plan.files) {
    const full = safePath(plan.projectRoot, relative);
    if (!fs.existsSync(full) || digest(fs.readFileSync(full)) !== entry.sha256) throw new Error("Prepared component changed: " + relative);
  }
  return plan.manifest;
}

export function preparePageComponents(options) {
  const plan = planPageComponents(options);
  const manifestFile = path.join(plan.projectRoot, "components/component-manifest.json");
  const previous = fs.existsSync(manifestFile) ? read(manifestFile) : null;
  if (previous && previous.kind !== plan.manifest.kind) throw new Error("Unrecognized component manifest");
  for (const relative of new Set([...Object.keys(previous?.files ?? {}), ...plan.files.keys()])) {
    const full = safePath(plan.projectRoot, relative);
    if (fs.existsSync(full)) {
      if (fs.lstatSync(full).isSymbolicLink()) throw new Error("Refusing a managed symlink: " + relative);
      const hash = digest(fs.readFileSync(full));
      if (hash !== previous?.files?.[relative]?.sha256 && hash !== plan.files.get(relative)?.sha256) throw new Error("Preserve edited or unowned component file: " + relative);
    }
  }
  const managed = new Set([...Object.keys(previous?.files ?? {}), ...plan.files.keys(), "components/component-manifest.json"]);
  const backup = new Map([...managed].map((relative) => {
    const file = safePath(plan.projectRoot, relative);
    return [relative, fs.existsSync(file) ? fs.readFileSync(file) : null];
  }));
  const rollback = () => {
    for (const [relative, contents] of backup) {
      const file = safePath(plan.projectRoot, relative);
      if (contents === null) fs.rmSync(file, { force: true });
      else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents); }
    }
  };
  try {
    for (const relative of Object.keys(previous?.files ?? {})) if (!plan.files.has(relative)) fs.rmSync(safePath(plan.projectRoot, relative), { force: true });
    for (const [relative, entry] of plan.files) {
      const full = safePath(plan.projectRoot, relative);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, entry.contents);
    }
    fs.writeFileSync(manifestFile, json(plan.manifest));
    verifyPageComponents(options);
  } catch (error) { rollback(); throw error; }
  return { path: manifestFile, sha256: digest(fs.readFileSync(manifestFile)), componentCount: plan.manifest.components.length, fileCount: plan.files.size, rollback };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project || !args.context) throw new Error("Usage: prepare-page-components.mjs --project <dir> --context <packet.json> [--bindings <bindings.json>] [--skill-root <dir>] [--check]");
  const options = { projectRoot: args.project, contextPath: args.context, bindingsPath: args.bindings || null, skillRoot: args["skill-root"] || ownRoot };
  const result = args.check ? { ok: true, componentCount: verifyPageComponents(options).components.length } : { ok: true, ...preparePageComponents(options) };
  console.log(json(result));
}
