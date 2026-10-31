import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";

export const switchState = ({ checked = true, disabled = false } = {}) => `<label class="tui-component tui-choice tui-switch" ${attrs("switch", "Switch/Default", "default", disabled ? "disabled" : checked ? "selected" : "default")}><input type="checkbox" role="switch"${checked ? " checked" : ""}${disabled ? " disabled" : ""}/><span class="tui-switch__track" aria-hidden="true"></span><span data-slot="label" data-typography-role="body-m">自动同步</span><span data-slot="description" data-typography-role="body-m">已开启</span></label>`;

export const componentId = "switch";
const renderer = (options = {}) => switchState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
