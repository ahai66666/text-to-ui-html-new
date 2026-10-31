import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";

export const snackbarState = ({ title, message, subtitle = "", action = null, actionLabel = "文本按钮", leftArea, closable = true } = {}) => {
  const resolvedTitle = title ?? message ?? "Title";
  const titleSubtitle = Boolean(subtitle);
  const resolvedLeftArea = titleSubtitle ? "2" : String(leftArea ?? "1");
  const variant = titleSubtitle ? "title-subtitle" : "title-only";
  const actionMarkup = action != null
    ? action
    : actionLabel
      ? `<button class="tui-button tui-button--ghost tui-snackbar__action" type="button" data-variant="ghost" data-size="small" data-typography-role="body-m">${escapeHtml(actionLabel)}</button>`
      : "";
  return `<div class="tui-component tui-snackbar" ${attrs("snackbar", "Snackbar/Default", variant, "default", ` data-left-area="${escapeHtml(resolvedLeftArea)}"`)} role="status"><span class="tui-snackbar__main"><span class="tui-snackbar__leading" data-slot="leading">${icon("status/info", "", { size: 24 })}</span><span class="tui-snackbar__content"><span class="tui-snackbar__title" data-slot="title" data-typography-role="subtitle-s">${escapeHtml(resolvedTitle)}</span>${titleSubtitle ? `<span class="tui-snackbar__subtitle" data-slot="subtitle" data-typography-role="body-s">${escapeHtml(subtitle)}</span>` : ""}</span></span><span class="tui-snackbar__actions">${actionMarkup ? `<span class="tui-snackbar__action-slot" data-slot="action">${actionMarkup}</span>` : ""}${closable ? `<button class="tui-icon-button tui-snackbar__close" data-slot="close" type="button" aria-label="关闭">${icon("action/close", "", { size: 20 })}</button>` : ""}</span></div>`;
};

export const componentId = "snackbar";
const renderer = (options = {}) => snackbarState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
