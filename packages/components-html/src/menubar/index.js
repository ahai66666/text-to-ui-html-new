import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";
import { icon } from "../shared/advanced-icon.js";
import { menu } from "../shared/advanced-menu.js";

export const defaultMenubarItems = [{ label: "新建", icon: "action/add" }, { label: "打开", icon: "action/download", hasSubmenu: true, submenu: ["打开项目", "打开最近项目", "从设备打开"] }, { label: "导出", icon: "action/settings" }];

export const menubar = ({ items = defaultMenubarItems, surface = "gray" } = {}) => `<nav class="tui-component tui-advanced-menubar" ${attrs("menubar", "Menubar/Default")} data-surface="${surface === "white" ? "white" : "gray"}" aria-label="主菜单"><button class="tui-advanced-menu__trigger" type="button" aria-haspopup="menu" aria-expanded="false" data-typography-role="body-l">文件 ${icon("navigation/chevron-down", 16)}</button><div class="tui-advanced-menu__panel" role="menu" hidden>${menu(items)}</div></nav>`;

export const componentId = "menubar";
const renderer = menubar;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
