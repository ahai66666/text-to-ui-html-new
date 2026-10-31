import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";

export const breadcrumbState = () => `<nav class="tui-component tui-breadcrumb" ${attrs("breadcrumb", "Breadcrumb/Default", "default", "default")} aria-label="面包屑"><a href="#" data-typography-role="body-l">工作空间</a><span class="tui-breadcrumb__separator" aria-hidden="true">${icon("navigation/chevron-right", "", { size: 20 })}</span><a href="#" data-typography-role="body-l">项目</a><span class="tui-breadcrumb__separator" aria-hidden="true">${icon("navigation/chevron-right", "", { size: 20 })}</span><span aria-current="page" data-typography-role="subtitle-m">设置</span></nav>`;

export const componentId = "breadcrumb";
const renderer = () => breadcrumbState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
