import { renderMarkup } from '../shared/render-markup.js';
import { icon } from "../shared/core-icon.js";
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const checkboxIndicator = () => `<span class="tui-checkbox__indicator" aria-hidden="true">${icon("choice/check", "tui-checkbox__icon", { size: 16 })}</span>`;

export const checkboxState = ({ checked = true, disabled = false, label = "同步到云端", description = "保存后自动同步", name, value, ariaLabel } = {}) => `<label class="tui-component tui-choice tui-checkbox" ${attrs("checkbox", "Checkbox/Default", "default", disabled ? "disabled" : checked ? "selected" : "default")}${ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : ""}><input type="checkbox"${checked ? " checked" : ""}${disabled ? " disabled" : ""}${name ? ` name="${escapeHtml(name)}"` : ""}${value ? ` value="${escapeHtml(value)}"` : ""}/>${checkboxIndicator()}${label ? `<span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span>` : ""}${description ? `<span data-slot="description" data-typography-role="body-m">${escapeHtml(description)}</span>` : ""}</label>`;

export const componentId = "checkbox";
const renderer = (options = {}) => checkboxState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
