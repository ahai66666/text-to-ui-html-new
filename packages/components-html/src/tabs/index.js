import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";

export const tabsState = () => `<div class="tui-component tui-tabs" ${attrs("tabs", "Tabs/Default", "default", "default")}><div class="tui-tabs__list" role="tablist" aria-label="项目视图"><button type="button" role="tab" aria-selected="true" class="is-selected" data-tab="overview" data-typography-role="body-l">概览</button><button type="button" role="tab" aria-selected="false" data-tab="projects" data-typography-role="body-l">项目</button><button type="button" role="tab" aria-selected="false" data-tab="members" data-typography-role="body-l">成员</button></div><div class="tui-tabs__panel" role="tabpanel" data-tab-panel="overview" data-typography-role="body-l">工作空间概览</div></div>`;

export const componentId = "tabs";
const renderer = () => tabsState();
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
