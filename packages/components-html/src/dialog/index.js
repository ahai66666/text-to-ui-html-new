import { renderMarkup } from '../shared/render-markup.js';
import { overlayLayer } from "../shared/advanced-overlayLayer.js";

export const dialog = () => `<div class="tui-overlay-specimens" data-component="dialog">${overlayLayer({ id: "dialog-single", componentId: "dialog", triggerLabel: "打开单按钮对话弹窗", title: "更新完成", description: "应用已经更新到最新版本。", actions: [{ action: "confirm", variant: "primary", label: "知道了" }] })}${overlayLayer({ id: "dialog-double", componentId: "dialog", triggerLabel: "打开双按钮对话弹窗", title: "确认更新？", description: "更新期间应用需要重新启动。", actions: [{ action: "cancel", variant: "secondary", label: "取消" }, { action: "confirm", variant: "primary", label: "确认" }] })}${overlayLayer({ id: "dialog-triple", componentId: "dialog", triggerLabel: "打开三按钮对话弹窗", title: "保存更改？", description: "你可以先保存草稿，稍后再继续编辑。", actions: [{ action: "confirm", variant: "primary", label: "确认" }, { action: "third", variant: "secondary", label: "保存草稿" }, { action: "cancel", variant: "secondary", label: "取消" }] })}</div>`;

export const componentId = "dialog";
const renderer = dialog;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
