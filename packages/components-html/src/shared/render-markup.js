import { escapeHtml } from './core-escapeHtml.js';
export function renderMarkup(name, options, renderer) {
  const resolvedOptions = name === 'checkbox' && options ? {checked: false, description: '', ...options} : options;
  const markup = renderer(resolvedOptions);
  if (/\bdata-renderer-key=/.test(markup)) return markup;
  return markup.replace(/(<[a-z][^>]*\bdata-component="[^"]+")/i, '$1 data-renderer-key="' + escapeHtml(name) + '"');
}
