import { disclosureState } from "../shared/core-disclosureState.js";
import { renderMarkup } from '../shared/render-markup.js';

export const componentId = "collapsible";
const renderer = ({ title, label, detail = "点击展开查看详情", expanded = false, contentId = "collapsible-content", disabled = false, state = "default", ...options } = {}) =>
  disclosureState(componentId, { ...options, title: title ?? label ?? "更多信息", detail, expanded, contentId, disabled, state });
export const render = options => renderMarkup(componentId, options, renderer);
export default render;
