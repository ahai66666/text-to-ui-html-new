import { renderMarkup } from '../shared/render-markup.js';
import { resolveTitlebarSegment } from "../../../component-contracts/src/titlebar-segments.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { renderButton } from "../button/index.js";
import { attrs } from "../shared/core-attrs.js";
import { buttonContent } from "../button/index.js";
import { icon } from "../shared/core-icon.js";
import { searchState } from "../search/index.js";

export const defaultTitlebarLogoSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%230A59F7'/%3E%3Ctext x='12' y='17' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' font-weight='700' fill='white'%3ET%3C/text%3E%3C/svg%3E";

export const titlebarActionType = (action) => {
  const type = action.buttonType ?? (action.showLabel ? "icon-text-ghost" : "icon");
  if (!["icon", "icon-text-ghost"].includes(type)) throw new Error(`Titlebar main-detail-actions only accepts icon or icon-text-ghost; received ${type}`);
  return type;
};

export const isTitlebarOverflowTrigger = (action) => Boolean(action?.overflowTrigger) || action?.id === "more" || action?.icon === "action/more";

export const normalizeTitlebarActions = (actions = [], actionOverflow = {}) => {
  const input = Array.isArray(actions) ? actions.filter(Boolean) : [];
  const business = input.filter((action) => !isTitlebarOverflowTrigger(action));
  const firstType = business.length ? titlebarActionType(business[0]) : "icon";
  const normalizedBusiness = business.map((action) => ({
    ...action,
    buttonType: firstType,
    showLabel: firstType === "icon-text-ghost"
  }));
  const suppliedTrigger = input.find(isTitlebarOverflowTrigger);
  const trigger = {
    id: "more",
    label: suppliedTrigger?.label ?? "更多操作",
    icon: suppliedTrigger?.icon ?? "action/more",
    buttonType: "icon",
    overflowTrigger: true,
    ...(suppliedTrigger ?? {})
  };
  trigger.id = "more";
  trigger.buttonType = "icon";
  trigger.overflowTrigger = true;
  return {
    business: normalizedBusiness,
    trigger,
    mode: firstType === "icon-text-ghost" ? "icon-text" : "icon",
    strategy: actionOverflow?.strategy ?? "collapse-to-more",
    fit: actionOverflow?.fit ?? "available-width",
    normalized: business.some((action) => titlebarActionType(action) !== firstType)
  };
};

export const titlebarState = (options = {}) => {
  let { label = "项目空间", paneTitle = "项目内容", size = "large", state = "default", disabled = false, layout, paneRole, mainContentLeading, mainDetailActions = [], secondaryPaneContent, actionOverflow = {}, showLogo, logoSrc = defaultTitlebarLogoSrc, logoAlt = "", showWindowControls } = resolveTitlebarSegment(options);
  // Pattern region names are public API; preserve the legacy styling role.
  if (paneRole === "main-detail" || paneRole === "main-content") paneRole = "final-pane";
  const controlIconSize = size === "small" ? 16 : 24;
  const actionModel = normalizeTitlebarActions(mainDetailActions, actionOverflow);
  const paneActions = layout === "three-column" && paneRole === "final-pane" && mainDetailActions.length ? `<div class="tui-titlebar__pane-actions" data-slot="main-detail-actions" data-action-scope="main-detail-pane-global" data-action-overflow="${escapeHtml(actionModel.strategy)}" data-action-overflow-fit="${escapeHtml(actionModel.fit)}" data-action-mode="${actionModel.mode}"${actionModel.normalized ? ` data-mode-normalized="true"` : ""} aria-label="Main Detail 栏级操作">${actionModel.business.map((action) => {
    const buttonType = titlebarActionType(action);
    const iconOnly = buttonType === "icon";
    return renderButton({
      label: action.label,
      variant: "ghost",
      mode: iconOnly ? "icon" : "icon-text",
      logicalName: iconOnly ? "Icon Button/Ghost/Default" : "Icon Text Button/Ghost/Default",
      iconName: action.icon ?? "action/more",
      disabled: disabled || action.disabled,
      state: disabled || action.disabled ? "disabled" : "default",
      className: `tui-titlebar__pane-action${iconOnly ? "" : " tui-titlebar__pane-action--text"}`,
      extraAttrs: ` data-slot="main-detail-action" data-action="${escapeHtml(action.id)}" data-button-type="${buttonType}" data-overflow-item="true"`
    });
  }).join("")}<button class="tui-component tui-button tui-button--icon tui-titlebar__pane-action tui-titlebar__overflow-trigger" type="button" ${attrs("button", "Icon Button/Ghost/Default", "ghost", disabled ? "disabled" : "default", ` data-mode="icon" data-size="standard" data-slot="main-detail-action" data-action="more" data-button-type="icon" data-overflow-trigger="true" data-overflow-item="false" aria-label="${escapeHtml(actionModel.trigger.label)}" aria-haspopup="menu" aria-expanded="false"`)}${disabled ? " disabled" : ""}>${buttonContent({ label: actionModel.trigger.label, iconName: actionModel.trigger.icon, mode: "icon", size: "standard" })}</button><div class="tui-titlebar__overflow-menu" role="menu" hidden>${actionModel.business.map((action) => `<button class="tui-titlebar__overflow-item" type="button" role="menuitem" data-overflow-menu-item="true" data-action="${escapeHtml(action.id)}"${disabled || action.disabled ? " disabled" : ""}>${icon(action.icon ?? "action/more", "", { size: 20 })}<span data-slot="label">${escapeHtml(action.label ?? action.id)}</span></button>`).join("")}</div></div>` : "";
  const contentLeadingType = mainContentLeading?.buttonType ?? "icon";
  const contentLeadingSlot = paneRole === "final-pane" && layout === "two-column" && mainContentLeading ? `<div class="tui-titlebar__pane-leading" data-slot="main-content-leading" data-action-scope="main-content-pane-global"><button class="tui-component tui-button${contentLeadingType === "icon" ? " tui-button--icon" : ""} tui-titlebar__pane-leading-action" type="button" ${attrs("button", contentLeadingType === "icon" ? "Icon Button/Ghost/Default" : "Icon Text Button/Ghost/Default", "ghost", disabled || mainContentLeading.disabled ? "disabled" : "default", ` data-mode="${contentLeadingType === "icon" ? "icon" : "icon-text"}" data-size="standard" data-slot="main-content-leading-action" data-action="${escapeHtml(mainContentLeading.id)}" data-button-type="${escapeHtml(contentLeadingType)}" aria-label="${escapeHtml(mainContentLeading.label)}"`)}${disabled || mainContentLeading.disabled ? " disabled" : ""}><span data-slot="icon">${icon(mainContentLeading.icon, "", { size: 24 })}</span>${contentLeadingType === "icon-text-ghost" ? `<span data-slot="label" data-typography-role="body-l">${escapeHtml(mainContentLeading.label)}</span>` : ""}</button></div>` : "";
  const paneTitleTypographyRole = size === "small" ? "subtitle-m" : "title-s";
  const paneTitleSlot = paneRole === "final-pane" && (layout === "two-column" || layout === "standalone") ? `<strong class="tui-titlebar__pane-title" data-slot="main-content-title" data-action-scope="main-content-pane-global" data-typography-role="${paneTitleTypographyRole}">${escapeHtml(paneTitle)}</strong>` : "";
  const secondaryContentSlot = paneRole === "secondary-pane" && secondaryPaneContent ? `<div class="tui-titlebar__secondary-content" data-slot="secondary-pane-content" data-component-slot="registered-component">${searchState(secondaryPaneContent.props ?? {})}</div>` : "";
  const logoSlot = showLogo ? `<span class="tui-titlebar__logo-slot" data-slot="logo"><img class="tui-titlebar__logo" src="${escapeHtml(logoSrc ?? defaultTitlebarLogoSrc)}" alt="${escapeHtml(logoAlt)}" aria-hidden="${logoAlt ? "false" : "true"}" /></span>` : "";
  const brand = paneRole === "global" || paneRole === "primary-navigation" ? `<span class="tui-titlebar__brand" data-slot="leading">${logoSlot}<span data-slot="label" data-typography-role="subtitle-m">${escapeHtml(label)}</span></span>` : "";
  const windowActions = showWindowControls ? `<div class="tui-titlebar__actions" data-slot="actions" data-component="titlebar-controls" data-logical-component="Titlebar Controls/Normal" data-size="medium">${[
    ["minimize", "最小化"],
    ["maximize", "最大化"],
    ["close", "关闭"]
  ].map(([action, text]) => renderButton({ label: text, variant: "ghost", size: "standard", mode: "icon", logicalName: "Icon Button/Ghost/Default", icon: `window/${action}`, iconSize: controlIconSize, disabled, className: "tui-titlebar__action", extraAttrs: ` data-slot="titlebar-action" data-action="${action}" data-button-type="icon"` })).join("")}</div>` : "";
  return `<header class="tui-component tui-titlebar" ${attrs("titlebar", "Titlebar/Default", size, disabled ? "disabled" : state)} data-size="${escapeHtml(size)}" data-layout="${escapeHtml(layout)}" data-pane-role="${escapeHtml(paneRole)}">${brand}${paneRole !== "global" && paneRole !== "primary-navigation" ? logoSlot : ""}${secondaryContentSlot}${contentLeadingSlot}${paneTitleSlot}${paneActions}${windowActions}</header>`;
};

export const componentId = "titlebar";
const renderer = (options = {}) => titlebarState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
