import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const isTitlebar = (binding) => binding?.rendererKey === "titlebar" || binding?.logicalName === "Titlebar/Default";
const isSearch = (binding) => binding?.rendererKey === "search" || binding?.logicalName === "Search/White Surface/Default";
const roleFor = (binding) => binding?.options?.segmentRole ?? binding?.options?.paneRole ?? null;

export function readTitlebarSceneContracts({ repositoryRoot }) {
  const candidates = [path.join(repositoryRoot, "assets/design-system/titlebar-scene-contracts.json"), path.join(repositoryRoot, "skill-support/assets/design-system/titlebar-scene-contracts.json")];
  const sourcePath = candidates.find((file) => fs.existsSync(file));
  if (!sourcePath) throw new Error("Titlebar scene contracts are missing from " + repositoryRoot);
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (source?.schemaVersion !== 1 || source?.kind !== "text-to-ui-titlebar-scene-contracts" || !source.scenes || typeof source.scenes !== "object") {
    throw new Error("Titlebar Scene contract is invalid");
  }
  return { sourcePath, source, digest: digest(source) };
}

export function titlebarScenePreset({ repositoryRoot, patternId }) {
  const contracts = readTitlebarSceneContracts({ repositoryRoot });
  const declared = contracts.source.scenes[patternId] ?? null;
  const pagePolicy = contracts.source.pagePolicy ?? { defaultSize: "large", allowedSizes: ["medium", "large", "xlarge"] };
  const preset = declared ?? {
    id: `${patternId}-default-titlebar`,
    kind: "generic-pattern-page",
    titleLayer: {
      heightToken: "layout/titlebar-height",
      crossAxisAlignment: "center",
      segmentOrder: [],
      sizePolicy: {
        defaultSize: pagePolicy.defaultSize,
        allowedSizes: pagePolicy.allowedSizes
      }
    },
    segments: [],
    fallback: true
  };
  return { ...contracts, preset, declaredPreset: declared };
}

function requireOne(bindings, predicate, message) {
  const matches = bindings.filter(predicate);
  if (matches.length !== 1) throw new Error(`${message}; found ${matches.length}`);
  return matches[0];
}

function assertUniformActionMode(binding, sceneSegment) {
  const actions = binding.slots?.[sceneSegment.businessActionSlot] ?? [];
  const businessActions = actions.filter((action) => action?.id !== "more" && action?.overflowTrigger !== true && action?.icon !== "action/more");
  const modes = new Set(businessActions.map((action) => action?.buttonType ?? "icon"));
  for (const mode of modes) if (!sceneSegment.businessActionModes.includes(mode)) throw new Error(`Titlebar Scene main-detail action '${mode}' is not an approved mode`);
  if (modes.size > 1) throw new Error("Titlebar Scene main-detail actions must use one uniform mode; split task scopes or choose icon / icon-text-ghost before generation");
  return {
    slot: sceneSegment.businessActionSlot,
    mode: modes.size ? [...modes][0] : null,
    actions: actions.map(({ id, label, icon, buttonType, overflowTrigger }) => ({ id, label, icon, buttonType: buttonType ?? "icon", ...(overflowTrigger ? { overflowTrigger: true } : {}) })),
    overflow: sceneSegment.overflow
  };
}

const titlebarSizePolicy = (source, preset) => ({
  defaultSize: preset?.titleLayer?.sizePolicy?.defaultSize ?? source.pagePolicy?.defaultSize ?? "large",
  allowedSizes: preset?.titleLayer?.sizePolicy?.allowedSizes ?? source.pagePolicy?.allowedSizes ?? ["medium", "large", "xlarge"]
});

function assertTitlebarSize(binding, policy, location) {
  const requested = binding.options?.size ?? policy.defaultSize;
  if (requested === "small") {
    throw new Error(`Titlebar ${location} cannot use Titlebar_S in a canonical Pattern page; Titlebar_S is reserved for standalone Secondary Page titlebars`);
  }
  if (!policy.allowedSizes.includes(requested)) {
    throw new Error(`Titlebar ${location} requests size '${requested}', but this page allows ${policy.allowedSizes.join(", ")}; use Titlebar_M, Titlebar_L, or Titlebar_XL`);
  }
  return requested;
}

/**
 * Resolve the page's exact Titlebar scene from the selected Pattern and real
 * registered bindings. This is an intermediate design artifact: the Skill
 * selects the scene preset, while page authors only supply product copy and
 * declared actions inside component slots.
 */
export function resolveTitlebarScene({ repositoryRoot, resolvedPattern, bindings }) {
  const { sourcePath, digest: contractsDigest, source, preset, declaredPreset } = titlebarScenePreset({ repositoryRoot, patternId: resolvedPattern.pattern.id });
  const policy = titlebarSizePolicy(source, preset);
  if (resolvedPattern.pattern.id !== "pattern-b-three-pane") {
    const globalTitleBindings = bindings.filter((binding) => binding.slot === "global-title-layer");
    if (globalTitleBindings.length !== 1) {
      throw new Error(`Every Pattern page requires exactly one global Titlebar binding in global-title-layer; found ${globalTitleBindings.length}`);
    }
    const globalTitlebar = globalTitleBindings[0];
    if (!isTitlebar(globalTitlebar)) {
      throw new Error("Every Pattern page global-title-layer must be the registered Titlebar/Default component; do not substitute a page header or handwritten toolbar");
    }
    const size = assertTitlebarSize(globalTitlebar, policy, "global-title-layer");
    const titleSegments = resolvedPattern.pattern.titleLayer?.segments ?? [];
    const titlebarBindings = bindings.filter(isTitlebar);
    const segments = titlebarBindings.map((binding) => ({
      id: binding.slot ?? binding.id,
      kind: "titlebar",
      bindingId: binding.id,
      logicalName: binding.logicalName,
      patternSlot: binding.slot ?? null,
      semanticContext: binding.semanticContext ?? null,
      layout: binding.options?.layout ?? "standalone",
      segmentRole: roleFor(binding),
      size: assertTitlebarSize(binding, policy, binding.slot ?? binding.id),
      windowControls: binding.options?.showWindowControls ?? null,
      surfaceOwner: "pattern-runtime"
    }));
    return {
      schemaVersion: 1,
      kind: "text-to-ui-titlebar-scene",
      preset: preset.id,
      source: { path: path.relative(repositoryRoot, sourcePath).replaceAll(path.sep, "/"), digest: contractsDigest },
      pagePolicy: { required: true, defaultSize: policy.defaultSize, allowedSizes: policy.allowedSizes },
      pattern: {
        id: resolvedPattern.pattern.id,
        titleLayer: {
          ...(preset.titleLayer ?? {}),
          segmentOrder: titleSegments,
          sizePolicy: policy
        }
      },
      segments,
      fallbackPreset: declaredPreset ? false : true,
      primaryTitlebar: {
        bindingId: globalTitlebar.id,
        size,
        rule: "one direct Titlebar/Default per generated Pattern page"
      }
    };
  }

  const primaryContract = preset.segments.find((segment) => segment.id === "primary-navigation");
  const secondaryContract = preset.segments.find((segment) => segment.id === "secondary-list");
  const detailContract = preset.segments.find((segment) => segment.id === "main-detail");
  const primary = requireOne(bindings, (binding) => binding.slot === primaryContract.patternSlot, "Titlebar Scene requires one primary-navigation Titlebar");
  const primarySize = assertTitlebarSize(primary, policy, "primary-navigation");
  if (!isTitlebar(primary) || !primaryContract.semanticContexts.includes(primary.semanticContext) || primary.options.layout !== primaryContract.layout || roleFor(primary) !== primaryContract.segmentRole) {
    throw new Error("Titlebar Scene primary-navigation must be the registered three-column primary Titlebar");
  }
  if (primary.options.size === "small" || primary.options.showWindowControls === true || primary.slots?.actions === true) {
    throw new Error("Titlebar Scene primary-navigation must use a pane Titlebar without window controls");
  }

  const secondaryCandidates = bindings.filter((binding) => binding.slot === secondaryContract.patternSlot);
  if (secondaryCandidates.length > secondaryContract.maxBindings) throw new Error("Titlebar Scene secondary-list accepts at most one Search binding");
  const secondary = secondaryCandidates[0] ?? null;
  if (secondary && (!isSearch(secondary) || secondary.semanticContext !== secondaryContract.semanticContext)) {
    throw new Error("Titlebar Scene secondary-list must contain only the registered Search component in search mode");
  }

  const detail = requireOne(bindings, (binding) => binding.slot === detailContract.patternSlot, "Titlebar Scene requires one main-detail Titlebar");
  const detailSize = assertTitlebarSize(detail, policy, "main-detail");
  if (!isTitlebar(detail) || detail.semanticContext !== detailContract.semanticContext || detail.options.layout !== detailContract.layout || ![detailContract.segmentRole, "final-pane"].includes(roleFor(detail))) {
    throw new Error("Titlebar Scene main-detail must be the registered three-column final Titlebar");
  }
  if (detail.options.size === "small" || detail.options.showWindowControls === false || detail.slots?.actions === false) {
    throw new Error("Titlebar Scene main-detail must retain component-owned window controls");
  }
  const detailActions = assertUniformActionMode(detail, detailContract);
  const directDetailActions = bindings.filter((binding) => binding.slot === detailContract.businessActionSlot);
  if (directDetailActions.length) throw new Error("Titlebar Scene main-detail actions must be nested in the final Titlebar component slot");

  return {
    schemaVersion: 1,
    kind: "text-to-ui-titlebar-scene",
    preset: preset.id,
    source: {
      path: path.relative(repositoryRoot, sourcePath).replaceAll(path.sep, "/"),
      digest: contractsDigest
    },
    pagePolicy: { required: true, defaultSize: policy.defaultSize, allowedSizes: policy.allowedSizes },
    pattern: {
      id: resolvedPattern.pattern.id,
      titleLayer: { ...preset.titleLayer, sizePolicy: policy }
    },
    segments: [
      {
        id: primaryContract.id,
        kind: primaryContract.kind,
        bindingId: primary.id,
        logicalName: primary.logicalName,
        patternSlot: primaryContract.patternSlot,
        layout: primaryContract.layout,
        segmentRole: primaryContract.segmentRole,
        size: primarySize,
        verticalAlignment: "center",
        windowControls: false,
        surfaceOwner: primaryContract.surfaceOwner
      },
      {
        id: secondaryContract.id,
        kind: secondaryContract.kind,
        bindingId: secondary?.id ?? null,
        logicalName: secondary?.logicalName ?? null,
        patternSlot: secondaryContract.patternSlot,
        verticalAlignment: secondaryContract.crossAxisAlignment,
        inlineInsetToken: secondaryContract.inlineInsetToken,
        surfaceOwner: secondaryContract.surfaceOwner
      },
      {
        id: detailContract.id,
        kind: detailContract.kind,
        bindingId: detail.id,
        logicalName: detail.logicalName,
        patternSlot: detailContract.patternSlot,
        layout: detailContract.layout,
        segmentRole: detailContract.segmentRole,
        size: detailSize,
        verticalAlignment: "center",
        businessActions: detailActions,
        windowControls: detailContract.windowControls,
        surfaceOwner: detailContract.surfaceOwner
      }
    ]
  };
}
