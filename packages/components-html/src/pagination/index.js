import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";

export const paginationState = () => `<nav class="tui-component tui-pagination" ${attrs("pagination", "Pagination/Default", "default", "default")} aria-label="分页"><button class="tui-icon-button" type="button" data-page="prev" aria-label="上一页">${icon("navigation/back", "", { size: 20 })}</button><button type="button" data-page="1" aria-current="page" data-typography-role="body-l">1</button><button type="button" data-page="2" data-typography-role="body-l">2</button><button type="button" data-page="3" data-typography-role="body-l">3</button><button class="tui-icon-button" type="button" data-page="next" aria-label="下一页">${icon("navigation/forward", "", { size: 20 })}</button></nav>`;

export const componentId = "pagination";
const renderer = () => paginationState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
