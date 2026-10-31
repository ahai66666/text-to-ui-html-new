import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";

export const emptyState = ({ title = "暂无项目", description = "创建项目后会显示在这里。" } = {}) => `<section class="tui-component tui-empty" ${attrs("empty", "Empty/Default", "default", "default")} aria-live="polite"><h4 data-slot="title" data-typography-role="title-s">${escapeHtml(title)}</h4><p data-slot="description" data-typography-role="body-m">${escapeHtml(description)}</p><button class="tui-button tui-empty__action" type="button" data-variant="primary" data-typography-role="body-l">新建项目</button></section>`;

export const componentId = "empty";
const renderer = (options = {}) => emptyState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
