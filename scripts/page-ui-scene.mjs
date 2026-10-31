import { normalizeUiScene } from './ui-scene-core.mjs';

const baseLayout = () => ({ direction: 'VERTICAL', width: 'fill', height: 'hug' });
const baseStyle = () => ({ background: { kind: 'transparent' } });

function componentNode(node, region, bindingById) {
  const binding = bindingById.get(node.bindingId);
  if (!binding) throw new Error(`UI Scene composition references unknown binding '${node.bindingId}'`);
  if (binding.region !== region) throw new Error(`UI Scene binding '${node.bindingId}' belongs to '${binding.region}', not '${region}'`);
  return {
    id: node.id ?? `binding-${binding.id}`,
    name: binding.id,
    type: 'component',
    region,
    ...(binding.slot ? { patternSlot: binding.slot } : {}),
    ...(node.componentSlot ? { componentSlot: node.componentSlot } : {}),
    layout: baseLayout(),
    style: baseStyle(),
    component: {
      logicalName: binding.logicalName,
      rendererKey: binding.rendererKey,
      props: binding.options ?? {},
      slots: binding.slots ?? {},
      state: binding.options?.state ?? 'default',
      behaviorId: binding.behaviorId ?? null,
    },
    children: (node.children ?? []).map((child) => compositionNode(child, region, bindingById)),
  };
}

function compositionNode(node, region, bindingById) {
  if (!node || typeof node !== 'object') throw new Error(`Invalid UI Scene composition node in region '${region}'`);
  if (node.kind === 'component') return componentNode(node, region, bindingById);
  if (node.kind === 'text') {
    return {
      id: node.id ?? `text-${region}`,
      name: node.id ?? 'text',
      type: 'text',
      region,
      layout: baseLayout(),
      style: { ...baseStyle(), textRole: node.textRole ?? 'body-l' },
      content: String(node.text ?? ''),
      children: [],
    };
  }
  if (node.kind === 'group') {
    return {
      id: node.id ?? `group-${region}`,
      name: node.id ?? 'group',
      type: 'frame',
      region,
      layout: baseLayout(),
      style: baseStyle(),
      metadata: {
        tag: node.tag ?? 'div',
        className: node.className ?? null,
        ariaLabel: node.ariaLabel ?? null,
        customUi: node.customUi ?? null,
      },
      children: (node.children ?? []).map((child) => compositionNode(child, region, bindingById)),
    };
  }
  throw new Error(`Unsupported UI Scene composition node kind '${node.kind}'`);
}

function shellNode(node, region, shellSlot, bindingById) {
  const converted = compositionNode(node, region, bindingById);
  if (!converted.patternSlot) converted.patternSlot = shellSlot;
  return converted;
}

/**
 * Convert the legacy page-binding input into the canonical page UI Scene.
 * The input remains accepted for migration, but all renderers can now validate
 * one nested tree with distinct Pattern and component slot namespaces.
 */
export function buildPageUiScene({ resolvedPattern, input, bindings, layoutContract = null, blueprint = null, navigationMode = null }) {
  const compositionRegions = input.composition?.regions ?? {};
  const navigationShell = input.patternShell?.navigation ?? null;
  const bindingById = new Map(bindings.map((binding) => [binding.id, binding]));
  const regionNodes = [];
  for (const region of resolvedPattern.pattern.paneOrder) {
    const children = [];
    if (navigationShell && navigationMode && region === (resolvedPattern.pattern.navigationModes ?? []).find((mode) => mode.id === navigationMode)?.region) {
      for (const [slot, nodes] of Object.entries(navigationShell.slots ?? {})) {
        for (const node of nodes ?? []) children.push(shellNode(node, region, slot, bindingById));
      }
    } else {
      for (const node of compositionRegions[region] ?? []) children.push(compositionNode(node, region, bindingById));
    }
    regionNodes.push({
      id: `region-${region}`,
      name: region,
      type: 'frame',
      region,
      layout: baseLayout(),
      style: baseStyle(),
      children,
    });
  }
  const scene = {
    schemaVersion: 1,
    kind: 'text-to-ui-scene',
    source: {
      kind: 'html-page-composition',
      blueprintId: blueprint?.id ?? null,
      bindingSource: 'page-bindings.json',
    },
    page: {
      name: blueprint?.task ?? 'Generated Text-to-UI Page',
      pattern: resolvedPattern.pattern.id,
      stateScope: 'default-visible',
      ...(layoutContract ? { layoutContract: layoutContract.pattern } : {}),
    },
    patternMode: navigationMode ? { navigation: navigationMode } : undefined,
    nodes: [{
      id: 'page-root',
      name: 'page-root',
      type: 'frame',
      region: 'global',
      layout: { direction: 'HORIZONTAL', width: 'fill', height: 'fill' },
      style: baseStyle(),
      children: regionNodes,
    }],
  };
  if (scene.patternMode === undefined) delete scene.patternMode;
  return scene;
}

export function normalizePageUiScene(options) {
  const scene = buildPageUiScene(options);
  return { scene, ...normalizeUiScene(scene, { layoutContract: options.layoutContract, requireSlots: false }) };
}
