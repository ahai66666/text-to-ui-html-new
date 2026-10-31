#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { findComponent, loadIndexes, locateMonorepo, normalizeList, parseArgs, print, resolveSkillRoot, stableJson } from './navigation-index-lib.mjs';
import { readPatternRegistry, resolvePatternContract } from './pattern-contract-lib.mjs';
import { buildHtmlRendererContract, componentRendererBinding } from './html-renderer-contract.mjs';
import { stableDigest } from './ui-scene-core.mjs';
import { blueprintDigest, readPageBlueprint } from './page-blueprint.mjs';
import { materialDefinitions, materialSnapshot, materialReadLocations, materialPathFromSkillReference, writeContextReadReceipt } from './route-material-lib.mjs';
import { selectTaskRoute, selectTaskPattern } from './task-route-lib.mjs';
import { makePageBrief } from './stage-context-lib.mjs';
import { loadResourceIndex } from './resource-index-lib.mjs';
import { loadComponentContract, resolveHtmlComponentRuntime } from './component-contract-loader.mjs';
import {workflowPolicy} from './workflow-policy.mjs';

const args = parseArgs(process.argv.slice(2));
const inheritedPath = args['inherit-context'] ? path.resolve(args['inherit-context']) : null;
const inherited = inheritedPath ? JSON.parse(fs.readFileSync(inheritedPath,'utf8')) : null;
if (inherited && (inherited.schemaVersion !== 1 || inherited.request?.framework !== 'html' || !inherited.route?.id || !inherited.layout?.id)) throw new Error('Invalid inherited HTML Context Packet');
if (inherited) {
  args['workflow-route'] ||= 'micro-revision';
  if (args['workflow-route'] !== 'micro-revision') throw new Error('--inherit-context is for micro-revision only');
  if (args.pattern && args.pattern !== inherited.layout.id) throw new Error('A micro revision cannot change Pattern; use new-page');
  if (args['task-route'] && args['task-route'] !== inherited.route.id) throw new Error('A micro revision cannot change Task; use new-page');
  args.task ||= inherited.request.task;
  if (!inherited.route.id.startsWith('ad-hoc-')) args['task-route'] ||= inherited.route.id;
  args.capabilities = [...new Set([...String(args.capabilities || '').split(',').filter(Boolean), ...inherited.components.map(c=>c.capability)])].join(',');
  args.domain ||= inherited.request.domain;
  args.pattern ||= inherited.layout.id;
  args['pattern-reason'] ||= inherited.patternSelection?.reason || 'Preserve existing page structure';
  args['pattern-base'] ||= inherited.patternSelection?.base;
}

const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error(`Text-to-UI Monorepo not found. Tried:\n${located.attempted.join('\n')}`);
const repo = located.root;
const skillRoot = resolveSkillRoot(repo, args['skill-root']);
loadResourceIndex(skillRoot);
const indexes = loadIndexes(skillRoot);
const framework = args.framework || 'html';
const mode = args.mode || 'fast-preview';
const query = String(args.task || args.domain || '');
const primaryTask = String(args['primary-task'] || (inherited && !inherited.route.id.startsWith('ad-hoc-') ? inherited.route.id : query));
if (!query) throw new Error('Provide --task or --domain.');
if (framework !== 'html') throw new Error(`text-to-ui-html supports HTML only: ${framework}`);
if (!indexes['validation-index'].modes[mode]) throw new Error(`Unsupported mode: ${mode}`);
const explicitlyConfirmed = args.confirmed === true || String(args.confirmed).toLowerCase() === 'true';
const autoPlanned = args.auto === true || String(args.auto).toLowerCase() === 'true';
const discovery = args.discover === true || String(args.discover).toLowerCase() === 'true';
if (discovery && (autoPlanned || explicitlyConfirmed)) throw new Error('--discover is a design-reading stage, not a confirmed generation context.');
if (!discovery && !explicitlyConfirmed && !autoPlanned) throw new Error('Resolve design inputs with --discover first, then use --auto --blueprint for generation.');
const blueprintPath = args.blueprint ? path.resolve(String(args.blueprint)) : null;
if (autoPlanned && !blueprintPath) throw new Error('Automatic new-page routing requires --blueprint <page-blueprint.json> so the chosen Pattern and primary task are explicit before component resolution.');

const requestedPattern = args.pattern ? String(args.pattern) : null;
const routeSelection = selectTaskRoute(primaryTask, indexes['task-router'].routes, args['task-route']);
const matchedRoute = routeSelection.route;
let route = matchedRoute;
let patternSelection;
if (!route) {
  if (!requestedPattern) throw new Error(`No task route matches '${query}'. Unknown tasks require an explicit --pattern <pattern-id> and --capabilities <capability,...>; the Skill must not guess a Pattern.`);
  const adHocLayout = indexes['layout-index'].layouts.find((item) => item.id === requestedPattern);
  if (!adHocLayout) throw new Error(`Unknown Pattern '${requestedPattern}'. Use one of the approved Pattern IDs from the layout index.`);
  const capabilities = normalizeList(args.capabilities || args['required-capabilities']);
  if (capabilities.length === 0) throw new Error('Unknown tasks require --capabilities <capability,...> so component selection is explicit.');
  route = {
    id: `ad-hoc-${adHocLayout.id}`,
    aliases: [],
    domains: [],
    layout: adHocLayout.id,
    requiredCapabilities: capabilities,
    optionalCapabilities: normalizeList(args['optional-capabilities']),
    customCompositions: []
  };
  if(requestedPattern === 'pattern-d-inspector' && !['pattern-b-three-pane','pattern-c-tool-workspace'].includes(args['pattern-base'])) throw new Error('Unknown-task Inspector requires --pattern-base B or C');
  patternSelection = {id:requestedPattern,source:'explicit-unknown-task',reason:args['pattern-reason'] || 'Explicit Pattern and capability list for unknown task',...(args['pattern-base']?{base:args['pattern-base']}:{})};
} else {
  patternSelection = selectTaskPattern(matchedRoute, requestedPattern, args['pattern-reason'], args['pattern-base']);
  route = {...matchedRoute, layout:patternSelection.id};
}
const layout = indexes['layout-index'].layouts.find((item) => item.id === route.layout);
if (!layout) throw new Error(`Task route '${route.id}' references a missing approved Pattern: ${route.layout}`);
const resolvedPattern = resolvePatternContract(route.layout, {
  registry: readPatternRegistry(path.join(skillRoot, 'assets', 'design-system', 'pattern-contracts.json'))
});
const workflowRouteId = String(args['workflow-route'] || 'new-page');
const workflowRoute = indexes['workflow-route-index'].routes.find((candidate) => candidate.id === workflowRouteId);
if (!workflowRoute) throw new Error(`Unknown workflow route '${workflowRouteId}'`);
const selectedWorkflow = workflowPolicy(skillRoot, workflowRouteId);
if (workflowRouteId === 'skill-maintenance') throw new Error('Skill maintenance does not resolve a page; use resolve-workflow-route.mjs and its intake/validation packs');
const automaticBlueprint = autoPlanned ? readPageBlueprint(blueprintPath, { patternId: route.layout }) : null;
const approvedReferenceId = args['approved-reference'] ? String(args['approved-reference']) : null;
const approvedReferenceIndexPath = path.join(skillRoot, 'references', 'approved-pages', 'index.json');
let approvedReferences = [];
if (approvedReferenceId) {
  if (!fs.existsSync(approvedReferenceIndexPath)) throw new Error('Approved page reference library is unavailable');
  const approvedIndex = JSON.parse(fs.readFileSync(approvedReferenceIndexPath, 'utf8'));
  const entry = (approvedIndex.references ?? []).find((candidate) => candidate.id === approvedReferenceId);
  if (!entry) throw new Error(`Approved page reference '${approvedReferenceId}' was not found. Generated pages are not references unless the user explicitly registers them first.`);
  const cardPath = path.join(skillRoot, entry.path);
  if (!fs.existsSync(cardPath)) throw new Error(`Approved page reference '${approvedReferenceId}' has a missing reference card`);
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  if (card.id !== approvedReferenceId || card.approvedBy !== 'user') throw new Error(`Approved page reference '${approvedReferenceId}' is not user-approved`);
  approvedReferences = [{ id: entry.id, title: entry.title, path: entry.path, rationale: card.rationale, usePolicy: card.usePolicy }];
}
const resolveCapability = (capability, required) => {
  const component = findComponent(indexes['component-index'], capability);
  if (!component) return { capability, required, sourceLevel: 'custom', evidence: 'index-miss; exact registry search required before drawing' };
  const contract = loadComponentContract(skillRoot, repo, component);
  const runtime = resolveHtmlComponentRuntime(skillRoot, repo, contract);
  return {
    capability,
    required,
    sourceLevel: runtime?.exists ? 'real-html-component' : 'matching-contract',
    component: component.id,
    logicalName: component.logicalName,
    importPackage: runtime?.exists ? runtime.package : null,
    rendererKey: runtime?.rendererKey || null,
    rendererPackage: runtime?.package || null,
    factoryImport: runtime?.factoryImport || null,
    styleImports: runtime?.styleImports || [],
    source: runtime?.source || null,
    contractPointer: component.contractPath,
    variants: contract.variants || [],
    states: contract.states || contract.allowedStates || [],
    props: contract.props || [],
    slots: contract.slots || [],
    supportedProps: contract.props || [],
    supportedSlots: contract.slots || [],
    slotContracts: contract.slotContracts || {},
    tokenRoles: contract.tokenRoles || [],
    iconAliases: contract.iconAliases || []
  };
};
const requestedCapabilities = [...new Set([...normalizeList(args.capabilities || args['required-capabilities']), ...normalizeList(args['optional-capabilities'])])]
  .filter((item) => !route.requiredCapabilities.includes(item));
const components = [
  ...route.requiredCapabilities.map((item) => resolveCapability(item, true)),
  ...requestedCapabilities.map((item) => resolveCapability(item, true))
];
const componentReadMap = [...components
  .filter((item) => item.contractPointer)
  .reduce((byContract, item) => {
    const key = `${item.component}:${item.contractPointer}`;
    const entry = byContract.get(key) ?? {
      capability: item.capability,
      capabilities: [],
      component: item.component,
      logicalName: item.logicalName,
      contract: item.contractPointer,
      implementation: item.source || null,
      guidance: 'references/components/source-resolution.md'
    };
    if (!entry.capabilities.includes(item.capability)) entry.capabilities.push(item.capability);
    byContract.set(key, entry);
    return byContract;
  }, new Map())
  .values()];
const rendererComponents = components
  .filter((item) => item.sourceLevel === 'real-html-component')
  .map((item) => {
    const indexed = indexes['component-index'].components.find((component) => component.id === item.component);
    const contract = indexed ? loadComponentContract(skillRoot, repo, indexed) : null;
    const binding = indexed && contract
      ? componentRendererBinding({ ...contract, frameworks: { html: resolveHtmlComponentRuntime(skillRoot, repo, contract) } }, framework)
      : null;
    return binding ? { ...binding, capability: item.capability } : null;
  });
const renderer = buildHtmlRendererContract(framework, rendererComponents);
const patternDigest = stableDigest(resolvedPattern.pattern);
const tokenRoleNames = [...new Set(components.flatMap((item) => item.tokenRoles || []))];
const tokens = Object.fromEntries(tokenRoleNames.map((role) => [role, indexes['token-index'].semanticRoles[role] || { lookup: `packages/tokens; role=${role}` }]));
const dynamicMaterials = [
  ...((layout.references ?? []).map((reference) => ({ path: materialPathFromSkillReference(reference), role: 'pattern-reference' }))),
  ...(route.domainReference ? [{ path: materialPathFromSkillReference(route.domainReference), role: 'domain-reference' }] : []),
  ...(components.some((component) => component.component === 'titlebar') ? [{ path: 'skill-support/references/components/titlebar-segments.md', role: 'titlebar-contract' }] : []),
  ...[...new Set(components.map((component) => component.source?.split('#')[0]).filter(Boolean))]
    .map((source) => ({ path: source, role: 'selected-component-adapter' })),
  ...[...new Set(components.map((component) => component.contractPointer).filter(Boolean))]
    .map((contractPath) => ({ path: contractPath, role: 'selected-component-contract' })),
  { path: mode === 'fast-preview' ? 'skill-support/references/workflows/fast-preview.md' : 'skill-support/references/workflows/release-validation.md', role: 'validation' },
  ...approvedReferences.map((reference) => ({ path: materialPathFromSkillReference(reference.path), role: 'approved-reference' }))
];
const materialDefinitionsForContext = materialDefinitions({
  skillRoot,
  routeId: workflowRouteId,
  workflowRoute,
  extraMaterials: dynamicMaterials
});
const materialSnapshotForContext = materialSnapshot({ repo, skillRoot, definitions: materialDefinitionsForContext });
const contextMaterialReceipt = args['receipt-out']
  ? writeContextReadReceipt({
    output: args['receipt-out'],
    workflowRouteId,
    routeDigest: stableDigest({ routeId: route.id, workflowRouteId, patternDigest, materialsDigest: materialSnapshotForContext.digest }),
    snapshot: materialSnapshotForContext
  })
  : null;
const packet = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository: { root: repo, strategy: located.strategy },
  request: {
    task: args.task || null,
    domain: args.domain || null,
    framework,
    mode,
    confirmed: !discovery,
    confirmation: { status: discovery ? 'discovery' : 'confirmed', source: discovery ? 'design-discovery' : explicitlyConfirmed ? 'explicit-cli-flag' : 'auto-page-blueprint' }
  },
  pageBlueprint: automaticBlueprint ? { id: automaticBlueprint.id, sha256: blueprintDigest(automaticBlueprint), path: blueprintPath } : null,
  route: { id: route.id, aliases: route.aliases, domains: route.domains, source: matchedRoute ? routeSelection.source : 'explicit-pattern', workflowRouteId, ...(route.domainReference ? { domainReference: route.domainReference } : {}) },
  workflowPolicy: selectedWorkflow,
  patternSelection,
  routeEvidence: {primaryTask, matches:routeSelection.evidence || [], alternatives:routeSelection.candidates.map(r=>r.id)},
  ...(inherited ? {inheritedDecisions:{source:inheritedPath,sourceDigest:stableDigest(inherited),task:inherited.route.id,pattern:inherited.layout.id,originalWorkflow:inherited.inheritedDecisions?.originalWorkflow || inherited.route.workflowRouteId,preservation:'Keep confirmed content, navigation, interactions and state; refresh actual project evidence before acceptance'}} : {}),
  optionalCapabilities: (route.optionalCapabilities ?? []).filter((item) => !requestedCapabilities.includes(item)),
  routeMaterials: {
    schemaVersion: 1,
    workflowRouteId,
    digest: materialSnapshotForContext.digest,
    materials: materialSnapshotForContext.materials.map(({ path: materialPath, role, required, sha256 }) => ({ path: materialPath, role, required, sha256 }))
  },
  layout,
  patternContract: { ...resolvedPattern, patternDigest },
  components,
  componentReadMap,
  renderer,
  customCompositions: route.customCompositions,
  approvedReferences,
  tokens,
  designContext: {
    stage: discovery ? 'before-blueprint' : 'resolved-for-generation',
    ownership: { shell: 'renderer', businessContent: 'model', componentInternals: 'component-package' },
    geometry: resolvedPattern.pattern,
    layoutTokens: Object.fromEntries(Object.entries(indexes['token-index'].semanticRoles).filter(([role]) => /^(layout|space)\//.test(role))),
    componentSelectionRules: JSON.parse(fs.readFileSync(path.join(skillRoot, 'references/components/component-selection-rules.json'), 'utf8')).rules.filter((rule) => components.some((component) => component.logicalName === rule.logicalName)),
    iconAliases: Object.keys(JSON.parse(fs.readFileSync(path.join(skillRoot, 'assets/icons/icon-aliases.json'), 'utf8')).aliases ?? {}),
    guidance: 'references/page-design-guidance.md',
    rules: ['Design around the primary task, not the component inventory.', 'Use actual pane content width; do not duplicate shell padding.', 'Query missing capabilities before drawing custom controls.', 'Discovery cannot authorize compilation.']
  },
  exactReferencesToRead: [
    'references/page-design-guidance.md',
    ...(route.domainReference ? [route.domainReference] : []),
    'references/requirement-spec.md',
    'references/layouts/html-layout-routing.md',
    ...layout.references,
    'references/components/source-resolution.md',
    ...[...new Set(componentReadMap.map((item) => item.contract))],
    ...(components.some(component => component.component === 'titlebar') ? ['references/components/titlebar-segments.md'] : []),
    ...approvedReferences.map((reference) => reference.path),
    mode === 'fast-preview' ? 'references/workflows/fast-preview.md' : 'references/workflows/release-validation.md'
  ],
  materialReadLocations: materialReadLocations(materialSnapshotForContext, skillRoot),
  materialPathPolicy: "materials[].path is a logical ID; open materialReadLocations[].absolute or relative under RULES_ROOT. skill-support/ is not a physical directory.",
  materialsDigest: materialSnapshotForContext.digest,
  materials: materialSnapshotForContext.materials.map(({ path: materialPath, role, required, sha256 }) => ({ path: materialPath, role, required, sha256 })),
  ...(contextMaterialReceipt ? { materialReceipt: { path: path.resolve(args['receipt-out']), kind: contextMaterialReceipt.kind, materialsDigest: contextMaterialReceipt.materialsDigest } } : {}),
  validation: indexes['validation-index'].modes[mode],
  browserChecks: mode === 'fast-preview'
    ? ['target desktop viewport', 'shell/pane geometry', 'primary path', 'critical overlay', 'keyboard recovery']
    : ['all required states', 'accessibility', 'responsive minimum window', 'visual parity', 'final artifact reopening']
};

const pageBrief = makePageBrief(packet, args.out ? path.resolve(args.out) : null);
if (args["brief-out"] && args.out && path.resolve(String(args["brief-out"])) === path.resolve(String(args.out))) throw new Error("--brief-out must differ from the machine Context Packet path");
if (args["brief-out"]) {
  const output = path.resolve(String(args["brief-out"]));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, stableJson(pageBrief));
}

function markdown(value) {
  const lines = [
    '# Text-to-UI Context Packet', '',
    `- Task route: ${value.route.id}`,
    `- HTML target: ${value.request.framework}`,
    `- Mode: ${value.request.mode}`,
    `- Monorepo: ${value.repository.root} (${value.repository.strategy})`, '',
    '## Layout', '',
    `- ${value.layout.label}`,
    `- Pane order: ${value.layout.paneOrder.join(' → ')}`,
    `- Required slots: ${value.layout.requiredSlots.join(', ')}`, '',
    '## Component resolution', ''
  ];
  for (const item of value.components) lines.push(`- ${item.required ? 'Required' : 'Optional'} ${item.capability}: ${item.sourceLevel}${item.component ? ` → ${item.component} (${item.source || item.contractPointer})` : ''}`);
  lines.push('', '## Exact component reading map', '');
  for (const item of value.componentReadMap) lines.push(`- ${(item.capabilities ?? [item.capability]).join(', ')} → ${item.logicalName}: contract ${item.contract}; ${item.implementation ? `implementation ${item.implementation}` : 'no HTML implementation'}`);
  if (value.optionalCapabilities.length) lines.push('', '## Optional component capabilities', '', ...value.optionalCapabilities.map((capability) => `- ${capability} · load its contract only if selected for the page`));
  if (value.approvedReferences.length) lines.push('', '## Explicit approved page references', '', ...value.approvedReferences.map((reference) => `- ${reference.id}: ${reference.title} — ${reference.rationale}`));
  lines.push('', '## Page-owned compositions', '', ...value.customCompositions.map((item) => `- ${item}`), '', '## Route material closure', '', ...value.materialReadLocations.map((item) => `- ${item.relative ?? item.absolute} · ${item.role}`), '', '## Read only these references', '', ...value.exactReferencesToRead.map((item) => `- ${item}`), '', '## Validation', '', ...value.validation.commands.map((item) => `- \`${item}\``), '');
  return `${lines.join('\n')}\n`;
}

if (args.out) {
  const output = path.resolve(args.out);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const format = args.format || (path.extname(output) === '.md' ? 'markdown' : 'json');
  fs.writeFileSync(output, format === 'markdown' ? markdown(packet) : stableJson(packet));
  console.log(`Context packet written: ${output}`);
} else if (args.format === 'markdown') {
  process.stdout.write(markdown(packet));
} else print(packet);
