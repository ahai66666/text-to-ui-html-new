import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const progressState = ({ value = 68, label = null } = {}) => `<div class="tui-component tui-progress" ${attrs("progress", "Progress/Default", "default", "default")} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" style="--progress-value:${Math.min(100, Math.max(0, Number(value)))}%">${label ? `<span class="tui-progress__label" data-typography-role="body-s">${escapeHtml(label)} · ${value}%</span>` : ""}<div class="tui-progress__track"><span class="tui-progress__value"></span></div></div>`;

export const componentId = "progress";
const renderer = (options = {}) => progressState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
