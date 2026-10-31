import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";

export const popover = () => `<div class="tui-component tui-advanced-popover" ${attrs("popover", "Popover/Default")}><button class="tui-button" type="button" data-variant="ghost" data-typography-role="body-l" aria-expanded="false">筛选条件</button><div class="tui-advanced-popover__panel" role="dialog" hidden><strong data-typography-role="title-s">筛选条件</strong><span data-typography-role="body-m">状态、负责人、更新时间</span></div></div>`;

export const componentId = "popover";
const renderer = popover;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
