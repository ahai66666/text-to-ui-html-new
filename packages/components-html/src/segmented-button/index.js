import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const segmentedButtonState = ({ label = "视图模式", options = ["列表", "看板", "时间线"], value = options[0], disabled = false } = {}) => `<div class="tui-component tui-segmented-button" ${attrs("segmented-button", "Segmented Button/Default", "default", disabled ? "disabled" : "default")} role="group" aria-label="${escapeHtml(label)}">${options.map((option) => `<button type="button" class="tui-segmented-button__item${option === value ? " is-selected" : ""}" aria-pressed="${option === value}" data-value="${escapeHtml(option)}" data-slot="option" data-typography-role="body-m"${disabled ? " disabled" : ""}>${escapeHtml(option)}</button>`).join("")}</div>`;

export const componentId = "segmented-button";
const renderer = (options = {}) => segmentedButtonState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
