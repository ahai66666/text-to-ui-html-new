import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const textareaState = ({ surface = "white", state = "default", label = "项目说明", value = "统一 HarmonyOS PC 客户端中的布局、组件与交互规则。", disabled = false } = {}) => `<label class="tui-component tui-textarea" ${attrs("textarea", "Textarea/Default", "default", disabled ? "disabled" : state, ` data-surface="${surface}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><textarea data-slot="value" data-typography-role="body-l" rows="3" placeholder="请输入内容"${disabled ? " disabled" : ""}${state === "error" ? " aria-invalid=\"true\"" : ""}>${escapeHtml(value)}</textarea><span data-slot="help" data-typography-role="body-s">支持多行输入，最多 500 字</span></label>`;

export const componentId = "textarea";
const renderer = (options = {}) => textareaState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
