const SLOT_CARDINALITY_RE = /^(\d+)(?:\.\.(\d+|n))?$/;

const clone = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const dataValue = (value) => escapeHtml(value ?? "");

const tokenCssVariable = (token) => {
  const tokenMap = {
    "layout/sidebar-expanded": "--layout-sidebar-width",
    "layout/sidebar-collapsed": "--layout-sidebar-width-collapsed",
    "layout/sidebar-wide": "--layout-sidebar-width-wide",
    "layout/secondary-pane": "--layout-secondary-pane-width",
    "layout/main-pane": "--layout-main-pane-width"
  };
  return tokenMap[token] || `--${String(token).replaceAll("/", "-")}`;
};

const patternList = (registry) => {
  if (!registry) return [];
  if (Array.isArray(registry)) return registry;
  if (registry.pattern && typeof registry.pattern === "object") return [registry.pattern];
  return Array.isArray(registry.patterns) ? registry.patterns : [];
};

const assertPattern = (pattern) => {
  if (!pattern || typeof pattern !== "object") throw new TypeError("Pattern Contract must be an object");
  if (!pattern.id) throw new Error("Pattern Contract is missing id");
  if (!Array.isArray(pattern.paneOrder) || pattern.paneOrder.length === 0) {
    throw new Error(`Pattern Contract ${pattern.id} is missing paneOrder`);
  }
  if (!Array.isArray(pattern.regions)) throw new Error(`Pattern Contract ${pattern.id} is missing regions`);
  if (!Array.isArray(pattern.slots)) throw new Error(`Pattern Contract ${pattern.id} is missing slots`);
  const regionIds = new Set(pattern.regions.map((region) => region.id));
  const duplicateRegions = pattern.paneOrder.filter((id, index) => pattern.paneOrder.indexOf(id) !== index);
  if (duplicateRegions.length) throw new Error(`Pattern Contract ${pattern.id} repeats pane(s): ${[...new Set(duplicateRegions)].join(", ")}`);
  const missingRegions = pattern.paneOrder.filter((id) => !regionIds.has(id));
  if (missingRegions.length) throw new Error(`Pattern Contract ${pattern.id} has undeclared pane(s): ${missingRegions.join(", ")}`);
  const slotIds = pattern.slots.map((slot) => slot.id);
  const duplicateSlots = slotIds.filter((id, index) => slotIds.indexOf(id) !== index);
  if (duplicateSlots.length) throw new Error(`Pattern Contract ${pattern.id} repeats slot(s): ${[...new Set(duplicateSlots)].join(", ")}`);
  return pattern;
};

/** Resolve a browser-safe Pattern Contract without reimplementing layout rules. */
export const resolvePatternContract = (registry, patternId) => {
  const pattern = patternList(registry).find((candidate) => candidate.id === patternId);
  if (!pattern) throw new Error(`Unknown Pattern Contract: ${patternId}`);
  return clone(assertPattern(pattern));
};

const parseCardinality = (cardinality = "0..n") => {
  const match = String(cardinality).match(SLOT_CARDINALITY_RE);
  if (!match) throw new Error(`Invalid Pattern slot cardinality: ${cardinality}`);
  return { min: Number(match[1]), max: match[2] === undefined ? Number(match[1]) : match[2] === "n" ? Infinity : Number(match[2]) };
};

const normalizeSlotValues = (value) => {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value : [value];
};

const renderSlotValue = (value, context) => {
  const resolved = typeof value === "function" ? value(context) : value;
  if (resolved === undefined || resolved === null || resolved === false) return "";
  if (typeof resolved === "string" || typeof resolved === "number") return String(resolved);
  throw new TypeError(`Pattern slot ${context.slotId} must return an HTML string`);
};

const renderSlot = (slot, slots, context, mode) => {
  const values = normalizeSlotValues(slots[slot.id]);
  const cardinality = parseCardinality(slot.cardinality);
  if (values.length > cardinality.max) {
    throw new Error(`Pattern slot ${slot.id} accepts at most ${cardinality.max} value(s)`);
  }
  if (mode === "runtime" && values.length < cardinality.min) {
    throw new Error(`Pattern slot ${slot.id} requires ${cardinality.min} value(s) in runtime mode`);
  }
  const rendered = values.map((value, index) => renderSlotValue(value, { ...context, slot, slotId: slot.id, index }));
  if (rendered.length > 0) return rendered.join("");
  if (mode !== "skeleton") return "";
  return `<span class="tui-pattern-runtime__slot-placeholder" data-pattern-slot-placeholder="${dataValue(slot.id)}" aria-hidden="true"></span>`;
};

const slotByOwner = (pattern, owner) => pattern.slots.filter((slot) => slot.owner === owner);

const navigationPlacement = (pattern, slot) => {
  const mode = pattern.navigationModes?.[0];
  return slot.placement ?? mode?.shellSlots?.find((entry) => entry.id === slot.id)?.placement ?? null;
};

const renderSlotEnvelope = (slot, content, placement = null) => {
  const placementAttribute = placement ? ` data-pattern-shell-placement="${dataValue(placement)}"` : "";
  const shellSlotAttribute = placement ? ` data-pattern-shell-slot="${dataValue(slot.id)}"` : "";
  return `<div class="tui-pattern-runtime__slot" data-pattern-slot="${dataValue(slot.id)}"${shellSlotAttribute}${placementAttribute}>${content}</div>`;
};

const renderRegion = (pattern, region, slots, mode, regionContent = {}) => {
  const ownerSlots = slotByOwner(pattern, region.id);
  const regionAttributes = [
    `data-pattern-region="${dataValue(region.id)}"`,
    `data-tui-pane-role="${dataValue(region.id)}"`,
    `data-pattern-inset-owner="${dataValue(region.insetOwner)}"`,
    `data-pattern-scroll-owner="${dataValue(region.scrollOwner)}"`,
    `data-pattern-surface="${dataValue(region.surface)}"`,
    `data-pattern-width-token="${dataValue(region.width?.token || "fill")}"`,
    `data-pattern-divider-edges="${dataValue((region.dividerEdges || []).join(" "))}"`
  ];
  const pageContent = mode === "runtime" ? (regionContent[region.id] ?? "") : "";
  if (region.id === "primary-navigation") {
    const areas = { top: "", body: "", bottom: "" };
    for (const slot of ownerSlots) {
      if (mode === "runtime" && slot.cardinality.startsWith("0..") && !normalizeSlotValues(slots[slot.id]).length) continue;
      const placement = slot.id === "primary-navigation-footer" ? "bottom" : navigationPlacement(pattern, slot);
      const content = renderSlot(slot, slots, { regionId: region.id, mode, placement }, mode);
      const area = placement === "top" || placement === "bottom" ? placement : "body";
      areas[area] += renderSlotEnvelope(slot, content, placement);
    }
    return `<section class="tui-pattern-runtime__pane tui-pattern-runtime__pane--navigation" ${regionAttributes.join(" ")}><div class="tui-pattern-runtime__navigation-top" data-pattern-shell-slot="navigation-top">${areas.top}</div><div class="tui-pattern-runtime__scroll-body" data-pattern-scroll-body>${areas.body}${pageContent}</div>${areas.bottom}</section>`;
  }
  const titleSlots = ownerSlots.filter((slot) => slot.id.endsWith("-actions") || slot.id.endsWith("-title"));
  const bodySlots = ownerSlots.filter((slot) => !titleSlots.includes(slot));
  const titleMarkup = titleSlots.map((slot) => renderSlotEnvelope(slot, renderSlot(slot, slots, { regionId: region.id, mode, placement: "title" }, mode), "title")).join("");
  const bodyMarkup = bodySlots.map((slot) => renderSlotEnvelope(slot, renderSlot(slot, slots, { regionId: region.id, mode, placement: "body" }, mode), "body")).join("");
  return `<section class="tui-pattern-runtime__pane tui-pattern-runtime__pane--content" ${regionAttributes.join(" ")}><header class="tui-pattern-runtime__pane-title" data-pattern-title-segment="${dataValue(region.id)}">${titleMarkup}</header><div class="tui-pattern-runtime__scroll-body" data-pattern-scroll-body>${bodyMarkup}${pageContent}</div></section>`;
};

/** Pattern-owned global title assembly; page compilers only provide slot values. */
export function composePatternTitleSlots(pattern, slots) {
  const segments = pattern.titleLayer?.segments ?? [];
  if (segments.length < 2 || String(slots["global-title-layer"] ?? "").includes('tui-pattern-runtime__title-segments')) return slots;
  const result = {...slots};
  const candidateIds = (region, index) => index === 0 ? ["global-title-layer"] : pattern.slots.filter(slot => slot.owner === region && /(?:-title|-actions|-toolbar|-toggle)$/.test(slot.id)).map(slot => slot.id);
  if (!segments.slice(1).some(region => candidateIds(region, 1).some(id => normalizeSlotValues(slots[id]).length))) return slots;
  const markup = segments.map((region, index) => {
    const available = candidateIds(region, index).filter(id => normalizeSlotValues(slots[id]).length);
    const title = available.find(id => id.endsWith("-title"));
    const selected = title ? [title] : available;
    const content = selected.map(id => normalizeSlotValues(slots[id]).map((v,i) => renderSlotValue(v, {regionId:region,slotId:id,index:i})).join("")).join("");
    if (index > 0) for (const id of available) result[id] = "";
    return `<div class="tui-pattern-runtime__title-segment" data-pattern-title-segment="${dataValue(region)}">${content}</div>`;
  }).join("");
  result["global-title-layer"] = `<div class="tui-pattern-runtime__title-segments">${markup}</div>`;
  return result;
}

/** Render a framework-neutral HTML Pattern shell. Slots remain page-owned. */
export const renderPatternHtml = ({ contract, patternContract, pattern, slots = {}, regionContent = {}, mode = "skeleton", framework = "html", structureDigest = null } = {}) => {
  const resolved = assertPattern(contract || patternContract || pattern);
  if (mode === "runtime") slots = composePatternTitleSlots(resolved, slots);
  if (framework !== "html") throw new Error(`HTML Pattern Runtime cannot render framework ${framework}`);
  if (!["skeleton", "runtime"].includes(mode)) throw new Error(`Unsupported Pattern Runtime mode: ${mode}`);
  const globalTitle = resolved.slots.find((slot) => slot.id === "global-title-layer");
  const titleMarkup = globalTitle
    ? renderSlot(globalTitle, slots, { regionId: "page", mode, placement: "global" }, mode)
    : "";
  const minWidth = resolved.minimumWindow?.width || 0;
  const minHeight = resolved.minimumWindow?.height || 0;
  const rootAttributes = [
    `class="tui-pattern-runtime tui-pattern-runtime--${dataValue(resolved.id)}"`,
    `data-tui-pattern="${dataValue(resolved.id)}"`,
    `data-pattern="${dataValue(resolved.id)}"`,
    `data-pattern-mode="${dataValue(mode)}"`,
    `data-pattern-framework="${dataValue(framework)}"`,
    ...(structureDigest ? [`data-structure-digest="${dataValue(structureDigest)}"`] : []),
    `data-tui-pane-order="${dataValue(resolved.paneOrder.join(" "))}"`,
    `data-pattern-minimum-window="${dataValue(`${minWidth}x${minHeight}`)}"`,
    `data-pattern-authority="${dataValue(resolved.authority || "assets/design-system/pattern-contracts.json")}"`
  ];
  const panes = resolved.paneOrder.map((regionId) => {
    const region = resolved.regions.find((candidate) => candidate.id === regionId);
    return renderRegion(resolved, region, slots, mode, regionContent);
  }).join("");
  return `<main ${rootAttributes.join(" ")}><header class="tui-pattern-runtime__global-title" data-pattern-slot="global-title-layer" data-pattern-global-title-layer>${titleMarkup}</header><div class="tui-pattern-runtime__pane-grid" data-pattern-pane-grid>${panes}</div></main>`;
};

const applyDataset = (root, key, value) => {
  if (value !== undefined && value !== null) root.dataset[key] = String(value);
};

/** Stamp an existing approved preview with the same runtime contract metadata. */
export const decoratePatternRoot = (root, { contract, patternContract, pattern, mode = "skeleton", framework = "html" } = {}) => {
  if (!root || !root.dataset) throw new TypeError("Pattern root must be a DOM element");
  const resolved = assertPattern(contract || patternContract || pattern);
  applyDataset(root, "tuiPattern", resolved.id);
  applyDataset(root, "patternMode", mode);
  applyDataset(root, "patternFramework", framework);
  applyDataset(root, "tuiPaneOrder", resolved.paneOrder.join(" "));
  applyDataset(root, "patternMinimumWindow", `${resolved.minimumWindow?.width || 0}x${resolved.minimumWindow?.height || 0}`);
  applyDataset(root, "patternAuthority", resolved.authority || "assets/design-system/pattern-contracts.json");
  root.setAttribute("data-pattern-runtime", "shared");
  root.querySelectorAll("[data-pattern-region]").forEach((regionNode) => {
    const region = resolved.regions.find((candidate) => candidate.id === regionNode.dataset.patternRegion);
    if (!region) return;
    applyDataset(regionNode, "patternInsetOwner", region.insetOwner);
    applyDataset(regionNode, "patternScrollOwner", region.scrollOwner);
    applyDataset(regionNode, "patternSurface", region.surface);
    applyDataset(regionNode, "patternWidthToken", region.width?.token || "fill");
    applyDataset(regionNode, "patternDividerEdges", (region.dividerEdges || []).join(" "));
  });
  return { root, contract: resolved, mode, framework };
};

export const createPatternRuntime = ({ registry, patternId, contract, patternContract, mode = "skeleton", framework = "html", slots = {}, regionContent = {} } = {}) => {
  const resolved = contract || patternContract || (registry ? resolvePatternContract(registry, patternId) : null);
  if (!resolved) throw new Error("createPatternRuntime requires patternId + registry or a resolved contract");
  const runtime = {
    contract: assertPattern(resolved),
    framework,
    mode,
    slots,
    regionContent,
    render(options = {}) {
      return renderPatternHtml({ contract: runtime.contract, framework: options.framework || framework, mode: options.mode || mode, slots: options.slots || slots, regionContent: options.regionContent || regionContent, structureDigest: options.structureDigest });
    },
    mount(root, options = {}) {
      if (!root) throw new TypeError("Pattern Runtime mount root was not found");
      root.innerHTML = runtime.render(options);
      return runtime;
    },
    decorate(root, options = {}) {
      return decoratePatternRoot(root, { contract: runtime.contract, framework: options.framework || framework, mode: options.mode || mode });
    }
  };
  return runtime;
};

const secondaryPageSlot = (slotId, slots, mode) => {
  const value = slots[slotId];
  if (value !== undefined && value !== null && value !== false) return typeof value === "function" ? value({ slotId, mode }) : String(value);
  if (mode === "runtime") throw new Error(`Secondary Page slot ${slotId} requires a value in runtime mode`);
  return `<span class="tui-secondary-page-runtime__slot-placeholder" data-secondary-page-slot-placeholder="${dataValue(slotId)}" aria-hidden="true"></span>`;
};

/** Render the two approved Secondary Page compositions using registered Titlebar slots. */
export const renderSecondaryPageHtml = ({ layout = "continuation", slots = {}, mode = "skeleton", framework = "html" } = {}) => {
  if (!["continuation", "new-page"].includes(layout)) throw new Error(`Unsupported Secondary Page layout: ${layout}`);
  if (!["skeleton", "runtime"].includes(mode)) throw new Error(`Unsupported Secondary Page Runtime mode: ${mode}`);
  if (framework !== "html") throw new Error(`HTML Secondary Page Runtime cannot render framework ${framework}`);
  const navigation = layout === "continuation" ? `<aside class="tui-secondary-page-runtime__navigation" data-secondary-page-region="navigation">${secondaryPageSlot("navigation", slots, mode)}</aside>` : "";
  const titlebar = `<header class="tui-secondary-page-runtime__titlebar" data-secondary-page-slot="titlebar">${secondaryPageSlot("titlebar", slots, mode)}</header>`;
  const content = `<main class="tui-secondary-page-runtime__content" data-secondary-page-slot="content">${secondaryPageSlot("content", slots, mode)}</main>`;
  const titlebarSize = layout === "continuation" ? "large" : "small";
  const rootAttributes = [
    `class="tui-secondary-page-runtime tui-secondary-page-runtime--${dataValue(layout)}"`,
    `data-secondary-page-runtime="true"`,
    `data-secondary-page-layout="${dataValue(layout)}"`,
    `data-secondary-page-mode="${dataValue(mode)}"`,
    `data-secondary-page-titlebar-size="${titlebarSize}"`
  ];
  return `<section ${rootAttributes.join(" ")}>${navigation}${titlebar}${content}</section>`;
};

export const createSecondaryPageRuntime = ({ layout = "continuation", mode = "skeleton", framework = "html", slots = {} } = {}) => ({
  layout,
  mode,
  framework,
  slots,
  render(options = {}) {
    return renderSecondaryPageHtml({ layout: options.layout || layout, mode: options.mode || mode, framework: options.framework || framework, slots: options.slots || slots });
  },
  mount(root, options = {}) {
    if (!root) throw new TypeError("Secondary Page Runtime mount root was not found");
    root.innerHTML = this.render(options);
    return this;
  }
});

export { tokenCssVariable };
