import { tableState } from "../table/index.js";
import { renderMarkup } from '../shared/render-markup.js';

export const componentId = "data-table";
const renderer = (options = {}) => tableState("data-table", options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
