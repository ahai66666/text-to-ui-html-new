import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";

export const tableState = (id = "table", { title = "项目列表", columns = ["名称", "负责人", "状态"], rows = [["客户端设计系统", "赵博海", "进行中"], ["组件规范", "林晓", "已完成"]] } = {}) => {
  if (!Array.isArray(columns) || !columns.length || !Array.isArray(rows) || rows.some((row) => !Array.isArray(row))) throw new Error("Table columns and rows must be arrays");
  const cell = (value, index) => {
    const label = escapeHtml(value);
    const tone = index === 2 ? ({ "进行中": "info", "已完成": "success" }[String(value)] ?? null) : null;
    return `<td data-typography-role="body-l">${tone ? `<span class="tui-badge tui-badge--${tone}" data-typography-role="body-s">${label}</span>` : label}</td>`;
  };
  return `<div class="tui-component tui-table" ${attrs(id, `${id === "data-table" ? "Data Table" : "Table"}/Default`, "default", "default")}><div class="tui-table__heading"><h4 data-slot="title" data-typography-role="title-s">${escapeHtml(title)}</h4><span data-slot="description" data-typography-role="body-m">${rows.length} 个项目</span></div><table><thead><tr>${columns.map((name) => `<th scope="col" data-typography-role="body-m">${escapeHtml(name)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map(cell).join("")}</tr>`).join("")}</tbody></table></div>`;
};

export const componentId = "table";
const renderer = (options = {}) => tableState("table", options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
