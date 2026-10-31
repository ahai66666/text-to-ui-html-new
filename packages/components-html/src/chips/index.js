import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const chipsState = ({ label = "操作块", iconName = "action/mark-important", closable = true, disabled = false, state = "default" } = {}) => {
  const resolvedState = disabled ? "disabled" : state;
  const variant = `${iconName ? "with-icon" : "text-only"}${closable ? "-closable" : ""}`;
  return `<span class="tui-component tui-chip" ${attrs("chips", "Chips/Default", variant, resolvedState)}${closable ? "" : " data-close=\"false\""}${disabled ? " aria-disabled=\"true\"" : ""}><span class="tui-chip__leading" data-slot="leading">${iconName ? icon(iconName, "", { size: 16 }) : ""}</span><span class="tui-chip__label" data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span>${closable ? `<button class="tui-chip__close" data-slot="close" type="button" aria-label="移除 ${escapeHtml(label)}"${disabled ? " disabled" : ""}>${icon("action/close", "", { size: 16 })}</button>` : ""}</span>`;
};

export const componentId = "chips";
const renderer = (options = {}) => chipsState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
