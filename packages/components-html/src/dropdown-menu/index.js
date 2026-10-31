import { renderMarkup } from '../shared/render-markup.js';
import { menuComponent } from "../shared/advanced-menuComponent.js";

export const dropdownMenu = ({ label = "操作菜单", value = "新建、导入、导出", items = ["新建", "导入", "导出"], ...options } = {}) => menuComponent("dropdown-menu", "Dropdown Menu/Default", label, value, items, options);

export const componentId = "dropdown-menu";
const renderer = dropdownMenu;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
