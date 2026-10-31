#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const valueFor = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : null; };
if (!valueFor('--project') || !valueFor('--repo')) throw new Error('Usage: scaffold-standalone-project.mjs --project <dir> --repo <monorepo> [--entry <generated-entry.js>]');
const projectRoot = path.resolve(valueFor("--project"));
const repoRoot = path.resolve(valueFor("--repo"));
fs.mkdirSync(projectRoot, { recursive: true });
if (fs.existsSync(path.join(repoRoot, 'offline-runtime.json')) && !fs.existsSync(path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'))) {
  const bundledDependencies = path.join(repoRoot, 'node_modules');
  if (!fs.existsSync(path.join(bundledDependencies, 'vite', 'bin', 'vite.js'))) throw new Error('Offline bundle has no prepared Vite dependencies');
  fs.cpSync(bundledDependencies, path.join(projectRoot, 'node_modules'), { recursive: true, dereference: true });
}
const localComponentsRoot = path.resolve(valueFor("--components-root") || projectRoot);
if (localComponentsRoot && !fs.existsSync(path.join(localComponentsRoot, "components/component-manifest.json"))) throw new Error("Prepare the page components before scaffolding");
const packages = []; // Page components were prepared separately; do not copy full vendor packages.
const rootPackagePath = path.join(projectRoot, "package.json");
if (!fs.existsSync(rootPackagePath)) fs.writeFileSync(rootPackagePath, JSON.stringify({ name: 'text-to-ui-page', private: true, type: 'module' }, null, 2));
if (fs.existsSync(rootPackagePath)) {
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, "utf8"));
  rootPackage.dependencies ??= {};
  rootPackage.devDependencies ??= {};
  // Offline output does not require per-project dependencies.
  rootPackage.scripts ??= {};
  rootPackage.scripts.dev = rootPackage.scripts.dev ?? "vite --host 127.0.0.1";
  rootPackage.scripts.build = rootPackage.scripts.build ?? "vite build";
  rootPackage.scripts.verify = rootPackage.scripts.verify ?? "node scripts/verify.mjs";
  fs.writeFileSync(rootPackagePath, `${JSON.stringify(rootPackage, null, 2)}\n`);
}
const scriptsRoot = path.join(projectRoot, "scripts");
fs.mkdirSync(scriptsRoot, { recursive: true });
const writeNew = (name, content) => { const file = path.join(projectRoot, name); if (!fs.existsSync(file)) fs.writeFileSync(file, content); };
// A generated page may live inside a larger pnpm workspace. Create a local
// workspace boundary so installs resolve dependencies from this
// project instead of an ancestor's stale lockfile/package snapshot. Preserve an
// existing project-owned workspace file.
writeNew('pnpm-workspace.yaml', 'packages:\n  - "."\nallowBuilds:\n  esbuild: true\n');
const entry = valueFor('--entry') || './generated-entry.js';
if (path.isAbsolute(entry) || entry.split(/[\\/]/).includes('..')) throw new Error('--entry must be inside the project');
writeNew('index.html', '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>工作台</title></head><body><div id="app"></div><script type="module" src="./main.js"></script></body></html>');
writeNew('main.js', `import "./styles/index.css";\nimport { mountGeneratedPage } from ${JSON.stringify(entry.startsWith('./') ? entry : './' + entry)};\nmountGeneratedPage();\n`);
writeNew('vite.config.mjs', `import { defineConfig } from 'vite';
export default defineConfig({ base: './', plugins: [{
  name: 'text-to-ui-page-boundaries', enforce: 'pre',
  transform(code, id) {
    const file = id.split('?')[0];
    const normalized = file.replaceAll(String.fromCharCode(92), "/");
    if (normalized.includes("/components/_runtime/") || normalized.endsWith("/styles/index.css") || normalized.endsWith("/styles/base.css")) return;
    if (!file.endsWith('.css') || /[\\\\/]vendor[\\\\/]|[\\\\/]node_modules[\\\\/]/.test(file)) return;
    if (/\\[data-(?:pattern|tui-pane-role)|\\.tui-(?:pattern|sidebar|titlebar)\\b/.test(code)) this.error('Page CSS cannot override Pattern-owned selectors: ' + file);
  }
}], server: { host: '127.0.0.1' } });
`);
const verifyPath = path.join(scriptsRoot, "verify.mjs");
if (!fs.existsSync(verifyPath)) fs.writeFileSync(verifyPath, `import fs from "node:fs";
import path from "node:path";
const required = ["index.html", "html-page-manifest.json", "page-bindings.json", "page-blueprint.json", "page-content-recipes.json"];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) { console.error(JSON.stringify({ status: "blocked", gate: "generated-artifacts", missing }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ status: "preflight-ready", message: "Artifact inputs are complete. This command does not start a browser or replace verify-fast-preview runtime evidence." }, null, 2));
`);
console.log(JSON.stringify({ ok: true, projectRoot, packages: packages.map((name) => `@text-to-ui/${name}`) }, null, 2));
