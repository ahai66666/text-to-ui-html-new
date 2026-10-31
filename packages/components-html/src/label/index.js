import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const labelState = ({ text = "邮箱", forId = "project-name" } = {}) => `<label class="tui-component tui-label" ${attrs("label", "Label/Default", "default", "default")} for="${escapeHtml(forId)}" data-typography-role="body-m">${escapeHtml(text)}</label>`;

export const componentId = "label";
const renderer = (options = {}) => labelState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
