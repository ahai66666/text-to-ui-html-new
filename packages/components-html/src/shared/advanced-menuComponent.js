import { escapeHtml } from "./advanced-escapeHtml.js";
import { attrs } from "./advanced-attrs.js";
import { icon } from "./advanced-icon.js";
import { menu } from "./advanced-menu.js";

export const menuComponent = (id, logicalName, label, value, items, { className = "", slotName, ariaLabel, disabled = false, hideLabel = false, compact = false, scopeOptions = false } = {}) => `<div class="tui-component tui-advanced-menu${className ? ` ${escapeHtml(className)}` : ""}${compact ? " is-compact" : ""}" ${attrs(id, logicalName, "default", "default", `${slotName ? ` data-slot="${escapeHtml(slotName)}"` : ""}`)}><span class="tui-advanced-menu__label" data-typography-role="body-m"${hideLabel ? " hidden" : ""}>${escapeHtml(label)}</span><button class="tui-advanced-menu__trigger" type="button" aria-label="${escapeHtml(ariaLabel ?? label)}" aria-haspopup="menu" aria-expanded="false"${disabled ? " disabled" : ""}><span data-slot="value" data-typography-role="body-l">${escapeHtml(value)}</span>${icon("navigation/chevron-down", 16)}</button><div class="tui-advanced-menu__panel" role="menu" hidden>${menu(items, { scopeOptions, selectedValue: value })}</div></div>`;
