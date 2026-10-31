import { disclosureState } from "../shared/core-disclosureState.js";
import { renderMarkup } from '../shared/render-markup.js';

export const componentId = "collapsible";
const renderer = (options = {}) => disclosureState("collapsible", options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
