import { renderButton } from "../button/index.js";
import { renderMarkup } from "../shared/render-markup.js";
import { attrs } from "../shared/advanced-attrs.js";
import { escapeHtml } from "../shared/advanced-escapeHtml.js";

export const slot = (value, fallback = "") => value === undefined || value === null ? fallback : String(value);

const defaultActions = [
  { id: "preview", label: "预览" },
  { id: "download", label: "下载", icon: "action/download" }
];

export function resolveAttachmentActions(actions = defaultActions) {
  if (!Array.isArray(actions)) throw new Error("Attachment actions must be an array of { id, label, icon?, disabled? }");
  const ids = new Set();
  for (const action of actions) {
    if (typeof action?.id !== "string" || !action.id.trim() || typeof action.label !== "string" || !action.label.trim()) {
      throw new Error("Attachment actions require a nonempty id and label");
    }
    if (ids.has(action.id)) throw new Error("Duplicate Attachment action id: " + action.id);
    ids.add(action.id);
  }
  return actions;
}

export function attachmentActions({ actions = defaultActions, disabled = false } = {}) {
  const items = resolveAttachmentActions(actions);
  if (!items.length) return "";
  const wrap = (content) => `<span class="tui-attachment__actions" data-slot="actions">${content}</span>`;
  if (items.length === 1) {
    const [action] = items;
    return wrap(renderButton({
      label: action.label, icon: action.icon, mode: action.icon ? "icon" : "text", variant: "ghost",
      disabled: disabled || action.disabled, extraAttrs: ` data-slot="direct-action" data-action="${escapeHtml(action.id)}"`
    }));
  }
  const trigger = renderButton({
    label: "更多附件操作", icon: "action/more", iconSize: 20, mode: "icon", variant: "ghost", disabled,
    className: "tui-attachment__menu-trigger", extraAttrs: ' data-slot="menu-trigger" aria-haspopup="menu" aria-expanded="false"'
  });
  const menuItems = items.map((action) => `<button class="tui-button-dropdown__item" type="button" role="menuitem" tabindex="-1" data-action="${escapeHtml(action.id)}" data-typography-role="body-l"${disabled || action.disabled ? " disabled" : ""}>${escapeHtml(action.label)}</button>`).join("");
  return wrap(`${trigger}<span class="tui-button-dropdown__menu tui-attachment__menu" data-slot="menu" role="menu" aria-label="附件操作" tabindex="-1" hidden>${menuItems}</span>`);
}

export const attachment = (options = {}) => {
  const { items, ...single } = options;
  if (Array.isArray(items)) {
    return `<div class="tui-component tui-attachment-list" data-component="attachment" data-logical-component="Attachment/Default" data-variant="collection" data-state="default" data-framework="html" role="list">${items.map((item) => attachment(item)).join("")}</div>`;
  }
  const { type = "PDF", name = "项目说明.pdf", meta = "2.4 MB · 已上传", leading, content, actions, disabled = false } = single;
  const trailing = typeof actions === "string" ? actions : attachmentActions({ actions: actions ?? undefined, disabled });
  return `<article class="tui-component tui-attachment" ${attrs("attachment", "Attachment/Default", "default", disabled ? "disabled" : "default")}${disabled ? " aria-disabled=\"true\"" : ""}>${slot(leading, `<span class="tui-attachment__type" data-slot="leading" data-typography-role="body-s">${escapeHtml(type)}</span>`)}${slot(content, `<div data-slot="content"><strong data-slot="title" data-typography-role="subtitle-s">${escapeHtml(name)}</strong><small data-slot="description" data-typography-role="body-s">${escapeHtml(meta)}</small></div>`)}${trailing}</article>`;
};

export const componentId = "attachment";
const renderer = attachment;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
