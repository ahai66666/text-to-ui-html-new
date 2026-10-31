import { renderMarkup } from '../shared/render-markup.js';
import { itemState } from "../item/index.js";

export const listCardState = (options = {}) => {
  const { items, ...singleOptions } = options;
  if (Array.isArray(items)) {
    return `<div class="tui-component tui-list-card-group" data-component="list-card" data-logical-component="List Item/White Surface/Default" data-variant="collection" data-state="default" data-framework="html" role="list">${items.map((item, index) => itemState({
      title: "HarmonyOS 组件规范",
      description: "刚刚更新 · 12 位成员",
      trailingText: "进行中",
      selected: index === 0,
      ...item,
      id: `list-card-${index + 1}`,
      logicalName: "List Item/White Surface/Default",
    })).join("")}</div>`;
  }
  return itemState({
    title: "HarmonyOS 组件规范",
    description: "刚刚更新 · 12 位成员",
    trailingText: "进行中",
    selected: true,
    ...singleOptions,
    id: "list-card",
    logicalName: "List Item/White Surface/Default"
  });
};

export const componentId = "list-card";
const renderer = (options = {}) => listCardState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
