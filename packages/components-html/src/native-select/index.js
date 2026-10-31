import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";

export const nativeSelectState = ({ label = "视图", value = "列表视图", disabled = false, surface = "white" } = {}) => `<label class="tui-component tui-native-select" ${attrs("native-select", "Native Select/Default", "default", disabled ? "disabled" : "default", ` data-surface="${surface}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><span class="tui-native-select__control"><select data-slot="value" data-typography-role="body-m"${disabled ? " disabled" : ""}><option${value === "列表视图" ? " selected" : ""}>列表视图</option><option${value === "网格视图" ? " selected" : ""}>网格视图</option><option${value === "紧凑视图" ? " selected" : ""}>紧凑视图</option></select>${icon("navigation/chevron-down", "", { size: 16 })}</span></label>`;

export const componentId = "native-select";
const renderer = (options = {}) => nativeSelectState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
