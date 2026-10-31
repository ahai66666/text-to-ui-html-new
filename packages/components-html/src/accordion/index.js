import { disclosureState } from "../shared/core-disclosureState.js";
import { renderMarkup } from '../shared/render-markup.js';

export const componentId = "accordion";
const renderer = (options = {}) => disclosureState("accordion", { title: "项目设置", detail: "基础信息、成员与通知方式", ...options });
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
