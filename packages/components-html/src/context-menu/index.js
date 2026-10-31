import { renderMarkup } from '../shared/render-markup.js';
import { menuComponent } from "../shared/advanced-menuComponent.js";

export const contextMenu = () => menuComponent("context-menu", "Context Menu/Default", "更多操作", "右键或点击打开", [{ label: "复制", icon: "action/copy" }, { label: "重命名", icon: "action/rename" }, { label: "删除", icon: "action/delete" }]);

export const componentId = "context-menu";
const renderer = contextMenu;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
