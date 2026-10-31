import { renderMarkup } from "../shared/render-markup.js";
import { attrs } from "../shared/core-attrs.js";

export const subTabsState = ({ size = "default" } = {}) => {
  const resolvedSize = size === "small" ? "small" : "default";
  const prefix = resolvedSize === "small" ? "sub-tab-small" : "sub-tab";
  const panelId = resolvedSize === "small" ? "sub-tabs-small-panel" : "sub-tabs-panel";
  const labelRole = resolvedSize === "small" ? "body-m" : "subtitle-m";
  const idleRole = resolvedSize === "small" ? "body-m" : "body-l";
  return `<div class="tui-component tui-sub-tabs" ${attrs("sub-tabs", "Sub Tabs/Default", resolvedSize, "default", ` data-size="${resolvedSize}"`)}><div class="tui-sub-tabs__list" role="tablist" aria-label="子页签"><button type="button" role="tab" id="${prefix}-overview" aria-controls="${panelId}" aria-selected="true" tabindex="0" class="is-selected" data-tab="overview" data-typography-role="${labelRole}">概览</button><button type="button" role="tab" id="${prefix}-activity" aria-controls="${panelId}" aria-selected="false" tabindex="-1" data-tab="activity" data-typography-role="${idleRole}">活动</button><button type="button" role="tab" id="${prefix}-settings" aria-controls="${panelId}" aria-selected="false" tabindex="-1" data-tab="settings" data-typography-role="${idleRole}">设置</button></div><div class="tui-sub-tabs__panel" id="${panelId}" role="tabpanel" aria-labelledby="${prefix}-overview" data-tab-panel="overview" data-slot="content" data-typography-role="body-l">项目概览</div></div>`;
};

export const componentId = "sub-tabs";
const renderer = (options = {}) => subTabsState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
