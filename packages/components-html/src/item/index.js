import { renderMarkup } from '../shared/render-markup.js';
import { icon } from "../shared/core-icon.js";
import { checkboxIndicator } from "../checkbox/index.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { slot } from "../shared/core-slot.js";
import { attrs } from "../shared/core-attrs.js";

export const itemTrailing = (type = "text-arrow", value = "详情") => {
  if (type === "icon") return `<span class="tui-item__trailing tui-item__trailing--icon" data-slot="trailing">${icon("action/more", "", { size: 20 })}</span>`;
  if (type === "radio") return `<label class="tui-item__trailing tui-choice" data-slot="trailing"><input type="radio" checked aria-label="已选中"/><span class="tui-radio__indicator" aria-hidden="true"></span></label>`;
  if (type === "checkbox") return `<label class="tui-item__trailing tui-choice tui-checkbox" data-slot="trailing"><input type="checkbox" checked aria-label="已选中"/>${checkboxIndicator()}</label>`;
  if (type === "switch") return `<label class="tui-item__trailing tui-choice tui-switch" data-slot="trailing"><input type="checkbox" role="switch" checked aria-label="已开启"/><span class="tui-switch__track" aria-hidden="true"></span></label>`;
  if (type === "notification-arrow") return `<span class="tui-item__trailing tui-item__trailing--notification-arrow" data-slot="trailing"><span class="tui-item__notification-dot" aria-label="有新事件"></span>${icon("navigation/chevron-right", "", { size: 20 })}</span>`;
  return `<span class="tui-item__trailing tui-item__trailing--text-arrow" data-slot="trailing" data-typography-role="body-m"><span>${escapeHtml(value)}</span>${icon("navigation/chevron-right", "", { size: 20 })}</span>`;
};

export const itemState = ({ title = "HarmonyOS 组件规范", description = "", supporting = "", lines = description ? supporting ? 3 : 2 : 1, leadingIcon = "navigation/grid", trailing = "text-arrow", trailingText = "详情", id = "list-card", logicalName = "List Item/White Surface/Default", leading, titleSlot, descriptionSlot, supportingSlot, content, trailingSlot, actions, selected = false, disabled = false } = {}) => {
  const state = disabled ? "disabled" : selected ? "selected" : "default";
  const leadingMarkup = slot(leading, `<span class="tui-item__leading" data-slot="leading">${icon(leadingIcon, "", { size: 24 })}</span>`);
  const titleMarkup = slot(titleSlot, escapeHtml(title));
  const descriptionMarkup = slot(descriptionSlot, description ? escapeHtml(description) : "");
  const supportingMarkup = slot(supportingSlot, supporting ? escapeHtml(supporting) : "");
  const contentMarkup = slot(content, `<span data-slot="title" data-typography-role="body-l">${titleMarkup}</span>${descriptionMarkup ? `<span data-slot="description" data-typography-role="body-m">${descriptionMarkup}</span>` : ""}${supportingMarkup ? `<span data-slot="supporting" data-typography-role="body-s">${supportingMarkup}</span>` : ""}`);
  const trailingMarkup = trailingSlot !== undefined
    ? slot(trailingSlot)
    : (typeof trailing === "string" && /<[^>]+>/.test(trailing) ? trailing : itemTrailing(trailing, trailingText));
  return `<div class="tui-component ${id === "list-card" ? "tui-list-card" : "tui-item"}" role="button" tabindex="${disabled ? "-1" : "0"}" ${attrs(id, logicalName, `line-${lines}`, state, ` data-lines="${lines}"`)}${selected ? " aria-selected=\"true\"" : ""}${disabled ? " aria-disabled=\"true\"" : ""}>${leadingMarkup}<span class="tui-item__content" data-slot="content">${contentMarkup}</span>${trailingMarkup}${actions ? `<span class="tui-item__actions" data-slot="actions">${slot(actions)}</span>` : ""}</div>`;
};

export const componentId = "item";
const renderer = (options = {}) => itemState({ id: "item", logicalName: "List Item/White Surface/Default", ...options });
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
