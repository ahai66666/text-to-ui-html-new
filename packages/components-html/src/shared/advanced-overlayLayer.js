import { escapeHtml } from "./advanced-escapeHtml.js";
import { closeOverlayHandler } from "./advanced-closeOverlayHandler.js";
import { openOverlayHandler } from "./advanced-openOverlayHandler.js";
import { attrs } from "./advanced-attrs.js";
import { escapeOverlayHandler } from "./advanced-escapeOverlayHandler.js";
import { icon } from "./advanced-icon.js";

export const overlayLayer = ({ id, componentId = id, triggerLabel, role = "dialog", title, subtitle = "", description, modifier = "", actions, actionSlot = "", titlebarSlot = "", content = "", extra = "" }) => {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const titlebar = titlebarSlot || `<h4 id="${titleId}" data-slot="title" data-typography-role="title-s">${escapeHtml(title)}</h4>${subtitle ? `<p data-slot="subtitle" data-typography-role="body-m">${escapeHtml(subtitle)}</p>` : ""}`;
  const defaultActions = actions.map((action) => `<button class="tui-button" type="button" data-variant="${action.variant}" data-overlay-action="${action.action}" data-typography-role="body-l" onclick="${closeOverlayHandler}">${escapeHtml(action.label)}</button>`).join("");
  return `<div class="tui-overlay-example" data-overlay-example="${id}">
    <button class="tui-button" type="button" data-variant="secondary" data-overlay-trigger="${id}" data-typography-role="body-l" onclick="${openOverlayHandler}">${escapeHtml(triggerLabel)}</button>
    <div class="tui-overlay-layer" id="${id}" data-overlay-id="${id}" hidden${extra}>
      <div class="tui-overlay-backdrop" aria-hidden="true"></div>
      <section class="tui-component tui-dialog ${modifier}" ${attrs(componentId, `${componentId === "alert-dialog" ? "Alert Dialog" : componentId === "semi-modal" ? "Semi-modal" : "Dialog"}/Default`, componentId === "dialog" ? actions.length === 1 ? "single" : actions.length === 3 ? "triple" : "double" : "white", "open")} role="${role}" aria-modal="true" aria-labelledby="${titleId}" aria-describedby="${descriptionId}" tabindex="-1" onkeydown="${escapeOverlayHandler}">
        <header class="tui-dialog__header" data-slot="titlebar">${titlebar}${componentId === "semi-modal" ? `<button class="tui-icon-button tui-dialog__close" type="button" data-overlay-close aria-label="关闭">${icon("action/close", 20)}</button>` : ""}</header>
        <div class="tui-dialog__content"><p id="${descriptionId}" data-slot="description" data-typography-role="body-m">${escapeHtml(description)}</p>${content}</div>
        <footer class="tui-dialog__actions" data-slot="actions" data-action-layout="${actions.length === 1 ? "single" : actions.length === 3 ? "triple" : "double"}">${actionSlot || defaultActions}</footer>
      </section>
    </div>
  </div>`;
};
