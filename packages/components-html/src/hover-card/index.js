import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";

export const hoverCard = () => `<div class="tui-component tui-advanced-hover-card" ${attrs("hover-card", "Hover Card/Default")}><button class="tui-button" type="button" data-variant="ghost" data-typography-role="body-l">组件说明</button><div class="tui-advanced-hover-card__panel" role="tooltip"><strong data-typography-role="title-s">组件说明</strong><span data-typography-role="body-m">查看组件的详细使用规则</span></div></div>`;

export const componentId = "hover-card";
const renderer = hoverCard;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
