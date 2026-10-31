import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";

export const menuItems = ["进行中", "已完成", "已归档"];

export const selectState = ({ id = "select", label = "状态", value = "进行中", open = false, disabled = false, surface = "white" } = {}) => `<div class="tui-component tui-select" ${attrs(id, `${id === "combobox" ? "Combobox" : "Select"}/Default`, "default", disabled ? "disabled" : "default", ` data-surface="${surface}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><button class="tui-select__trigger" type="button" role="${id === "combobox" ? "combobox" : "button"}" aria-haspopup="listbox" aria-expanded="${open}"${disabled ? " disabled" : ""}><span data-slot="value" data-typography-role="body-m">${escapeHtml(value)}</span>${icon("navigation/chevron-down", "", { size: 16 })}</button><div class="tui-select__menu" role="listbox" hidden><button type="button" role="option" aria-selected="true" data-value="${escapeHtml(value)}" data-typography-role="body-l">${escapeHtml(value)}</button>${menuItems.filter((item) => item !== value).map((item) => `<button type="button" role="option" aria-selected="false" data-value="${escapeHtml(item)}" data-typography-role="body-l">${escapeHtml(item)}</button>`).join("")}</div></div>`;

export const componentId = "select";
const renderer = (options = {}) => selectState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
