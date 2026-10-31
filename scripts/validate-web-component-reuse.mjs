import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { assertReadinessStage, loadReadinessPolicy, resolveComponentReadiness } from "./component-readiness-policy.mjs";
import { componentPackageDigest } from "./component-selection.mjs";
import { fileURLToPath } from "node:url";
import { verifyPageComponents } from "./prepare-page-components.mjs";
import { verifyPageStyles } from "./prepare-page-styles.mjs";

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const manifestArg = valueFor("--manifest");
const projectRoot = fs.realpathSync(path.resolve(valueFor("--project-root") ?? process.cwd()));
const validationStage = valueFor("--stage") ?? "fast-preview";
assertReadinessStage(validationStage);
if (!manifestArg) {
  console.error("Usage: validate-web-component-reuse.mjs --manifest <file> [--project-root <dir>]");
  process.exit(2);
}

const manifestPath = fs.realpathSync(path.resolve(manifestArg));
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = readJson(manifestPath);
const failures = [];
const warnings = [];
const packageByTarget = { html: "@text-to-ui/components-html" };

if (![1, 2, 3].includes(manifest.schemaVersion)) failures.push("schemaVersion must equal 1, 2, or 3");
const strictSource = manifest.schemaVersion >= 2 || manifest.enforcement === "strict-source";
if (manifest.schemaVersion === 2 && manifest.targetFramework !== "html") failures.push("strict-source schemaVersion 2 supports html only");
if (manifest.targetFramework !== "html") failures.push("text-to-ui-html supports HTML components only");
if (manifest.previousOutputReuse !== false) failures.push("previousOutputReuse must be false unless a separately approved continuation contract is used");

const approvedPatterns = new Set(["pattern-a-two-pane", "pattern-b-three-pane", "pattern-c-tool-workspace", "pattern-d-inspector"]);
const normalizePane = (value) => ({ navigation: "primary-navigation", primary: "primary-navigation", list: "secondary-list", detail: "main-detail", main: "main-content", workspace: "tool-workspace", canvas: "secondary-or-canvas" }[value] || value);
if (strictSource) {
  const layout = manifest.layout;
  if (!layout || typeof layout !== "object") failures.push("strict-source component-usage.layout is required");
  else {
    if (!approvedPatterns.has(layout.pattern)) failures.push("component-usage.layout.pattern must be a canonical Pattern ID");
    if (!Array.isArray(layout.paneOrder) || layout.paneOrder.length === 0) failures.push("component-usage.layout.paneOrder must declare the selected Pattern panes");
    if (!layout.contractPath) failures.push("component-usage.layout.contractPath is required");
    const contractPath = layout.contractPath ? path.resolve(path.dirname(manifestPath), layout.contractPath) : null;
    if (contractPath && !fs.existsSync(contractPath)) failures.push(`layout contract not found: ${contractPath}`);
    if (contractPath && fs.existsSync(contractPath)) {
      const contract = readJson(contractPath);
      if (contract.pattern !== layout.pattern) failures.push("component-usage.layout.pattern must equal layout-contract.pattern");
      if (JSON.stringify(contract.paneOrder) !== JSON.stringify(layout.paneOrder)) failures.push("component-usage.layout.paneOrder must equal layout-contract.paneOrder");
      for (const [groupName, entries] of [["registered", manifest.registered], ["contractBased", manifest.contractBased], ["custom", manifest.custom]]) for (const [index, entry] of (Array.isArray(entries) ? entries : []).entries()) {
        const regions = entry.regions || (entry.region ? [entry.region] : entry.pane ? [entry.pane] : []);
        for (const region of regions) if (!contract.paneOrder.includes(normalizePane(region))) failures.push(`${groupName}[${index}] region '${region}' is outside the selected Pattern pane order`);
      }
    }
  }
}

const registryRelative = manifest.registry ?? "packages/component-contracts/src/components.json";
const registryPath = path.resolve(projectRoot, registryRelative);
if (!fs.existsSync(registryPath)) failures.push(`component registry not found: ${registryPath}`);
let registry = [];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
let selectionReceipt = null;
if (manifest.schemaVersion === 3) {
  const selection = manifest.selection;
  const selectionPath = selection?.path ? path.resolve(path.dirname(manifestPath), selection.path) : null;
  if (!selectionPath || !fs.existsSync(selectionPath)) failures.push("strict Web usage requires a component selection receipt");
  else {
    const contents = fs.readFileSync(selectionPath);
    if (sha256(contents) !== selection.sha256) failures.push("component selection receipt hash mismatch");
    else selectionReceipt = JSON.parse(contents);
  }
  if (selection?.registryDigest && fs.existsSync(registryPath) && sha256(fs.readFileSync(registryPath)) !== selection.registryDigest) failures.push("component registry has changed since selection");
  if (selectionReceipt?.targetFramework !== manifest.targetFramework) failures.push("component selection target mismatch");
  if (selectionReceipt && packageByTarget[manifest.targetFramework]) {
    try {
      if (selectionReceipt.packageDigest !== componentPackageDigest(projectRoot)) failures.push("component package source has changed since selection");
    } catch (error) { failures.push(error.message); }
  }
  for (const item of selectionReceipt?.entries ?? []) if (!["reuse", "page-composite"].includes(item.decision)) failures.push(`component selection remains pending: ${item.id}=${item.decision}`);
}
if (fs.existsSync(registryPath)) {
  const parsed = readJson(registryPath);
  registry = Array.isArray(parsed) ? parsed : parsed.components ?? [];
}
const skillRoot = fs.realpathSync(path.resolve(valueFor("--skill-root") ?? (fs.existsSync(path.join(projectRoot, "references/routes/index.json")) ? projectRoot : path.join(projectRoot, "skill-support"))));
const readinessPolicy = loadReadinessPolicy(skillRoot);
const registryByLogicalName = new Map(registry.map((item) => [item.logicalName, item]));
const normalizeCapability = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const registryCapabilityMatches = (query) => {
  const normalized = normalizeCapability(query);
  if (!normalized) return [];
  return registry.filter((item) => {
    const names = [item.id, item.logicalName, String(item.logicalName ?? "").split("/")[0]];
    return names.some((name) => normalizeCapability(name) === normalized);
  });
};

const registered = Array.isArray(manifest.registered) ? manifest.registered : [];
for (const [index, usage] of registered.entries()) {
  if (!usage.logicalName) {
    failures.push(`registered[${index}].logicalName is required`);
    continue;
  }
  const contract = registryByLogicalName.get(usage.logicalName);
  if (!contract) {
    failures.push(`registered component is not in the canonical registry: ${usage.logicalName}`);
    continue;
  }
  const implementation = contract.implementations?.html ?? contract.frameworks?.html?.source;
  if (!implementation) failures.push(`${usage.logicalName} has no HTML implementation`);
  const readiness = resolveComponentReadiness(contract, readinessPolicy);
  if (!readiness.allowedStages.includes(validationStage)) failures.push(`${usage.logicalName} readiness is ${readiness.level} and is not allowed at ${validationStage}: ${readiness.reason}`);
  else if (readiness.level === "provisional") warnings.push(`${usage.logicalName} is provisional and preview-only: ${readiness.unresolvedDimensions.join(", ")}`);
  if (strictSource && usage.readinessLevel && usage.readinessLevel !== readiness.level) failures.push(`${usage.logicalName} readinessLevel is stale; expected ${readiness.level}`);
  if (strictSource && Array.isArray(usage.unresolvedParity) && JSON.stringify(usage.unresolvedParity) !== JSON.stringify(readiness.unresolvedDimensions)) failures.push(`${usage.logicalName} unresolvedParity is stale`);
  if (strictSource) {
    if (manifest.targetFramework === "html" && !usage.rendererKey) failures.push(`registered[${index}].rendererKey is required in strict-source mode`);
    if (!usage.usage) failures.push(`registered[${index}].usage is required in strict-source mode`);
    if (!Number.isInteger(usage.requiredCallSites) || usage.requiredCallSites < 1) failures.push(`registered[${index}].requiredCallSites must be a positive integer`);
    if (manifest.schemaVersion === 3) for (const id of String(usage.usage ?? "").split(/,\s*/).filter(Boolean)) {
      if (!selectionReceipt?.entries?.some((item) => item.id === id && item.logicalName === usage.logicalName && item.decision === "reuse")) failures.push(`registered component ${usage.logicalName} lacks a matching reuse selection for ${id}`);
    }
  }
}

const validatePageOwnedBase = (usage, label, index) => {
  if (!usage.id) failures.push(`${label}[${index}].id is required`);
  if (!usage.missingCapability) failures.push(`${label}[${index}].missingCapability is required`);
  if (!Array.isArray(usage.registryQueries) || usage.registryQueries.length === 0) failures.push(`${label}[${index}].registryQueries must document registry discovery`);
  if (!Array.isArray(usage.tokenRoles) || usage.tokenRoles.length === 0) failures.push(`${label}[${index}].tokenRoles must list shared Token roles`);
  if (!Array.isArray(usage.reviewedCandidates)) failures.push(`${label}[${index}].reviewedCandidates must be an array`);
  else for (const [candidateIndex, candidate] of usage.reviewedCandidates.entries()) {
    if (!candidate.logicalName || !registryByLogicalName.has(candidate.logicalName)) failures.push(`${label}[${index}].reviewedCandidates[${candidateIndex}] must name a registered logicalName`);
    if (!candidate.rejectionReason) failures.push(`${label}[${index}].reviewedCandidates[${candidateIndex}].rejectionReason is required`);
  }
  if (!["page-owned", "promote-to-library"].includes(usage.disposition)) failures.push(`${label}[${index}].disposition must be page-owned or promote-to-library`);
};

const contractBased = Array.isArray(manifest.contractBased) ? manifest.contractBased : [];
for (const [index, usage] of contractBased.entries()) {
  validatePageOwnedBase(usage, "contractBased", index);
  if (!usage.contractLogicalName || !registryByLogicalName.has(usage.contractLogicalName)) failures.push(`contractBased[${index}].contractLogicalName must name a canonical contract`);
  if (!usage.contractEvidence || typeof usage.contractEvidence !== "string") failures.push(`contractBased[${index}].contractEvidence is required`);
}
const custom = Array.isArray(manifest.custom) ? manifest.custom : [];
for (const [index, usage] of custom.entries()) {
  validatePageOwnedBase(usage, "custom", index);
  if (!Array.isArray(usage.contractQueries) || usage.contractQueries.length === 0) failures.push(`custom[${index}].contractQueries must prove no matching contract exists`);
  if (strictSource && !["no-matching-component", "specialized-business-surface"].includes(usage.exceptionKind)) failures.push(`custom[${index}].exceptionKind must be no-matching-component or specialized-business-surface`);
  for (const query of usage.registryQueries ?? []) {
    const availableMatches = registryCapabilityMatches(query).filter((item) => {
      const implementation = item.implementations?.html ?? item.frameworks?.html?.source;
      return implementation && item.readiness?.sourceReady === true;
    });
    if (availableMatches.length) failures.push(`custom[${index}] overlaps available ${manifest.targetFramework} component(s) for query '${query}': ${availableMatches.map((item) => item.logicalName).join(", ")}; use the registered component or a contract-based composition`);
  }
}
if (registered.length + contractBased.length + custom.length === 0) failures.push("component-usage must declare at least one registered, contractBased, or custom UI region");

const sourceRoots = Array.isArray(manifest.sourceRoots) ? manifest.sourceRoots : [];
if (sourceRoots.length === 0) failures.push("sourceRoots must contain at least one editable source directory or file");
const sourceExtensions = new Set([".html", ".js", ".mjs"]);
const sourceFiles = [];
const styleFiles = [];
const collect = (candidate) => {
  if (!fs.existsSync(candidate)) { failures.push(`source root not found: ${candidate}`); return; }
  candidate = fs.realpathSync(candidate);
  const stat = fs.statSync(candidate);
  if (stat.isFile()) { if (sourceExtensions.has(path.extname(candidate))) sourceFiles.push(candidate); return; }
  for (const entry of fs.readdirSync(candidate, { withFileTypes: true })) {
    if (["node_modules", "dist", "coverage", ".git"].includes(entry.name)) continue;
    collect(path.join(candidate, entry.name));
  }
};
for (const root of sourceRoots) collect(path.resolve(projectRoot, root));
const collectStyles = (candidate) => {
  if (!fs.existsSync(candidate)) return;
  candidate = fs.realpathSync(candidate);
  const stat = fs.statSync(candidate);
  if (stat.isFile()) { if (path.extname(candidate) === ".css") styleFiles.push(candidate); return; }
  for (const entry of fs.readdirSync(candidate, { withFileTypes: true })) {
    if (["node_modules", "dist", "coverage", ".git"].includes(entry.name)) continue;
    collectStyles(path.join(candidate, entry.name));
  }
};
for (const root of sourceRoots) collectStyles(path.resolve(projectRoot, root));
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const registeredSelector = /\.tui-(?:button|sidebar-item|primary-navigation-item|list-card|item|checkbox|attachment|titlebar|search)\b/;
const protectedComponentProperties = new Set([
  "height", "min-height", "max-height", "padding", "padding-block", "padding-inline", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-width", "border-color", "border-radius", "background", "background-color", "color", "font", "font-size", "font-weight", "line-height", "box-shadow"
]);
for (const file of styleFiles) {
  const css = fs.readFileSync(file, "utf8");
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!registeredSelector.test(selector)) continue;
    const protectedOverrides = [...match[2].matchAll(/(?:^|;)\s*([a-z-]+)\s*:/g)].map((entry) => entry[1]).filter((property) => protectedComponentProperties.has(property));
    if (protectedOverrides.length) failures.push(`page-owned CSS overrides protected registered-component properties in ${path.relative(projectRoot, file)}: ${selector} -> ${[...new Set(protectedOverrides)].join(", ")}; use component Props, Slots, or Tokens`);
  }
}
const expectedPackage = packageByTarget[manifest.targetFramework];
const hasImport = (packageName) => {
  const escapedPackage = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:import\\s+(?:["']|[\\s\\S]*?\\s+from\\s*["']|\\(\\s*["'])|require\\s*\\(\\s*["']|@import\\s+["'])${escapedPackage}(?:\\/[^"']*)?["']`).test(source);
};
let verifiedLocalBundle = false;
let verifiedStyles = false;
if (manifest.renderer?.bundle) {
  try {
    const bundlePath = path.resolve(path.dirname(manifestPath), manifest.renderer.bundle.path);
    const bundleBytes = fs.readFileSync(bundlePath);
    if (sha256(bundleBytes) !== manifest.renderer.bundle.sha256) throw new Error("Local component bundle hash mismatch");
    const bundle = JSON.parse(bundleBytes);
    const pageRoot = path.dirname(path.dirname(bundlePath));
    verifyPageComponents({
      projectRoot: pageRoot,
      contextPath: path.resolve(pageRoot, bundle.inputs.context.path),
      bindingsPath: bundle.inputs.bindings ? path.resolve(pageRoot, bundle.inputs.bindings.path) : null,
      skillRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
    });
    const expectedLocalModule = path.join(pageRoot, "components/index.js");
    const localImports = sourceFiles.flatMap((file) => [...fs.readFileSync(file, "utf8").matchAll(/import\s*\{[^}]*\brenderHtmlComponent\b[^}]*\}\s*from\s*["']([^"']+)["']/g)].map((match) => path.resolve(path.dirname(file), match[1])));
    if (!localImports.includes(expectedLocalModule)) throw new Error("Page must import the verified local component registry");
    const importedPaths = new Set(sourceFiles.flatMap((file) => [...fs.readFileSync(file, "utf8").matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']/g)].map((match) => path.resolve(path.dirname(file), match[1] ?? match[2]))));
    if (manifest.renderer.styles) {
      const stylePath = path.resolve(path.dirname(manifestPath), manifest.renderer.styles.path);
      if (stylePath !== path.join(pageRoot, "styles/style-manifest.json")) throw new Error("Unexpected style manifest location");
      if (sha256(fs.readFileSync(stylePath)) !== manifest.renderer.styles.sha256) throw new Error("Style manifest hash mismatch");
      verifyPageStyles({ projectRoot: pageRoot, skillRoot });
      if ([...importedPaths].some((file) => file.endsWith(".css"))) throw new Error("Page composition modules must leave CSS loading to main.js");
      verifiedStyles = true;
    } else {
    for (const relative of ["tokens/src/index.css", "components-html/src/styles.css", "components-html/src/pattern-shell.css", "pattern-runtime/src/styles.css"]) {
      if (!importedPaths.has(path.join(pageRoot, "components/_runtime/packages", relative))) throw new Error("Missing verified local style import: " + relative);
    }
    }
    verifiedLocalBundle = true;
  } catch (error) { failures.push(error.message); }
}
const hasProductionImport = Boolean(expectedPackage && hasImport(expectedPackage)) || verifiedLocalBundle;
if (registered.length > 0 && expectedPackage && !hasProductionImport) failures.push(`editable page source must import ${expectedPackage}; contract markers, comments, or copied markup are not reuse evidence`);
if (registered.length > 0 && /data-(?:logical-)?component\s*=/.test(source) && !hasProductionImport) failures.push("data-component markers exist without a production component-package import");
if (contractBased.length + custom.length > 0) {
  if (!verifiedStyles && !hasImport("@text-to-ui/tokens") && !(verifiedLocalBundle && hasImport(manifest.renderer.localTokenImport))) failures.push("contractBased and custom source must import @text-to-ui/tokens");
  if (!verifiedStyles && !hasImport("@text-to-ui/component-styles") && !(verifiedLocalBundle && hasImport(manifest.renderer.localComponentStyleImport))) failures.push("contractBased and custom source must import @text-to-ui/component-styles");
}

if (strictSource) {
  const renderer = manifest.renderer ?? {};
  if (renderer.package !== expectedPackage) failures.push(`renderer.package must equal ${expectedPackage}`);
  const code = sourceFiles.map((file) => fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "")).join("\n");
  {
    if (renderer.factoryImport !== "renderHtmlComponent") failures.push("renderer.factoryImport must equal renderHtmlComponent");
    for (const styleImport of (verifiedLocalBundle ? [] : ["@text-to-ui/tokens", "@text-to-ui/components-html/styles.css", "@text-to-ui/components-html/pattern-shell.css"])) {
      if (!hasImport(styleImport)) failures.push(`strict HTML source must import ${styleImport}`);
    }
    if (!verifiedLocalBundle && !/import\s*\{[^}]*\brenderHtmlComponent\b[^}]*\}\s*from\s*["']@text-to-ui\/components-html["']/.test(code)) failures.push("strict HTML source must import the renderHtmlComponent factory");
  }
  for (const usage of registered) {
    const identifier = usage.rendererKey;
    if (!identifier) continue;
    const factoryCalls = (code.match(/renderHtmlComponent\s*\(/g) ?? []).length;
    const adapterCalls = (code.match(/(?:component|renderComponent)\s*\(/g) ?? []).length;
    const calls = factoryCalls + adapterCalls;
    if (!code.includes('"' + identifier + '"') && !code.includes("'" + identifier + "'")) failures.push("registered renderer key is missing from editable source: " + identifier);
    if (calls < (usage.requiredCallSites ?? 1)) failures.push(`registered component is declared but never rendered enough times: ${usage.logicalName}; expected call sites=${usage.requiredCallSites ?? 1}; found=${calls}`);
  }
  const renderedVariables = [...source.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:node\s*\(\s*)?(?:renderHtmlComponent|component|renderComponent)\s*\(/g)].map((match) => match[1]);
  for (const variable of renderedVariables) {
    const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escapedVariable}\\s*\\.\\s*(?:replaceChildren\\s*\\(|innerHTML\\s*=)`).test(source)) failures.push(`rendered component '${variable}' is destructively rewritten; pass business content through renderer props or slots`);
  }
  if (/<(?:button|nav|article|header|div|label)[^>]+class\s*=\s*["'][^"']*\btui-(?:button|sidebar|list-card|item|checkbox|attachment|titlebar)\b/i.test(source)) failures.push("strict source contains handwritten registered-component markup; call the renderer instead");
}

if (failures.length > 0) {
  console.error("Web component reuse validation failed");
  failures.forEach((failure) => console.error(`- ${failure}`));
  warnings.forEach((warning) => console.error(`warning: ${warning}`));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, validationStage, deliveryStatus: validationStage === "release" ? "release-ready" : (warnings.length ? "preview-ready-with-provisional-components" : "preview-ready"), enforcement: strictSource ? "strict-source" : "legacy-import", targetFramework: manifest.targetFramework, componentPackage: expectedPackage, registeredCount: registered.length, contractBasedCount: contractBased.length, customCount: custom.length, sourceFileCount: sourceFiles.length, styleFileCount: styleFiles.length, warnings }, null, 2));
