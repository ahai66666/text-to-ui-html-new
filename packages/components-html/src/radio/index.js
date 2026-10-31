import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const radioState = ({ checked = false, disabled = false, label = "邮件", name = "runtime-radio", value = "邮件", ariaLabel } = {}) => `<label class="tui-component tui-choice tui-radio" ${attrs("radio", "Radio/Unselected/Default", checked ? "selected" : "unselected", disabled ? "disabled" : checked ? "selected" : "default")}${ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : ""}><input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(value)}"${checked ? " checked" : ""}${disabled ? " disabled" : ""}/><span class="tui-radio__indicator" data-slot="control" aria-hidden="true"></span>${label ? `<span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span>` : ""}</label>`;

export const componentId = "radio";
const renderer = (options = {}) => radioState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
