import { disclosureState } from "../shared/core-disclosureState.js";
import { renderMarkup } from '../shared/render-markup.js';

export const componentId = "accordion";
const renderer = ({ title, label, detail = "基础信息、成员与通知方式", expanded = false, contentId = "accordion-content", disabled = false, state = "default", ...options } = {}) =>
  disclosureState(componentId, { ...options, title: title ?? label ?? "项目设置", detail, expanded, contentId, disabled, state });
export const render = options => renderMarkup(componentId, options, renderer);
export default render;
