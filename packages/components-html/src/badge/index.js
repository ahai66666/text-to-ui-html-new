import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";

export const badgeState = ({ label = "进行中", tone = "info" } = {}) => `<span class="tui-component tui-badge tui-badge--${escapeHtml(tone)}" ${attrs("badge", "Badge/Default", tone, "default")} data-typography-role="body-s">${escapeHtml(label)}</span>`;

export const componentId = "badge";
const renderer = (options = {}) => badgeState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
