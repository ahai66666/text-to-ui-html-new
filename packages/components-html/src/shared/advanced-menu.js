import { icon } from "./advanced-icon.js";
import { escapeHtml } from "./advanced-escapeHtml.js";

export const menu = (items, { scopeOptions = false, selectedValue = "" } = {}) => items.map((item) => {
  const entry = typeof item === "string" ? { label: item } : item;
  const leading = entry.icon
    ? `<span class="tui-advanced-menu__item-leading" data-slot="leading">${icon(entry.icon, 24)}</span>`
    : "";
  const trailing = entry.hasSubmenu
    ? `<span class="tui-advanced-menu__item-trailing" data-slot="trailing">${icon("navigation/chevron-right", 24)}</span>`
    : "";
  const submenu = entry.hasSubmenu && Array.isArray(entry.submenu)
    ? `<div class="tui-advanced-menu__submenu" role="menu" aria-label="${escapeHtml(entry.label)}" hidden>${menu(entry.submenu, { scopeOptions, selectedValue })}</div>`
    : "";
  const scopeOption = scopeOptions ? ` data-scope-option="${escapeHtml(entry.label)}" aria-selected="${String(entry.label) === String(selectedValue)}"` : "";
  return `<div class="tui-advanced-menu__item-wrap${entry.hasSubmenu ? " has-submenu" : ""}"><button type="button" role="menuitem" class="tui-advanced-menu__item${entry.hasSubmenu ? " has-submenu" : ""}" data-typography-role="body-l"${entry.hasSubmenu ? " aria-haspopup=\"menu\" aria-expanded=\"false\"" : ""}${scopeOption}>${leading}<span data-slot="label">${escapeHtml(entry.label)}</span>${trailing}</button>${submenu}</div>`;
}).join("");
