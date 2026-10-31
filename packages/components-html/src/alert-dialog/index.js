import { renderMarkup } from '../shared/render-markup.js';
import { overlayLayer } from "../shared/advanced-overlayLayer.js";

export const alertDialog = () => overlayLayer({ id: "alert-dialog", triggerLabel: "打开删除确认弹窗", role: "alertdialog", title: "删除项目？", description: "删除后无法恢复，请确认操作。", modifier: "tui-dialog--alert", actions: [{ action: "cancel", variant: "secondary", label: "取消" }, { action: "confirm", variant: "danger", label: "删除" }] });

export const componentId = "alert-dialog";
const renderer = alertDialog;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
