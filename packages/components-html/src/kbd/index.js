import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";

export const kbd = () => `<kbd class="tui-component tui-kbd" ${attrs("kbd", "Kbd/Default")} data-typography-role="body-m">⌘ K</kbd>`;

export const componentId = "kbd";
const renderer = kbd;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
