import { variableReferences, colorReferenceClass, projectColorSelectors } from './css-syntax.js';
import { canonicalColorVariables } from './token-colors.js';
export { variableReferences, colorReferenceClass, projectColorSelectors } from './css-syntax.js';
const controllers = new WeakMap();
const prefix = 'tui-colorref';
const colorProperties = new Set(['color','background','background-color','background-image','border','border-color','border-top','border-right','border-bottom','border-left','border-top-color','border-right-color','border-bottom-color','border-left-color','border-block','border-inline','border-block-color','border-inline-color','border-block-start','border-block-end','border-inline-start','border-inline-end','border-block-start-color','border-block-end-color','border-inline-start-color','border-inline-end-color','outline','outline-color','box-shadow','text-shadow','text-decoration','text-decoration-color','text-emphasis','text-emphasis-color','column-rule','column-rule-color','caret-color','accent-color','fill','stroke','stop-color','flood-color','lighting-color','scrollbar-color','-webkit-text-fill-color','-webkit-text-stroke','-webkit-text-stroke-color']);
const canonical = new Set(canonicalColorVariables);
/** Potential direct color references, not a computed/cascaded-style provenance engine. */
export function bindColorReferences(root, { colorVariables = [] } = {}) {
  if (!root?.querySelectorAll) throw Error('Color reference root must be a DOM root');
  controllers.get(root)?.dispose();
  const doc = root.ownerDocument ?? root, view = doc.defaultView;
  const extra = new Set(colorVariables); for (const name of extra) colorReferenceClass(name);
  let disposed = false, scheduled = false, scanning = false, frame = null, evidence = null;
  let owned = new Map(), nodeKeys = new WeakMap(), sequence = 0;
  const classSnapshot = node => [...node.classList].filter(c => !c.startsWith(prefix)).sort().join(' ');
  const elements = () => [...(root.nodeType === 1 ? [root] : []), ...root.querySelectorAll('*')];
  const key = node => { if (!nodeKeys.has(node)) nodeKeys.set(node, ++sequence); return nodeKeys.get(node); };
  function refresh() {
    if (disposed || scanning) return evidence;
    scanning = true;
    try {
      const diagnostics = [], rules = [], definitions = new Map(), visited = new Set(), nodes = elements();
      const diagnostic = (code, source, detail) => diagnostics.push({code, source, detail});
      const declarations = (style, context, selectors, pseudoElements = []) => {
        const refs = [];
        for (const property of new Set([...style, ...colorProperties])) {
          const value = style.getPropertyValue(property);
          if (property.startsWith('--')) {
            if (!definitions.has(property)) definitions.set(property, []);
            definitions.get(property).push(value); continue;
          }
          if (!colorProperties.has(property)) continue;
          try { for (const ref of variableReferences(value)) refs.push({...ref, property, value}); }
          catch (e) { diagnostic('unparsed-value', context.source, e.message); }
        }
        if (refs.length) rules.push({...context, selectors, pseudoElements, refs});
      };
      const walk = (list, context) => {
        for (const rule of list) {
          if (rule.type === 3) { sheet(rule.styleSheet, {...context, conditions:[...context.conditions, {kind:'stylesheet-inclusion', text:rule.media?.mediaText ?? '', href:rule.href}]}); continue; }
          if (rule.type === 1) {
            try {
              const projected = projectColorSelectors(rule.selectorText);
              declarations(rule.style, {...context, selector:rule.selectorText}, projected.selectors, projected.pseudoElements);
              if (rule.cssRules?.length) diagnostic('unsupported-css-nesting', context.source, rule.selectorText);
            } catch (e) {
              // An unrelated unsupported selector must not hide readable color rules.
              if ([...new Set([...rule.style, ...colorProperties])].some(p => !p.startsWith('--') && colorProperties.has(p) && rule.style.getPropertyValue(p).includes('var('))) diagnostic('unsupported-selector', context.source, e.message + ': ' + rule.selectorText);
            }
          } else if (rule.cssRules) {
            if (rule.type === 7 || rule.type === 8) {
              if (rule.cssText.includes('var(')) diagnostic('unsupported-animation', context.source, 'Keyframe references require animation provenance');
              continue;
            }
            walk(rule.cssRules, {...context, conditions:[...context.conditions, {kind:rule.constructor?.name ?? 'conditional', text:rule.conditionText ?? rule.name ?? ''}]});
          }
        }
      };
      const sheet = (stylesheet, context) => {
        if (!stylesheet) { diagnostic('unreadable-stylesheet', context.source, 'Stylesheet has not loaded'); return; }
        if (visited.has(stylesheet)) return;
        visited.add(stylesheet);
        const next = {...context, source:stylesheet.href ?? context.source, conditions:[...context.conditions, ...(stylesheet.media?.mediaText ? [{kind:'media',text:stylesheet.media.mediaText}] : []), ...(stylesheet.disabled ? [{kind:'disabled-stylesheet',text:'potential only'}] : [])]};
        try { walk(stylesheet.cssRules, next); }
        catch (e) { diagnostic('unreadable-stylesheet', next.source, e.name + ': ' + e.message); }
      };
      for (const stylesheet of doc.styleSheets) sheet(stylesheet, {source:stylesheet.href ?? 'inline-stylesheet', conditions:[]});
      if (doc.adoptedStyleSheets?.length) diagnostic('unsupported-adopted-stylesheets', 'document', 'Constructed sheets are not scanned in v1');
      for (const link of doc.querySelectorAll('link[rel~="stylesheet"]')) if (!link.sheet) diagnostic('unreadable-stylesheet', link.href, 'Stylesheet has not loaded');
      for (const node of nodes) {
        if (node.style?.length) declarations(node.style, {source:'inline-style', conditions:[], selector:null, node}, null);
        if (node.shadowRoot) diagnostic('unsupported-shadow-root', 'node:' + key(node), 'Shadow DOM is outside this scan');
        if (node.tagName === 'IFRAME') diagnostic('unsupported-iframe', 'node:' + key(node), 'Frame document is outside this scan');
      }
      const isColor = (name, node, seen = new Set()) => {
        if (canonical.has(name) || extra.has(name)) return true;
        if (seen.has(name)) return false;
        const next = new Set([...seen, name]);
        const values = [...(definitions.get(name) ?? []), view.getComputedStyle(node).getPropertyValue(name)].filter(Boolean);
        return values.some(value => {
          const v = value.trim();
          if (view.CSS.supports('color', v) && !v.includes('var(') && !['inherit','initial','unset','revert','revert-layer'].includes(v.toLowerCase())) return true;
          try {
            const refs = variableReferences(v);
            return /^var\(/i.test(v) && refs.length > 0 && refs.every(r => isColor(r.name,node,next));
          } catch { return false; }
        });
      };
      const desired = new Map(), uses = [], ambiguous = new Set();
      for (const rule of rules) {
        let matches;
        try {
          matches = rule.node ? [rule.node] : [...new Set(rule.selectors.flatMap(s => [...(root.nodeType === 1 && root.matches(s) ? [root] : []), ...root.querySelectorAll(s)]))];
        } catch (e) { diagnostic('unsupported-selector', rule.source, e.message); continue; }
        for (const node of matches) for (const ref of rule.refs) {
          // rgb()/hsl() channel/alpha variables and similar numeric arguments are not color tokens.
          const numericFunction = ref.functions.some(f => ['rgb','rgba','hsl','hsla','hwb','lab','lch','oklab','oklch','color'].includes(f));
          if (numericFunction && !canonical.has(ref.name) && !extra.has(ref.name)) continue;
          if (!isColor(ref.name, node)) {
            const value = view.getComputedStyle(node).getPropertyValue(ref.name).trim();
            const knownNonColor = value && (/^[+-]?[\d.]+(?:[a-z%]+)?$/i.test(value) || ['none','auto','solid','dashed','normal'].includes(value));
            const id = rule.source + ref.name + ref.property;
            if (!knownNonColor && !ambiguous.has(id)) { ambiguous.add(id); diagnostic('unknown-color-variable', rule.source, ref.name + ' in ' + ref.property); }
            continue;
          }
          const className = colorReferenceClass(ref.name);
          if (!desired.has(node)) desired.set(node,new Set());
          desired.get(node).add(className);
          uses.push({nodeKey:key(node), tagName:node.localName, elementId:node.id || null, variable:ref.name, className, property:ref.property, value:ref.value, fallback:ref.fallback, source:rule.source, selector:rule.selector, projectedSelectors:rule.selectors, conditions:rule.conditions, pseudoElements:rule.pseudoElements});
        }
      }
      for (const [node, classes] of owned) for (const c of classes) if (!desired.get(node)?.has(c)) node.classList.remove(c);
      const nextOwned = new Map();
      for (const [node, classes] of desired) {
        const managed = new Set();
        for (const c of classes) {
          if (owned.get(node)?.has(c) || !node.classList.contains(c)) { node.classList.add(c); managed.add(c); }
          else diagnostic('preexisting-marker-class', 'node:' + key(node), c + ' already exists; retained without taking ownership');
        }
        if (managed.size) nextOwned.set(node, managed);
      }
      owned = nextOwned;
      const variableMap = [...new Set(uses.map(u => u.variable))].sort().map(variable => ({variable, className:colorReferenceClass(variable)}));
      evidence = {schemaVersion:1, scope:'potential-direct-color-variable-references', status:diagnostics.length ? 'partial' : 'complete', variableMap, nodeCount:desired.size, references:uses, diagnostics};
      return evidence;
    } finally { scanning = false; }
  }
  const schedule = () => {
    if (disposed || scheduled) return;
    scheduled = true;
    frame = view.requestAnimationFrame(() => { frame = null; scheduled = false; refresh(); });
  };
  const observer = new view.MutationObserver(records => {
    if (records.every(r => r.type === 'attributes' && r.attributeName === 'class' && (r.oldValue ?? '').split(/\s+/).filter(c => c && !c.startsWith(prefix)).sort().join(' ') === classSnapshot(r.target))) return;
    schedule();
  });
  const controller = {
    refresh,
    getEvidence:() => evidence,
    dispose() {
      if (disposed) return;
      disposed = true; observer.disconnect(); doc.removeEventListener('load', schedule, true); doc.removeEventListener('error', schedule, true);
      if (frame !== null) view.cancelAnimationFrame(frame);
      for (const [node,classes] of owned) for (const c of classes) node.classList.remove(c);
      owned.clear(); nodeKeys = new WeakMap(); evidence = null;
      if (controllers.get(root) === controller) controllers.delete(root);
    }
  };
  controllers.set(root,controller);
  observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeOldValue:true,characterData:true});
  doc.addEventListener('load',schedule,true); doc.addEventListener('error',schedule,true);
  refresh();
  return controller;
}
