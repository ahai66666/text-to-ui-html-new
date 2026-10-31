#!/usr/bin/env node
import { resolveComponentQuery, componentImplementation, compatibilityMessage, assertSemanticPattern } from "./component-query-lib.mjs";
import path from 'node:path';
import { findComponent, loadIndexes, locateMonorepo, normalizeList, parseArgs, print, readJson, resolveSkillRoot } from './navigation-index-lib.mjs';
import { loadReadinessPolicy, resolveComponentReadiness } from './component-readiness-policy.mjs';
import { loadComponentContract, resolveHtmlComponentRuntime } from './component-contract-loader.mjs';

const args = parseArgs(process.argv.slice(2));
const view = args.view || 'api';
if (!['summary', 'api', 'full'].includes(view)) throw new Error('Unknown --view: ' + view);
const located = locateMonorepo({ start: args.start || process.cwd(), explicitRepo: args.repo });
if (!located.root) throw new Error('Text-to-UI Monorepo not found. Run locate-monorepo.mjs and provide --repo.');
const skillRoot = resolveSkillRoot(located.root, args['skill-root']);
const index = loadIndexes(skillRoot)['component-index'];
const framework = args.framework || 'html';
if (framework !== 'html') throw new Error(`text-to-ui-html supports HTML only: ${framework}`);
const rawCapabilities = args.capabilities || args.component;
const capabilities = normalizeList(rawCapabilities);
if (!capabilities.length) throw new Error('Provide --capabilities search,checkbox,...');
if (typeof rawCapabilities === 'string' && !rawCapabilities.includes(',') && /\s/.test(rawCapabilities.trim())) {
  throw new Error('Provide --capabilities as comma-separated capability IDs, for example --capabilities primary-navigation-item,sidebar,search.');
}
const requestedContext = (args['semantic-context'] || args.context) ? String(args['semantic-context'] || args.context).trim().toLowerCase() : null;
if (requestedContext && (requestedContext.endsWith('.json') || requestedContext.includes('/') || requestedContext.includes('\\'))) {
  throw new Error('The component query context is a semantic context, not a Context Packet file. Use values such as primary-navigation-shell, secondary-navigation, or repeated-list-row.');
}
const selectionRules = readJson(path.join(skillRoot, 'references/components/component-selection-rules.json')).rules;
const readinessPolicy = loadReadinessPolicy(skillRoot);
const pattern = args.pattern ? readJson(path.join(skillRoot,"assets/design-system/pattern-contracts.json")).patterns.find(p => p.id === args.pattern) : null;
if (args.pattern && !pattern) throw new Error("Unknown Pattern: " + args.pattern);
const results = capabilities.map((capability) => {
  const normalizedCapability = String(capability).trim().toLowerCase();
  const resolved = resolveComponentQuery(index, normalizedCapability, selectionRules, requestedContext);
  const { candidates, matchingRules } = resolved;
  if (resolved.compatibility) return {capability, resolution:"compatibility-only", componentId:resolved.compatibility.id, instruction:compatibilityMessage(resolved.compatibility)};
  const ruleCandidates = (rules) => rules.map((rule) => {
    const registered = index.components.find((item) => item.logicalName === rule.logicalName);
    return {
      context: rule.context,
      component: registered?.id ?? null,
      logicalName: rule.logicalName,
      contractPath: registered?.contractPath ?? null,
      requiredOptions: rule.requiredOptions ?? {},
      ...(rule.requiredSlot ? { requiredSlot: rule.requiredSlot } : {})
    };
  });
  if (resolved.contextMismatch) return {
    capability,
    resolution: 'context-mismatch',
    requestedContext,
    candidates: ruleCandidates(resolved.allMatchingRules),
    allowedContexts: resolved.allowedContexts,
    instruction: 'Use one allowed semantic context or add a reviewed selection rule; do not fall back to the first visual match.'
  };
  if (!requestedContext && resolved.allowedContexts.length > 1) return {
    capability,
    resolution: 'context-required',
    candidates: ruleCandidates(resolved.allMatchingRules),
    allowedContexts: resolved.allowedContexts,
    instruction: 'Repeat the query with --context; do not choose a default Button or navigation role by appearance.'
  };
  if (matchingRules.length === 0 && candidates.length > 1) return {
    capability,
    resolution: 'context-required',
    candidates: candidates.map(({ id, logicalName, contractPath }) => ({ component: id, logicalName, contractPath })),
    instruction: 'This broad capability matches multiple library components. Query a specific capability or add a reviewed semantic selection rule.'
  };
  const selection = matchingRules.length === 1 ? matchingRules[0] : matchingRules.length > 1 ? {
    status: "variant-required", context: requestedContext,
    alternatives: ruleCandidates(matchingRules),
    instruction: "Select a specific capability or supported mode; do not inherit the first alternative's options."
  } : null;
  const selectedByRule = selection?.logicalName ? index.components.find((item) => item.logicalName === selection.logicalName) : null;
  const component = selectedByRule ?? candidates[0] ?? findComponent(index, capability);
  if (!component) return { capability, resolution: 'custom', reason: 'No library component or indexed contract match. Verify the exact registry before custom drawing.' };
  if (requestedContext) assertSemanticPattern(matchingRules, pattern);
  const contract = loadComponentContract(skillRoot, located.root, component);
  const runtime = resolveHtmlComponentRuntime(skillRoot, located.root, contract);
  const readiness = resolveComponentReadiness(contract, readinessPolicy);
  return {
    capability,
    resolution: runtime?.exists ? 'real-html-component' : 'matching-contract',
    component: component.id,
    logicalName: component.logicalName,
    importPackage: runtime?.exists ? runtime.package : null,
    source: runtime?.source || null,
    implementation: componentImplementation(contract),
    projectModule: "components/" + component.id + "/index.js",
    status: runtime?.status || contract.status,
    readiness,
    contractPointer: component.contractPath,
    guidanceReference: 'references/components/source-resolution.md',
    variants: contract.variants || [],
    states: contract.states || contract.allowedStates || [],
    props: contract.props || [],
    slots: contract.slots || [],
    slotContracts: contract.slotContracts || {},
    tokenRoles: contract.tokenRoles || [],
    iconAliases: contract.iconAliases || [],
    selection
  };
});
const projected = results.map((row) => {
  if (view === "summary") return Object.fromEntries(["capability","resolution","component","logicalName","contractPointer","componentId","candidates","allowedContexts","instruction"].filter((key) => row[key] !== undefined).map((key) => [key,row[key]]));
  if (view === "full" && row.component) return {...row, contract:loadComponentContract(skillRoot,located.root,index.components.find((c)=>c.id===row.component))};
  return row;
});
print({ repo: located.root, framework, view, results:projected });
