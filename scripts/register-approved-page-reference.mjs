#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const id = valueFor("--id");
const title = valueFor("--title");
const source = valueFor("--source");
const rationale = valueFor("--rationale");
const approvedBy = valueFor("--approved-by");
if (!id || !title || !source || !rationale || !approvedBy) {
  throw new Error("Usage: register-approved-page-reference.mjs --id <stable-page-id> --title <title> --source <approved-file-or-directory> --rationale <reason> --approved-by <user>");
}
if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(id)) throw new Error("Reference id must use lowercase letters, numbers, and hyphens");
if (approvedBy !== "user") throw new Error("Approved page references require explicit --approved-by user");
const sourcePath = path.resolve(source);
if (!fs.existsSync(sourcePath)) throw new Error(`Approved source does not exist: ${sourcePath}`);
const referencesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../references/approved-pages");
const indexPath = path.join(referencesRoot, "index.json");
const targetRoot = path.join(referencesRoot, id);
if (fs.existsSync(targetRoot)) throw new Error(`Reference already exists: ${id}`);
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
if (index.references.some((entry) => entry.id === id)) throw new Error(`Reference id is already registered: ${id}`);
const artifactRoot = path.join(targetRoot, "artifacts");
fs.mkdirSync(targetRoot, { recursive: true });
const excluded = new Set([".git", "node_modules", "dist", ".text-to-ui"]);
fs.cpSync(sourcePath, artifactRoot, { recursive: true, filter: (candidate) => !excluded.has(path.basename(candidate)) });
const sha256 = crypto.createHash("sha256").update(JSON.stringify({ id, title, rationale })).digest("hex");
const card = {
  schemaVersion: 1,
  kind: "text-to-ui-approved-page-reference",
  id,
  title,
  rationale,
  approvedBy: "user",
  approvedAt: new Date().toISOString(),
  sourceKind: fs.statSync(sourcePath).isDirectory() ? "directory" : "file",
  artifactPath: "artifacts",
  referenceDigest: sha256,
  usePolicy: "explicit-only; cannot override Pattern, component, Token, or behavior contracts"
};
fs.writeFileSync(path.join(targetRoot, "reference.json"), `${JSON.stringify(card, null, 2)}\n`);
index.references.push({ id, title, path: `references/approved-pages/${id}/reference.json`, referenceDigest: sha256 });
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, id, reference: path.join(targetRoot, "reference.json") }, null, 2));
