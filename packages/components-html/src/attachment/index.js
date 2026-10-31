import { renderMarkup } from '../shared/render-markup.js';
import { icon } from "../shared/advanced-icon.js";
import { attrs } from "../shared/advanced-attrs.js";
import { escapeHtml } from "../shared/advanced-escapeHtml.js";

export const slot = (value, fallback = "") => value === undefined || value === null ? fallback : String(value);

export const attachmentActions = ({ disabled = false } = {}) => `<span class="tui-attachment__actions" data-slot="actions"><button class="tui-icon-button tui-attachment__menu-trigger" data-slot="menu-trigger" type="button" aria-label="打开附件操作菜单" aria-haspopup="menu" aria-expanded="false"${disabled ? " disabled" : ""}>${icon("navigation/chevron-down", 20)}</button><div class="tui-button-dropdown__menu tui-attachment__menu" data-slot="menu" role="menu" hidden><button class="tui-button-dropdown__item" type="button" role="menuitem" data-action="preview" data-typography-role="body-l">预览</button><button class="tui-button-dropdown__item" type="button" role="menuitem" data-action="download" data-typography-role="body-l">下载</button></div></span>`;

export const attachment = (options = {}) => {
  const { items, ...single } = options;
  if (Array.isArray(items)) {
    return `<div class="tui-component tui-attachment-list" data-component="attachment" data-logical-component="Attachment/Default" data-variant="collection" data-state="default" data-framework="html" role="list">${items.map((item) => attachment(item)).join("")}</div>`;
  }
  const { type = "PDF", name = "项目说明.pdf", meta = "2.4 MB · 已上传", leading, content, actions, disabled = false } = single;
  return `<article class="tui-component tui-attachment" ${attrs("attachment", "Attachment/Default", "default", disabled ? "disabled" : "default")}${disabled ? " aria-disabled=\"true\"" : ""}>${slot(leading, `<span class="tui-attachment__type" data-slot="leading" data-typography-role="body-s">${escapeHtml(type)}</span>`)}${slot(content, `<div data-slot="content"><strong data-slot="title" data-typography-role="subtitle-s">${escapeHtml(name)}</strong><small data-slot="description" data-typography-role="body-s">${escapeHtml(meta)}</small></div>`)}${slot(actions, attachmentActions({ disabled }))}</article>`;
};

export const componentId = "attachment";
const renderer = attachment;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
