import { renderMarkup } from '../shared/render-markup.js';
import { icon } from "../shared/core-icon.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";

export const buttonTypeName = (variant = "primary") => {
  if (variant === "secondary") return "Secondary";
  if (variant === "ghost") return "Ghost";
  return "Primary";
};

export const logicalNameForButton = ({ mode = "text", variant = "primary", iconOnly = false } = {}) => {
  if (mode === "icon-text") return `Icon Text Button/${buttonTypeName(variant)}/Default`;
  if (mode === "icon") return `Icon Button/${variant === "secondary" ? "Secondary" : "Ghost"}/Default`;
  if (mode === "split-dropdown") return `Split Dropdown Button/${iconOnly ? "Icon Only" : "Icon Text"}/Default`;
  return `Button/${buttonTypeName(variant)}/Default`;
};

export const buttonContent = ({ label, iconName, icon: iconAlias, mode = "text", size = "standard", iconSize = null, includeChevron = false }) => {
  const resolvedIcon = iconName ?? iconAlias;
  const iconMarkup = resolvedIcon ? `<span data-slot="icon">${icon(resolvedIcon, "", iconSize ? { size: iconSize } : {})}</span>` : "";
  const labelMarkup = mode === "icon" ? "" : `<span data-slot="label" data-typography-role="${size === "small" ? "body-m" : "body-l"}">${escapeHtml(label)}</span>`;
  // Button dropdown chevrons use the shared 20px medium icon rule. Keep the
  // SVG's data-icon-size in sync with its CSS box and 1.25px outline weight.
  const chevronMarkup = includeChevron ? `<span data-slot="trigger">${icon("navigation/chevron-down", "", { size: 20 })}</span>` : "";
  return `${iconMarkup}${labelMarkup}${chevronMarkup}`;
};

export const renderButton = ({
  label = "新建项目",
  variant = "primary",
  size = "standard",
  mode = "text",
  logicalName,
  iconName,
  icon,
  iconSize = null,
  disabled = false,
  state,
  className = "",
  extraAttrs = ""
} = {}) => {
  const resolvedState = state ?? (disabled ? "disabled" : "default");
  const resolvedLogicalName = logicalName ?? logicalNameForButton({ mode, variant });
  const disabledAttr = disabled ? " disabled" : "";
  const modeClass = mode === "icon" ? " tui-button--icon" : "";
  const typeAttrs = mode === "icon" ? ` aria-label="${escapeHtml(label)}"` : "";
  return `<button class="tui-component tui-button${modeClass}${className ? ` ${className}` : ""}" type="button" ${attrs("button", resolvedLogicalName, variant, resolvedState, ` data-mode="${mode}" data-size="${size}"`)}${typeAttrs}${extraAttrs}${disabledAttr}>${buttonContent({ label, iconName, icon, mode, size, iconSize })}</button>`;
};

export const renderSplitDropdown = ({ label = "导出文件", iconName = "action/download", disabled = false, iconOnly = false, menuItems = ["导出为 PDF", "复制分享链接", "发送到设备"] } = {}) => {
  const state = disabled ? "disabled" : "default";
  const logicalName = logicalNameForButton({ mode: "split-dropdown", iconOnly });
  const mainLabel = iconOnly ? "" : `<span data-slot="label" data-typography-role="body-l">${escapeHtml(label)}</span>`;
  // Split-button leading icons are 20px (1.25px outline), while the
  // adjacent chevron is the smaller 16px control icon.
  const mainIcon = `<span data-slot="icon">${icon(iconName, "", { size: 20 })}</span>`;
  const main = `<button class="tui-component tui-button tui-split-button__main${iconOnly ? " tui-split-button__main--icon" : ""}" type="button" ${attrs("button", logicalName, "ghost", state, ` data-mode="split-dropdown" data-size="standard"`)}${iconOnly ? ` aria-label="${escapeHtml(label)}"` : ""}${disabled ? " disabled" : ""}>${mainIcon}${mainLabel}</button>`;
  const trigger = `<button class="tui-component tui-button tui-split-button__trigger" type="button" ${attrs("button", logicalName, "ghost", state, ` data-mode="split-dropdown" data-size="standard"`)} aria-label="展开更多操作" aria-haspopup="menu" aria-expanded="false"${disabled ? " disabled" : ""}>${icon("navigation/chevron-down", "", { size: 16 })}</button>`;
  const menu = menuItems.map((item) => `<button class="tui-button-dropdown__item" type="button" role="menuitem">${escapeHtml(item)}</button>`).join("");
  return `<div class="tui-component tui-split-button${iconOnly ? " tui-split-button--icon" : ""}" data-component="button" data-logical-component="${logicalName}" data-variant="ghost" data-state="${state}" data-mode="split-dropdown" data-framework="html"><div class="tui-split-button__control">${main}${trigger}</div><div class="tui-button-dropdown__menu" role="menu" hidden>${menu}</div></div>`;
};

export const componentId = "button";
const renderer = (options = {}) => renderButton(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
