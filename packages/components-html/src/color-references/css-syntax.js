// Balanced CSS component values: strings, comments, escapes, functions and blocks.
// Shared by the value reader and selector projection; no DOM or dependencies.
export const decodeCssIdentifier = value => value.replace(/\\([0-9a-f]{1,6})(?:\r\n|[\t\n\r\f ])?|\\([^\n\r\f])/gi, (_, hex, char) => hex ? String.fromCodePoint(Math.min(parseInt(hex, 16) || 0xfffd, 0x10ffff)) : char);
export function parseCss(text) {
  let i = 0;
  const ident = () => {
    const start = i;
    while (i < text.length) {
      if (/[-_a-zA-Z0-9\u0080-\uffff]/.test(text[i])) { i++; continue; }
      if (text[i] !== '\\') break;
      i++;
      let count = 0;
      while (count < 6 && /[0-9a-f]/i.test(text[i] ?? '') && i < text.length) { i++; count++; }
      if (count && /\s/.test(text[i] ?? '') && i < text.length) i++;
      else if (!count && i < text.length) i++;
    }
    return text.slice(start, i);
  };
  const read = closing => {
    const nodes = [];
    while (i < text.length) {
      const c = text[i];
      if (c === closing) { i++; return nodes; }
      if (c === '/' && text[i + 1] === '*') {
        const end = text.indexOf('*/', i + 2); if (end < 0) throw Error('Unclosed CSS comment');
        nodes.push({type:'space', raw:' '}); i = end + 2;
      } else if (c === '"' || c === "'") {
        const start = i++; let closed = false;
        while (i < text.length) { if (text[i] === '\\') { i += 2; continue; } if (text[i++] === c) { closed = true; break; } }
        if (!closed) throw Error('Unclosed CSS string');
        nodes.push({type:'string', raw:text.slice(start, i)});
      } else if (c === '[' || c === '(' || c === '{') {
        i++; nodes.push({type:'block', open:c, close:({'[':']','(':')','{':'}'})[c], children:read(({'[':']','(':')','{':'}'})[c])});
      } else if (/[-_a-zA-Z0-9\u0080-\uffff\\]/.test(c)) {
        const raw = ident();
        if (text[i] === '(') { i++; nodes.push({type:'function', raw, name:decodeCssIdentifier(raw).toLowerCase(), children:read(')')}); }
        else nodes.push({type:'word', raw});
      } else if (/\s/.test(c)) {
        const start = i++; while (i < text.length && /\s/.test(text[i])) i++;
        nodes.push({type:'space', raw:text.slice(start, i)});
      } else { nodes.push({type:'punct', raw:c}); i++; }
    }
    if (closing) throw Error('Unclosed CSS block');
    return nodes;
  };
  return read(null);
}
export const cssText = nodes => nodes.map(n => n.children ? n.type === 'function' ? `${n.raw}(${cssText(n.children)})` : `${n.open}${cssText(n.children)}${n.close}` : n.raw).join('');
export function splitCss(nodes, separator = ',') {
  const groups = [[]]; for (const node of nodes) { if (node.type === 'punct' && node.raw === separator) groups.push([]); else groups.at(-1).push(node); } return groups;
}
export function variableReferences(value) {
  const result = [];
  const walk = (nodes, fallback = false, ancestors = []) => {
    for (const n of nodes) {
      if (n.type === 'function' && n.name === 'var') {
        const parts = splitCss(n.children); const name = decodeCssIdentifier(cssText(parts[0]).trim());
        if (!name.startsWith('--') || name.length === 2) throw Error('Invalid CSS variable reference');
        result.push({name, fallback, functions:ancestors});
        for (const part of parts.slice(1)) walk(part, true, ancestors);
      } else if (n.children && !(n.type === 'function' && n.name === 'url')) walk(n.children, fallback, [...ancestors, n.name ?? n.open]);
    }
  };
  walk(parseCss(value)); return result;
}
export function colorReferenceClass(name) {
  if (!name.startsWith('--') || name.length === 2) throw Error('Expected a CSS custom property name');
  return /^--[A-Za-z0-9_-]+$/.test(name) ? 'tui-colorref' + name : 'tui-colorref-u-' + [...new TextEncoder().encode(name)].map(b => b.toString(16).padStart(2,'0')).join('');
}
const states = new Set(['hover','active','focus','focus-visible','focus-within','visited','link','target','enabled','disabled','checked','indeterminate','valid','invalid','user-valid','user-invalid','required','optional','read-only','read-write','placeholder-shown','autofill']);
const structural = new Set(['root','empty','first-child','last-child','only-child','first-of-type','last-of-type','only-of-type','nth-child','nth-last-child','nth-of-type','nth-last-of-type','lang','dir','scope']);
const stateAttributes = new Set(['data-state','aria-selected','aria-checked','aria-pressed','aria-expanded','aria-disabled','checked','selected','disabled']);
export function projectColorSelectors(selector) {
  const pseudos = new Set();
  const project = nodes => {
    let output = '', compound = '', changed = false;
    const flush = () => { output += compound || '*'; compound = ''; };
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.type === 'space' || (n.type === 'punct' && ['>','+','~'].includes(n.raw))) {
        if (compound || changed) flush();
        output += n.raw; changed = false; continue;
      }
      if (n.type === 'block' && n.open === '[') {
        const attr = decodeCssIdentifier(n.children.find(t => t.type === 'word')?.raw ?? '').toLowerCase();
        const variantState = attr === 'data-variant' && /^(?:\s*data-variant\s*=\s*["']?(?:default|open|closed|selected|disabled|hover|pressed|focus)["']?\s*)$/.test(cssText(n.children));
        if (stateAttributes.has(attr) || variantState) { compound += attr === 'disabled' ? ':is(button,input,select,textarea,option,optgroup,fieldset)' : ''; changed = true; continue; }
      }
      if (n.type === 'punct' && n.raw === ':') {
        const double = nodes[i + 1]?.raw === ':'; if (double) i++;
        const p = nodes[++i]; if (!p || !['word','function'].includes(p.type)) throw Error('Unsupported pseudo selector');
        const name = decodeCssIdentifier(p.raw).toLowerCase();
        if (double || ['before','after','first-line','first-letter'].includes(name)) {
          if (!['before','after','marker','first-line','first-letter','placeholder','selection','-webkit-slider-runnable-track','-webkit-slider-thumb','-webkit-inner-spin-button','-webkit-outer-spin-button','-moz-range-track','-moz-range-thumb','-moz-range-progress'].includes(name)) throw Error('Unsupported pseudo element: ' + name);
          if (nodes.slice(i + 1).some(t => t.type === 'space' || ['>','+','~'].includes(t.raw))) throw Error('Pseudo element must belong to the selector subject');
          pseudos.add('::' + name); changed = true; continue;
        }
        if (states.has(name)) {
          if (name === 'disabled' || name === 'enabled') compound += ':is(button,input,select,textarea,option,optgroup,fieldset)';
          if (name === 'checked' || name === 'indeterminate') compound += ':is(input,option)';
          changed = true; continue;
        }
        if (['is','where','not','has'].includes(name) && p.type === 'function') {
          const branches = splitCss(p.children).map(project);
          if (name === 'not' && branches.some(b => b.changed)) {
            if (p.children.some(t => t.type === 'function' && ['is','where','has','not'].includes(t.name))) throw Error('Unsupported nested state negation');
            const fixed = branches.filter(b => !b.changed);
            if (fixed.length) compound += ':not(' + fixed.map(b => b.selector).join(',') + ')';
            changed = true; continue;
          }
          compound += ':' + p.raw + '(' + branches.map(b => b.selector).join(',') + ')';
          changed ||= branches.some(b => b.changed); continue;
        }
        if (!structural.has(name)) throw Error('Unsupported pseudo class: ' + name);
        // State gates nested in nth-child(... of ...) need a dedicated projection.
        if (p.children && /:(?:hover|active|focus)|\[\s*(?:data-state|aria-selected)/i.test(cssText(p.children))) throw Error('Unsupported state nested in ' + name);
        compound += ':' + cssText([p]); continue;
      }
      compound += cssText([n]);
    }
    if (compound || changed) flush();
    return {selector:output.trim() || '*', changed};
  };
  const selectors = splitCss(parseCss(selector)).map(nodes => project(nodes).selector);
  return {selectors, pseudoElements:[...pseudos]};
}
