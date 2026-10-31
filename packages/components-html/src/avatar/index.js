import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const avatarState = ({ initials = "H", name = "HarmonyOS", size = 40 } = {}) => {
  const resolvedSize = Number(size) === 32 ? 32 : 40;
  return `<div class="tui-component tui-avatar" ${attrs("avatar", `Avatar/${resolvedSize}/Fallback`, `size-${resolvedSize}`, "default", ` data-size="${resolvedSize}"`)} aria-label="${escapeHtml(name)}" data-typography-role="body-s">${escapeHtml(initials)}</div>`;
};

export const componentId = "avatar";
const renderer = (options = {}) => avatarState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
