import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";

export const primaryNavigationIconAliases = Object.freeze({
  "primary-level/overview": "navigation/grid",
  "primary-level/calendar": "field/calendar",
  "primary-level/contacts": "navigation/contacts",
  "primary-level/mail": "navigation/mail-unread",
  "primary-level/settings": "action/settings"
});

export const resolvePrimaryNavigationIcon = (name) => primaryNavigationIconAliases[name] ?? name;

export const primaryNavigationItemState = ({ label = "项目", ariaLabel = label, iconName, icon: semanticIcon = "navigation/grid", selected = false, disabled = false, state = "default", className = "" } = {}) => {
  const resolvedState = disabled ? "disabled" : selected ? "selected" : state;
  const iconAlias = resolvePrimaryNavigationIcon(iconName ?? semanticIcon);
  return `<button class="tui-component tui-primary-navigation-item${className ? ` ${escapeHtml(className)}` : ""}" type="button" ${attrs("primary-navigation-item", "Primary Navigation Item/Level 1", selected ? "selected" : "default", resolvedState, ` data-placement="primary-navigation-shell" data-mode="icon-only"`)} aria-label="${escapeHtml(ariaLabel)}" aria-pressed="${selected}"${disabled ? " disabled" : ""}><span data-slot="icon">${icon(iconAlias, "", { size: 24 })}</span></button>`;
};

export const componentId = "primary-navigation-item";
const renderer = (options = {}) => primaryNavigationItemState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
