import { icon } from "./core-icon.js";
import { escapeHtml } from "./core-escapeHtml.js";
import { slot } from "./core-slot.js";
import { attrs } from "./core-attrs.js";

export const disclosureState = (id, { title = "更多信息", detail = "点击展开查看详情", content, expanded = false, contentId = `${id}-content` } = {}) => {
  const isAccordion = id === "accordion";
  const triggerContent = isAccordion
    ? `${icon("navigation/chevron-right", "", { size: 20 })}<span data-slot="label" data-typography-role="body-m">${escapeHtml(title)}</span>`
    : `<span data-slot="label" data-typography-role="body-m">${escapeHtml(title)}</span>${icon("navigation/chevron-down", "", { size: 20 })}`;
  const isExpanded = Boolean(expanded);
  const contentMarkup = content === undefined ? escapeHtml(detail) : slot(content);
  const variant = isExpanded ? "open" : "default";
  return `<div class="tui-disclosure" data-disclosure-component="${id}"><button class="tui-component tui-disclosure__trigger" ${attrs(id, `${isAccordion ? "Accordion" : "Collapsible"}/Default`, variant, isExpanded ? "open" : "default")} type="button" aria-expanded="${isExpanded}" aria-controls="${escapeHtml(contentId)}" data-typography-role="body-m">${triggerContent}</button><div class="tui-disclosure__content" id="${escapeHtml(contentId)}" data-slot="content"${isExpanded ? "" : " hidden"} data-typography-role="body-l">${contentMarkup}</div></div>`;
};
