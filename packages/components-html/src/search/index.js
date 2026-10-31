import { renderMarkup } from '../shared/render-markup.js';
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { dropdownMenu } from "../dropdown-menu/index.js";
import { attrs } from "../shared/core-attrs.js";
import { icon } from "../shared/core-icon.js";

export const searchSupportedStates = new Set(["default", "focus", "typing", "filled", "hover-left", "hover-right", "pressed-left", "pressed-right", "disabled"]);

export const searchState = ({ surface = "white", state = "default", placeholder = "搜索项目", disabled = false, value = "", advancedSearch = false, advancedSearchLabel = "高级", scope, defaultScope, scopeOptions = [], scopeLabel = "搜索范围" } = {}) => {
  const requestedState = searchSupportedStates.has(state) ? state : "default";
  const isDisabled = disabled || requestedState === "disabled";
  const resolvedState = isDisabled ? "disabled" : requestedState !== "default" ? requestedState : value ? "filled" : "default";
  const valueAttr = value ? ` value="${escapeHtml(value)}"` : "";
  const options = Array.isArray(scopeOptions) ? scopeOptions.filter(Boolean) : [];
  const scoped = options.length > 0;
  const selectedScope = scope ?? defaultScope ?? options[0] ?? "";
  const scopeSelector = scoped ? dropdownMenu({ label: scopeLabel, value: selectedScope, items: options, className: "tui-search__scope", slotName: "scope-selector", ariaLabel: scopeLabel, disabled: isDisabled, hideLabel: true, compact: true, scopeOptions: true }) : "";
  const variant = scoped ? advancedSearch ? "scoped-advanced-search" : "scoped-search" : advancedSearch ? "advanced-search" : "default";
  const logicalName = scoped ? "Search/Scoped/Default" : "Search/White Surface/Default";
  return `<label class="tui-component tui-search" ${attrs("search", logicalName, variant, resolvedState, ` data-surface="${surface}"`)}>${scopeSelector}<span class="tui-search__input-region" data-search-input-region><span data-slot="leading">${icon("field/search", "", { size: 16 })}</span><input data-slot="value" data-typography-role="body-l" type="search" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}"${valueAttr}${isDisabled ? " disabled" : ""} /><button class="tui-icon-button" data-slot="clear" type="button" aria-label="清除"${isDisabled ? " disabled" : ""}${value ? "" : " hidden"}>${icon("action/close", "", { size: 16 })}</button>${advancedSearch ? `<button class="tui-component tui-button tui-button--ghost tui-search__advanced" data-component="button" data-logical-component="Button/Ghost/Default" data-variant="ghost" data-state="${resolvedState}" data-framework="html" data-mode="text" data-size="small" data-slot="advanced-search" type="button" aria-label="${escapeHtml(advancedSearchLabel)}" aria-haspopup="dialog"${isDisabled ? " disabled" : ""}><span data-slot="label" data-typography-role="body-m">${escapeHtml(advancedSearchLabel)}</span></button>` : ""}</span></label>`;
};

export const componentId = "search";
const renderer = (options = {}) => searchState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
