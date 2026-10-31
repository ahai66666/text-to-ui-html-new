import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";

export const radioGroupState = ({ value = "邮件" } = {}) => `<fieldset class="tui-component tui-choice tui-radio-group" ${attrs("radio-group", "Radio Group/Default", "default", "default")}><legend data-slot="label" data-typography-role="body-m">通知方式</legend><label><input type="radio" name="runtime-radio" value="邮件"${value === "邮件" ? " checked" : ""}/><span class="tui-radio__indicator" aria-hidden="true"></span><span data-typography-role="body-m">邮件</span></label><label><input type="radio" name="runtime-radio" value="站内消息"${value === "站内消息" ? " checked" : ""}/><span class="tui-radio__indicator" aria-hidden="true"></span><span data-typography-role="body-m">站内消息</span></label></fieldset>`;

export const componentId = "radio-group";
const renderer = (options = {}) => radioGroupState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
