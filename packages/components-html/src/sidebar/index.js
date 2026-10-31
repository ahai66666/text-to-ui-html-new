import { renderMarkup } from '../shared/render-markup.js';
import { slot } from "../shared/core-slot.js";
import { icon } from "../shared/core-icon.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";

// Item identity belongs to the interactive row; list/group containers are layout only.
export const sidebarItemState = (item = {}) => {
  const selected = item.selected === true || item.state === "selected";
  const disabled = item.disabled === true || item.state === "disabled";
  const state = disabled ? "disabled" : selected ? "selected" : ["hover", "pressed", "focus"].includes(item.state) ? item.state : "default";
  return `<button class="tui-component tui-sidebar-item" ${attrs("sidebar", "Sidebar Item/Default", item.collapsed ? "collapsed" : selected ? "selected" : "default", state)} type="button"${selected ? ' aria-current="page"' : ""}${disabled ? " disabled" : ""}>${item.leading !== undefined ? `<span data-slot="leading">${slot(item.leading)}</span>` : `<span data-slot="leading">${icon(item.icon ?? "navigation/grid")}</span>`}<span data-slot="label" data-typography-role="body-l">${escapeHtml(item.label ?? "")}</span>${item.trailing !== undefined ? `<span data-slot="trailing">${slot(item.trailing)}</span>` : item.count !== undefined ? `<span class="tui-sidebar-item__count" data-slot="trailing" data-typography-role="body-m">${escapeHtml(item.count)}</span>` : ""}</button>`;
};
export const sidebarItemsMarkup = (items = [], collapsed = false) => items.map(item => sidebarItemState({ ...item, collapsed: item.collapsed ?? collapsed })).join("");
export const sidebarNavMarkup = ({ items = [], ariaLabel = "主导航", collapsed = false } = {}) => `<nav class="tui-sidebar" data-sidebar-layout="items" data-collapsed="${collapsed}" aria-label="${escapeHtml(ariaLabel)}">${sidebarItemsMarkup(items, collapsed)}</nav>`;

export function sidebarInstanceCount(options = {}) {
  if (!Object.hasOwn(options, "items") && !Object.hasOwn(options, "groups") && Object.hasOwn(options, "label")) return 1;
  const groups = Array.isArray(options.groups) ? options.groups.filter(group => group && Array.isArray(group.items)) : [];
  return groups.length ? groups.reduce((sum, group) => sum + group.items.length, 0) : (options.items ?? [{}, {}]).length;
}

const sidebarListState = ({ items = [{ label: "项目", icon: "navigation/grid", count: 24, selected: true }, { label: "最近访问", icon: "navigation/recent" }], groups = [], ariaLabel = "主导航", collapsed = false } = {}) => {
  const resolvedGroups = Array.isArray(groups) ? groups.filter((group) => group && Array.isArray(group.items)) : [];
  if (resolvedGroups.length <= 1) return sidebarNavMarkup({ items: resolvedGroups[0]?.items ?? items, ariaLabel: resolvedGroups[0]?.ariaLabel ?? ariaLabel, collapsed });
  return `<nav class="tui-sidebar-groups" data-sidebar-layout="groups" aria-label="${escapeHtml(ariaLabel)}">${resolvedGroups.map((group, index) => {
    const expanded = group.expanded !== false;
    const contentId = `sidebar-group-content-${index + 1}`;
    return `<section class="tui-disclosure tui-sidebar-group" data-disclosure-component="collapsible"><button class="tui-component tui-disclosure__trigger tui-sidebar-group__trigger" ${attrs("collapsible", "Collapsible/Default", expanded ? "open" : "default", expanded ? "open" : "default")} type="button" aria-expanded="${expanded}" aria-controls="${contentId}" data-typography-role="subtitle-s"><span data-slot="label">${escapeHtml(group.label ?? `导航组 ${index + 1}`)}</span>${icon("navigation/chevron-down", "", { size: 16 })}</button><div class="tui-disclosure__content tui-sidebar-group__content" id="${contentId}" data-slot="content"${expanded ? "" : " hidden"}>${sidebarNavMarkup({ items: group.items, ariaLabel: group.ariaLabel ?? group.label ?? ariaLabel, collapsed })}</div></section>`;
  }).join("")}</nav>`;
};

export const sidebarState = (options = {}) => !Object.hasOwn(options, "items") && !Object.hasOwn(options, "groups") && Object.hasOwn(options, "label") ? sidebarItemState(options) : sidebarListState(options);

export const componentId = "sidebar";
const renderer = (options = {}) => sidebarState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
