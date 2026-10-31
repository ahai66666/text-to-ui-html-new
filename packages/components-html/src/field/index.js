import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const fieldState = ({ surface = "white", state = "default", label = "项目名称", value = "客户端设计系统", disabled = false } = {}) => `<label class="tui-component tui-field" ${attrs("field", "Field/Default", "default", disabled ? "disabled" : state, ` data-surface="${surface}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><span class="tui-field__control"><input data-slot="value" data-typography-role="body-l" type="text" value="${escapeHtml(value)}"${disabled ? " disabled" : ""}${state === "error" ? " aria-invalid=\"true\"" : ""}/></span><span data-slot="help" data-typography-role="body-s">这是一个必填字段</span></label>`;

export const componentId = "field";
const renderer = (options = {}) => fieldState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
