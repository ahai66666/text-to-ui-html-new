import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";

export const comboboxMenuItems = ["思源黑体", "源然雅黑", "鸿蒙黑体", "宋体", "黑体"];

export const comboboxState = ({ label = "字体", value = "思源黑体", options = comboboxMenuItems, disabled = false, surface = "white" } = {}) => `<div class="tui-component tui-select tui-combobox" ${attrs("combobox", "Combobox/Default", "default", disabled ? "disabled" : "default", ` data-surface="${surface}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><div class="tui-select__trigger tui-combobox__trigger"><input class="tui-combobox__input" data-slot="value" data-typography-role="body-m" type="text" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="combobox-options" aria-autocomplete="list" autocomplete="off" data-filter-active="false" value="${escapeHtml(value)}"${disabled ? " disabled" : ""} /><span class="tui-combobox__chevron" aria-hidden="true">${icon("navigation/chevron-down", "", { size: 16 })}</span></div><div id="combobox-options" class="tui-select__menu" role="listbox" aria-label="${escapeHtml(label)}" hidden>${options.map((option, index) => `<button type="button" role="option" aria-selected="${index === 0}" data-value="${escapeHtml(option)}" data-typography-role="body-l">${escapeHtml(option)}</button>`).join("")}</div></div>`;

export const componentId = "combobox";
const renderer = (options = {}) => comboboxState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
