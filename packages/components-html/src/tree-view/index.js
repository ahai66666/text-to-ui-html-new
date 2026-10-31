import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";
import { attrs } from "../shared/core-attrs.js";

export const treeViewNodes = [
  { id: "workspace", label: "工作空间", trailing: "24", children: [{ id: "projects", label: "项目", trailing: "12", children: [{ id: "design-system", label: "设计系统" }, { id: "component-library", label: "组件库" }] }, { id: "members", label: "成员", trailing: "8" }] },
  { id: "archive", label: "归档" }
];

export const treeViewItem = (node, depth = 1, expanded = true, selected = false) => {
  const hasChildren = Boolean(node.children?.length);
  const childMarkup = hasChildren ? `<ul class="tui-tree-view__group" role="group"${expanded ? "" : " hidden"}>${node.children.map((child) => treeViewItem(child, depth + 1, child.id === "projects" || child.id === "design-system", child.id === "design-system")).join("")}</ul>` : "";
  const trailingMarkup = node.trailing ? `<span class="tui-tree-view__trailing" data-slot="trailing" data-typography-role="body-m">${escapeHtml(node.trailing)}</span>` : "";
  return `<li class="tui-tree-view__node" data-node-id="${escapeHtml(node.id)}"><button type="button" role="treeitem" class="tui-tree-view__item${selected ? " is-selected" : ""}" data-tree-toggle="${hasChildren ? "true" : "false"}" data-node-id="${escapeHtml(node.id)}" style="--tree-indent:${Math.max(0, depth - 1) * 12}px" aria-level="${depth}" aria-selected="${selected ? "true" : "false"}"${hasChildren ? ` aria-expanded="${expanded ? "true" : "false"}"` : ""}><span class="tui-tree-view__chevron${hasChildren ? " has-children" : ""}${expanded ? " is-expanded" : ""}" aria-hidden="true">${hasChildren ? icon("navigation/chevron-right", "", { size: 20 }) : ""}</span><span class="tui-tree-view__icon" data-slot="leading" aria-hidden="true">${icon(hasChildren ? "navigation/grid" : "object/file", "", { size: 20 })}</span><span class="tui-tree-view__label" data-slot="label" data-typography-role="body-l">${escapeHtml(node.label)}</span>${trailingMarkup}</button>${childMarkup}</li>`;
};

export const treeViewState = () => `<nav class="tui-component tui-tree-view" ${attrs("tree-view", "Tree View/Default", "default", "default")} aria-label="项目结构" role="tree"><ul class="tui-tree-view__nodes" role="group">${treeViewNodes.map((node) => treeViewItem(node, 1, node.id === "workspace", node.id === "design-system")).join("")}</ul></nav>`;

export const componentId = "tree-view";
const renderer = () => treeViewState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
