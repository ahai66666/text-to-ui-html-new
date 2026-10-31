import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";

export const numberSelectorState = ({ label = "数量", value = 1, min = 0, max = 99, step = 1, disabled = false } = {}) => `<label class="tui-component tui-number-selector" ${attrs("number-selector", "Number Selector/Default", "default", disabled ? "disabled" : "default")}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><span class="tui-number-selector__control"><input type="number" data-slot="value" data-typography-role="body-l" value="${Number(value)}" min="${Number(min)}" max="${Number(max)}" step="${Number(step)}"${disabled ? " disabled" : ""}/><span class="tui-number-selector__stepper" aria-label="调整${escapeHtml(label)}"><button type="button" class="tui-number-selector__step" data-slot="increment" data-direction="increment" aria-label="增加${escapeHtml(label)}"${disabled ? " disabled" : ""}>${icon("navigation/chevron-up", "", { size: 16 })}</button><button type="button" class="tui-number-selector__step" data-slot="decrement" data-direction="decrement" aria-label="减少${escapeHtml(label)}"${disabled ? " disabled" : ""}>${icon("navigation/chevron-down", "", { size: 16 })}</button></span></span></label>`;

export const componentId = "number-selector";
const renderer = (options = {}) => numberSelectorState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
