import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";

export const tooltipState = () => `<div class="tui-component tui-tooltip" ${attrs("tooltip", "Tooltip/Default", "default", "default")}><button class="tui-button tui-button--ghost" type="button" data-variant="ghost" data-typography-role="body-l">刷新列表</button><span class="tui-tooltip__panel" role="tooltip" data-slot="content" data-typography-role="body-l">刷新列表</span></div>`;

export const componentId = "tooltip";
const renderer = () => tooltipState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
