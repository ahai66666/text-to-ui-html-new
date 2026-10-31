import fs from "node:fs";
import path from "node:path";
import { rendererPackage, styleImports } from "./html-renderer-contract.mjs";

export function loadComponentContract(skillRoot, repoRoot, indexedComponent) {
  const candidates = [];
  if (indexedComponent?.contractPath) {
    const local = path.resolve(skillRoot, indexedComponent.contractPath);
    const skillBase = `${path.resolve(skillRoot)}${path.sep}`;
    if (!local.startsWith(skillBase)) throw new Error(`Unsafe component contract path: ${indexedComponent.contractPath}`);
    candidates.push(local);
  }

  const legacyPointer = indexedComponent?.contractPointer;
  if (legacyPointer) {
    const [relativePath] = legacyPointer.split("#");
    candidates.push(path.resolve(repoRoot, relativePath));
  }

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const component = JSON.parse(fs.readFileSync(candidate, "utf8"));
    if (component.id !== indexedComponent.id) throw new Error(`Contract id mismatch at ${candidate}: expected ${indexedComponent.id}, found ${component.id}`);
    return component;
  }

  const aggregatePath = path.join(repoRoot, "packages/component-contracts/src/components.json");
  if (fs.existsSync(aggregatePath)) {
    const registry = JSON.parse(fs.readFileSync(aggregatePath, "utf8"));
    const component = registry.components?.find((item) => item.id === indexedComponent?.id);
    if (component) return component;
  }
  throw new Error(`Component contract not found for '${indexedComponent?.id ?? "unknown"}'.`);
}

export function resolveHtmlComponentRuntime(skillRoot, repoRoot, contract) {
  const source = contract?.implementations?.html || contract?.frameworks?.html?.source || null;
  const sourcePath = source?.split("#")[0];
  const exists = Boolean(sourcePath && (
    fs.existsSync(path.join(skillRoot, sourcePath)) || fs.existsSync(path.join(repoRoot, sourcePath))
  ));
  return {
    package: rendererPackage,
    source,
    exists,
    status: contract?.frameworks?.html?.status || contract?.status,
    rendererKey: contract?.id,
    factoryImport: "renderHtmlComponent",
    styleImports
  };
}
