import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const feedbackIcon = (id, tone) => ({ info: "status/info", success: "status/success", warning: "status/warning", danger: "status/danger", neutral: "status/neutral" }[tone] ?? "status/info");

export const feedbackRole = (id, tone) => id === "alert" && (tone === "warning" || tone === "danger") ? "alert" : "status";

export const feedbackState = (id, tone, title, message) => `<div class="tui-component tui-${id} tui-${id}--${tone}" ${attrs(id, `${id[0].toUpperCase()}${id.slice(1)}/Default`, tone, "default")} role="${feedbackRole(id, tone)}"><span class="tui-${id}__icon">${icon(feedbackIcon(id, tone), "", { size: 20 })}</span><span class="tui-${id}__message" data-slot="content" data-typography-role="${id === "toast" ? "body-m" : "subtitle-s"}">${escapeHtml(message ?? title)}</span>${id === "alert" ? `<span class="tui-alert__actions" data-slot="actions"><button class="tui-button tui-button--ghost tui-alert__action" type="button" data-slot="action" data-variant="ghost" data-mode="text" data-size="small" data-button-type="small-ghost" data-typography-role="body-m">${escapeHtml(title)}</button><button class="tui-icon-button" data-slot="close" type="button" aria-label="关闭">${icon("action/close", "", { size: 20 })}</button></span>` : `<button class="tui-icon-button" data-slot="close" type="button" aria-label="关闭">${icon("action/close", "", { size: 20 })}</button>`}</div>`;

export const alertState = ({ tone = "info", title = "查看详情", message = "系统将在今晚自动完成更新。" } = {}) => feedbackState("alert", tone, title, message);

export const componentId = "alert";
const renderer = () => alertState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
