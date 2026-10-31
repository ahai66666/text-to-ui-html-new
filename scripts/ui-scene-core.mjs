import crypto from "node:crypto";
import { readPatternRegistry, resolvePatternContract } from "./pattern-contract-lib.mjs";

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

export function stableDigest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

export function buildPatternStructure({ resolvedPattern, layoutContract = null, bindings = [], navigationMode = null }) {
  const pattern = resolvedPattern.pattern;
  const normalizedBindings = bindings.map((binding) => ({
    id: binding.id ?? null,
    logicalName: binding.logicalName ?? null,
    region: binding.region ?? binding.pane ?? null,
    slot: binding.patternSlot ?? binding.slot ?? null,
    patternSlot: binding.patternSlot ?? binding.slot ?? null,
    componentSlot: binding.componentSlot ?? null,
    count: binding.expectedRuntimeCount ?? binding.count ?? 1,
  })).sort((left, right) => `${left.region}:${left.slot}:${left.logicalName}:${left.id}`.localeCompare(`${right.region}:${right.slot}:${right.logicalName}:${right.id}`));
  const structure = {
    patternId: pattern.id,
    paneOrder: [...pattern.paneOrder],
    regions: pattern.regions.map(({ id, width, height, insetOwner, scrollOwner, surface, dividerEdges }) => ({ id, width, height, insetOwner, scrollOwner, surface, dividerEdges, geometry: resolvedPattern.pattern.geometry?.regions?.[id] ?? null })),
    slots: pattern.slots.map(({ id, owner, cardinality, allowedComponentModes, overflow }) => ({ id, owner, cardinality, allowedComponentModes: allowedComponentModes ?? [], overflow: overflow ?? null })),
    titleLayer: pattern.titleLayer,
    geometry: pattern.geometry,
    minimumWindow: pattern.minimumWindow,
    resizeBehavior: pattern.resizeBehavior,
    navigationMode,
    layoutContract: layoutContract ? {
      pattern: layoutContract.pattern,
      paneOrder: layoutContract.paneOrder,
      insetOwners: layoutContract.insetOwners,
      scrollOwners: layoutContract.scrollOwners,
      resizeBehavior: layoutContract.resizeBehavior,
    } : null,
    bindings: normalizedBindings,
  };
  return {
    patternDigest: stableDigest(pattern),
    structureDigest: stableDigest(structure),
    structure,
  };
}

export function validatePatternBindings({ resolvedPattern, layoutContract = null, bindings = [], requireSlots = false, navigationMode = null }) {
  const errors = [];
  const pattern = resolvedPattern.pattern;
  const regions = new Set(pattern.regions.map((region) => region.id));
  const slots = new Map(pattern.slots.map((slot) => [slot.id, slot]));
  const navigation = navigationMode ? (pattern.navigationModes ?? []).find((mode) => mode.id === navigationMode) : null;
  if (navigationMode && !navigation) errors.push(`unknown Pattern navigation mode '${navigationMode}'`);
  if (layoutContract) {
    if (layoutContract.pattern !== pattern.id) errors.push(`layout-contract Pattern '${layoutContract.pattern}' does not match '${pattern.id}'`);
    if (JSON.stringify(layoutContract.paneOrder) !== JSON.stringify(pattern.paneOrder)) errors.push("layout-contract paneOrder does not match the resolved Pattern");
  }
  const counts = new Map();
  for (const binding of bindings) {
    const region = binding.region ?? binding.pane ?? null;
    if (region && !regions.has(region) && region !== "global" && region !== "page") errors.push(`${binding.id ?? binding.logicalName ?? "binding"}: unknown Pattern region '${region}'`);
    const patternSlot = binding.patternSlot ?? binding.slot;
    if (!patternSlot) continue;
    const slot = slots.get(patternSlot);
    if (!slot) {
      errors.push(`${binding.id ?? binding.logicalName ?? "binding"}: unknown Pattern slot '${patternSlot}'`);
      continue;
    }
    if (region && slot.owner !== "page" && slot.owner !== region) errors.push(`${binding.id ?? binding.logicalName ?? "binding"}: slot '${patternSlot}' belongs to '${slot.owner}', not '${region}'`);
    counts.set(patternSlot, (counts.get(patternSlot) ?? 0) + (binding.expectedRuntimeCount ?? binding.count ?? 1));
    if (navigation && region === navigation.region) {
      const shellSlot = navigation.shellSlots.find((entry) => entry.id === patternSlot);
      if (!shellSlot) errors.push(`${binding.id ?? binding.logicalName ?? "binding"}: two-level navigation binding must use a declared navigation shell slot`);
      else if (shellSlot.requiredSemanticContexts?.length && !shellSlot.requiredSemanticContexts.includes(binding.semanticContext)) errors.push(`${binding.id ?? binding.logicalName ?? "binding"}: slot '${patternSlot}' requires semanticContext ${shellSlot.requiredSemanticContexts.join(" or ")}`);
    }
  }
  if (navigation) {
    for (const shellSlot of navigation.shellSlots) {
      if (shellSlot.requiredSemanticContexts?.length && !counts.get(shellSlot.id)) errors.push(`navigation mode '${navigationMode}' requires shell slot '${shellSlot.id}'`);
    }
    const bottom = navigation.shellSlots.find((slot) => slot.placement === "bottom");
    if (bottom && counts.get(bottom.id)) counts.set("primary-navigation-shell", (counts.get("primary-navigation-shell") ?? 0) + counts.get(bottom.id));
  }
  if (requireSlots) {
    for (const slot of pattern.slots) {
      if ((slot.cardinality === "1" || slot.cardinality === "1..n") && !counts.get(slot.id)) errors.push(`required Pattern slot '${slot.id}' is not bound`);
    }
  }
  return errors;
}

export function normalizeUiScene(uiScene, { registry = readPatternRegistry(), layoutContract = null, requireSlots = false } = {}) {
  if (uiScene?.schemaVersion !== 1 || uiScene?.kind !== "text-to-ui-scene") throw new Error("Unsupported canonical UI Scene");
  const resolvedPattern = resolvePatternContract(uiScene.page?.pattern, { registry, layoutContract });
  const flattened = [];
  const ids = new Set();
  const visit = (node) => {
    if (ids.has(node.id)) throw new Error(`Duplicate UI Scene node id '${node.id}'`);
    ids.add(node.id);
    flattened.push({
      id: node.id,
      logicalName: node.component?.logicalName ?? null,
      region: node.region,
      slot: node.patternSlot ?? node.slot ?? null,
      patternSlot: node.patternSlot ?? node.slot ?? null,
      componentSlot: node.componentSlot ?? null,
      count: 1
    });
    for (const child of node.children ?? []) visit(child);
  };
  for (const node of uiScene.nodes ?? []) visit(node);
  const errors = validatePatternBindings({ resolvedPattern, layoutContract, bindings: flattened, requireSlots });
  if (errors.length) throw new Error(`UI Scene Pattern binding failed:\n${errors.join("\n")}`);
  const { patternDigest, structureDigest, structure } = buildPatternStructure({ resolvedPattern, layoutContract, bindings: flattened });
  const scene = structuredClone(uiScene);
  scene.page.patternContract = {
    source: resolvedPattern.authority,
    schemaVersion: resolvedPattern.schemaVersion,
    patternDigest,
    structureDigest,
  };
  return { scene, resolvedPattern, patternDigest, structureDigest, structure };
}
