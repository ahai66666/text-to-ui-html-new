import { componentIdentityContracts } from './identity-contracts.js';

export function componentIdentityEvidence(node) {
  const id = node.dataset.component;
  const contract = componentIdentityContracts[id];
  if (!contract) return null;
  const errors = [];
  if (node.tagName.toLowerCase() !== contract.tagName || !node.matches(contract.selector)) {
    errors.push(`Identity must be ${contract.tagName}${contract.selector}, found ${node.tagName.toLowerCase()}.${node.className}`);
  }
  if (contract.kind === 'item') {
    if (!node.matches('.tui-component[data-component="sidebar"][data-renderer-key="sidebar"][data-logical-component="Sidebar Item/Default"][data-framework="html"]')) errors.push('Missing Sidebar Item identity attributes');
    if (!node.querySelector('[data-slot="label"]')) errors.push('Missing label slot');
    if (!['default', 'hover', 'pressed', 'focus', 'selected', 'disabled'].includes(node.dataset.state)) errors.push('Invalid Sidebar Item state');
    if (node.disabled !== (node.dataset.state === 'disabled')) errors.push('Disabled attribute must agree with state');
    const selected = node.getAttribute('aria-current') === 'page';
    if (!['default', 'selected', 'collapsed'].includes(node.dataset.variant) || (node.dataset.variant === 'selected' && !selected) || (selected && !['selected', 'collapsed'].includes(node.dataset.variant))) errors.push('Selected variant must agree with aria-current');
    if (node.dataset.state !== 'disabled' && (node.dataset.state === 'selected') !== selected) errors.push('Selected state must agree with aria-current');
    return { contract, valid: errors.length === 0, errors, actualTagName: node.tagName.toLowerCase(), actualClassName: String(node.className) };
  }
  const scope = node.closest(contract.scopeSelector);
  const content = scope?.querySelector(contract.contentSelector);
  if (!scope) errors.push('Missing disclosure scope');
  if (scope && ['data-component', 'data-renderer-key', 'data-logical-component'].some(name => scope.hasAttribute(name))) errors.push('Wrapper must not own component identity');
  if (scope && scope.querySelectorAll(':scope > ' + contract.selector).length !== 1) errors.push('Disclosure scope must have exactly one direct trigger');
  if (!content || !content.id || node.getAttribute('aria-controls') !== content.id) errors.push('aria-controls must reference this disclosure scope content');
  const expanded = node.getAttribute(contract.stateAttribute);
  if (!['true', 'false'].includes(expanded)) errors.push('aria-expanded must be true or false');
  const expectedState = expanded === 'true' ? 'open' : 'default';
  if (node.dataset.state !== expectedState || node.dataset.variant !== expectedState) errors.push('Component state/variant must agree with aria-expanded');
  if (content && content.hidden !== (expanded !== 'true')) errors.push('Content visibility must agree with aria-expanded');
  return {
    contract, valid: errors.length === 0, errors,
    actualTagName: node.tagName.toLowerCase(),
    actualClassName: String(node.className),
    controls: node.getAttribute('aria-controls'),
    expanded: expanded === 'true',
    relatedContentId: content?.id ?? null,
    relatedSlots: content ? ['content'] : []
  };
}

// Also used by the offline page validator against captured browser evidence.
export function validateComponentIdentityEvidence(components, identityViolations = []) {
  if (!Array.isArray(components)) return ['Runtime evidence must contain components'];
  const failures = [...identityViolations];
  for (const item of components) {
    const contract = componentIdentityContracts[item.componentId ?? item.rendererKey];
    if (!contract) continue;
    if (!item.identity || item.identity.valid !== true || item.tagName !== contract.tagName || item.identity.contract?.selector !== contract.selector) {
      failures.push(`${item.logicalName}: identity must be ${contract.tagName}${contract.selector}; actual ${item.tagName ?? 'missing tag evidence'}; ${(item.identity?.errors ?? ['missing identity evidence; recapture with current runtime']).join('; ')}`);
    }
    if (item.visible !== false && (!item.bounds || item.bounds.width <= 0 || item.bounds.height <= 0)) failures.push(`${item.logicalName}: missing visible identity-node bounds`);
  }
  return failures;
}

// Scan expected node shapes independently, so absent identity cannot escape collection.
export function collectComponentIdentityViolations(root) {
  const failures = [];
  for (const [id, contract] of Object.entries(componentIdentityContracts)) {
    for (const node of root.querySelectorAll(contract.selector)) {
      if (contract.kind !== 'item' && node.closest(contract.scopeSelector)?.getAttribute('data-disclosure-component') !== id) continue;
      if (!node.matches(`.tui-component[data-component="${id}"][data-renderer-key="${id}"][data-logical-component][data-framework="html"]`)) failures.push(`${id}: missing or incorrect identity on ${contract.tagName}${contract.selector}`);
    }
    if (contract.kind === 'item') for (const node of root.querySelectorAll(contract.scopeSelector + ', .tui-sidebar-groups')) {
      if (['data-component', 'data-renderer-key', 'data-logical-component'].some(name => node.hasAttribute(name))) failures.push(`${id}: list/group wrapper must not own component identity`);
    }
  }
  return failures;
}
