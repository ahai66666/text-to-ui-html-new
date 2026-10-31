import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { resolveSkillRoot } from "./navigation-index-lib.mjs";

const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const digestTree = (directory) => {
  if (!fs.existsSync(directory)) throw new Error(`Component package source is missing: ${directory}`);
  const hash = crypto.createHash("sha256");
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile()) {
        hash.update(path.relative(directory, fullPath).replaceAll(path.sep, "/"));
        hash.update(fs.readFileSync(fullPath));
      }
    }
  };
  visit(directory);
  return hash.digest("hex");
};
const normalize = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const implementationFile = (repo, component) => {
  const pointer = component?.implementations?.html;
  return pointer ? path.join(repo, pointer.split("#")[0]) : null;
};
export const componentPackageDigest = (repo) => digestTree(path.join(repo, "packages/components-html/src"));

export function resolveComponentSelection({ repo, contextPath, bindingsPath, recipesPath, skillRoot: explicitSkillRoot }) {
  repo = fs.realpathSync(path.resolve(repo));
  const skillRoot = resolveSkillRoot(repo, explicitSkillRoot);
  const packageRoot = fs.existsSync(path.join(skillRoot, "packages/components-html/src/index.js")) ? skillRoot : repo;
  const registryPath = path.join(packageRoot, "packages/component-contracts/src/components.json");
  const rulesPath = path.join(skillRoot, "references/components/component-selection-rules.json");
  const indexPath = path.join(skillRoot, "references/index/generated/component-index.json");
  for (const file of [registryPath, rulesPath, indexPath, contextPath, bindingsPath]) {
    if (!fs.existsSync(file)) throw new Error(`Component selection requires ${file}; missing packages are not evidence that a component is absent`);
  }
  const context = JSON.parse(fs.readFileSync(contextPath, "utf8"));
  const input = JSON.parse(fs.readFileSync(bindingsPath, "utf8"));
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")).components;
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8")).components;
  const rules = JSON.parse(fs.readFileSync(rulesPath, "utf8")).rules;
  const framework = context.request?.framework;
  if (framework !== "html") throw new Error(`text-to-ui-html supports HTML only: ${framework}`);
  const packageDigest = componentPackageDigest(packageRoot);
  const byName = new Map(registry.map((item) => [item.logicalName, item]));
  const findCandidates = (query) => {
    const key = normalize(query);
    const names = new Set(index.filter((item) =>
      [item.id, item.logicalName, ...(item.capabilities ?? [])].some((name) => normalize(name) === key)
    ).map((item) => item.logicalName));
    for (const item of registry) if ([item.id, item.logicalName].some((name) => normalize(name) === key)) names.add(item.logicalName);
    return [...names].sort();
  };
  const entries = [];
  for (const [position, binding] of (input.componentBindings ?? input.components ?? input.bindings ?? []).entries()) {
    const bindingId = binding.id ?? `binding-${position + 1}`;
    const component = byName.get(binding.logicalName);
    const candidates = findCandidates(binding.capability ?? binding.logicalName);
    const reasons = [];
    if (!component) reasons.push("logicalName is not registered");
    const implementation = component && implementationFile(packageRoot, component);
    if (component && !implementation) reasons.push(`missing ${framework} implementation contract`);
    if (component && implementation && !fs.existsSync(implementation)) reasons.push(`missing ${framework} component package source`);
    const options = binding.options ?? {};
    const requiredProps = Object.keys(options);
    const requiredSlots = Object.keys(binding.slots ?? {});
    const requiredBehaviors = binding.requiredBehaviors ?? [];
    if (component) {
      const unsupportedProps = requiredProps.filter((name) => !(component.props ?? []).includes(name));
      const unsupportedSlots = requiredSlots.filter((name) => !(component.slots ?? []).includes(name));
      const unsupportedBehaviors = requiredBehaviors.filter((name) => !(component.behaviors ?? []).includes(name));
      if (unsupportedProps.length) reasons.push(`unsupported props: ${unsupportedProps.join(", ")}`);
      if (unsupportedSlots.length) reasons.push(`unsupported slots: ${unsupportedSlots.join(", ")}`);
      if (unsupportedBehaviors.length) reasons.push(`unsupported behaviors: ${unsupportedBehaviors.join(", ")}`);
      if (options.variant && !(component.variants ?? []).includes(options.variant)) reasons.push(`unsupported variant: ${options.variant}`);
      if (options.state && !(component.states ?? []).includes(options.state)) reasons.push(`unsupported state: ${options.state}`);
      const matchingRules = rules.filter((rule) => rule.logicalName === binding.logicalName);
      if (matchingRules.length && !binding.semanticContext) reasons.push("semantic context required");
      if (binding.semanticContext && matchingRules.length && !matchingRules.some((rule) => rule.context === binding.semanticContext)) reasons.push(`unregistered semantic context: ${binding.semanticContext}`);
    }
    const decision = !component ? (candidates.length ? "blocked" : "new-shared")
      : implementation && !fs.existsSync(implementation) ? "blocked" : reasons.length ? "extend-existing" : "reuse";
    entries.push({
      id: bindingId,
      capability: binding.capability ?? binding.logicalName,
      semanticContext: binding.semanticContext ?? null,
      logicalName: binding.logicalName ?? null,
      candidates,
      decision,
      reasons,
      requirements: { props: requiredProps, slots: requiredSlots, behaviors: requiredBehaviors, variant: options.variant ?? null, state: options.state ?? null },
      implementation: implementation ? path.relative(repo, implementation).replaceAll(path.sep, "/") : null
    });
  }
  const pageOwned = [
    ...(input.contractBased ?? []).map((item) => ({ ...item, kind: "contract" })),
    ...(input.custom ?? []).map((item) => ({ ...item, kind: "custom" }))
  ];
  if (recipesPath && fs.existsSync(recipesPath)) {
    const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf8")).recipes ?? [];
    for (const recipe of recipes.filter((item) => item.kind === "page-composite")) pageOwned.push({ ...recipe, id: `recipe:${recipe.id}`, kind: "recipe" });
  }
  for (const item of pageOwned) {
    const queries = item.registryQueries ?? [];
    const candidates = [...new Set(queries.flatMap(findCandidates))].sort();
    const decision = candidates.length || item.kind === "contract" ? "extend-existing"
      : item.disposition === "promote-to-library" || (item.kind === "custom" && item.exceptionKind === "no-matching-component") ? "new-shared"
        : "page-composite";
    entries.push({ id: item.id, capability: item.missingCapability, semanticContext: null, logicalName: null, candidates, decision,
      reasons: candidates.length ? ["registered candidate exists; extend or reuse it before custom drawing"] : item.kind === "contract" ? ["canonical contract exists; complete its shared implementations before generation"] : [],
      requirements: { props: [], slots: [], behaviors: [], variant: null, state: null }, implementation: null });
  }
  return {
    schemaVersion: 1, kind: "text-to-ui-component-selection", targetFramework: framework,
    registryDigest: digest(registryPath), packageDigest, selectionRulesDigest: digest(rulesPath), componentIndexDigest: digest(indexPath),
    contextDigest: digest(contextPath), bindingsDigest: digest(bindingsPath), recipesDigest: recipesPath && fs.existsSync(recipesPath) ? digest(recipesPath) : null,
    entries
  };
}

export function validateComponentSelection(receipt, inputs) {
  const expected = resolveComponentSelection(inputs);
  if (JSON.stringify(receipt) !== JSON.stringify(expected)) throw new Error("Component selection receipt is stale or does not match the current registry, context, bindings, and recipes; resolve it again");
  const pending = receipt.entries.filter((entry) => !["reuse", "page-composite"].includes(entry.decision));
  if (pending.length) throw new Error(`Component selection is not implementable: ${pending.map((entry) => `${entry.id}=${entry.decision} (${entry.reasons.join("; ") || entry.candidates.join(", ") || "no library component"})`).join(" | ")}`);
  return receipt;
}
