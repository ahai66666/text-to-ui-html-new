#!/usr/bin/env node
// No dependency installation or generated project required. Bind to loopback only.
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
if (argv.includes("--help")) { console.log("preview-components.mjs [--port 4191] [--component button]"); process.exit(0); }
function argument(name, fallback) {
  const at = argv.indexOf(name);
  if (at < 0) return fallback;
  if (!argv[at + 1] || argv[at + 1].startsWith("--")) throw new Error(`Missing ${name} value`);
  return argv[at + 1];
}
const port = Number(argument("--port", "4191"));
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid port");
const contractRoot = path.join(root, "packages/component-contracts/src/components");
const contracts = await Promise.all((await fs.readdir(contractRoot)).filter(f => f.endsWith(".json")).map(async file => JSON.parse(await fs.readFile(path.join(contractRoot, file), "utf8"))));
const components = contracts.map(({id, logicalName, category, categoryLabel, order}) => ({id, logicalName, category, categoryLabel, order})).sort((a,b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
const registryPolicy = JSON.parse(await fs.readFile(path.join(root, "packages/component-contracts/src/registry.json"), "utf8")).registryPolicy;
const readinessPolicy = JSON.parse(await fs.readFile(path.join(root, "references/components/component-readiness-policy.json"), "utf8"));
const ids = new Set(components.map(c => c.id));
const selected = argument("--component", "button");
if (!ids.has(selected)) throw new Error(`Unknown component: ${selected}`);
const galleryRoot = path.join(root, "apps/component-gallery");
const packagesRoot = path.join(root, "packages");
const inside = (parent, child) => child.startsWith(parent + path.sep);
const types = {".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".woff2":"font/woff2"};
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, {Allow:"GET, HEAD"}); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    if (pathname === "/api/components") {
      res.setHeader("Content-Type", types[".json"]);
      res.end(req.method === "HEAD" ? undefined : JSON.stringify({components,registryPolicy,readinessPolicy})); return;
    }
    if (pathname === "/api/patterns") {
      res.setHeader("Content-Type", types[".json"]);
      res.end(req.method === "HEAD" ? undefined : await fs.readFile(path.join(root,"assets/design-system/pattern-contracts.json"))); return;
    }
    let target = pathname === "/" ? path.join(galleryRoot, "index.html") : path.resolve(root, "." + pathname);
    target = await fs.realpath(target);
    if (!inside(galleryRoot, target) && !inside(packagesRoot, target)) { res.writeHead(404); res.end("Not found"); return; }
    const body = await fs.readFile(target);
    res.setHeader("Content-Type", types[path.extname(target)] || "application/octet-stream");
    res.end(req.method === "HEAD" ? undefined : body);
  } catch { res.writeHead(404); res.end("Not found"); }
});
server.on("error", error => { console.error(error.code === "EADDRINUSE" ? `Port ${port} is in use; choose --port <another-port>.` : error.message); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log(`Component preview: http://127.0.0.1:${server.address().port}/apps/component-gallery/index.html#${selected}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
