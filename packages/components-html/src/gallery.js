import { sidebarItemState, sidebarState } from "./sidebar/index.js";
import { badgeState } from "./badge/index.js";
import { primaryNavigationItemState } from "./primary-navigation-item/index.js";
import { escapeHtml } from "./shared/core-escapeHtml.js";
import { alertState } from "./alert/index.js";
import { snackbarState } from "./snackbar/index.js";
import { chipsState } from "./chips/index.js";
import { inputState } from "./input/index.js";
import { searchState } from "./search/index.js";
import { icon } from "./shared/core-icon.js";
import { attrs } from "./shared/core-attrs.js";
import { renderSplitDropdown } from "./button/index.js";
import { renderButton } from "./button/index.js";
import { itemState } from "./item/index.js";
import { createTitlebarPreviewScenes } from "../../component-contracts/src/titlebar-segments.js";
import { titlebarState } from "./titlebar/index.js";
import { textareaState } from "./textarea/index.js";
import { fieldState } from "./field/index.js";
import { renderHtmlComponent } from "./index.js";
import { selectState } from "./select/index.js";
import { comboboxState } from "./combobox/index.js";
import { nativeSelectState } from "./native-select/index.js";
import { checkboxState } from "./checkbox/index.js";
import { radioState } from "./radio/index.js";
import { radioGroupState } from "./radio-group/index.js";
import { switchState } from "./switch/index.js";
import { numberSelectorState } from "./number-selector/index.js";
import { tabsState } from "./tabs/index.js";
import { subTabsState } from "./sub-tabs/index.js";
import { treeViewState } from "./tree-view/index.js";
import { disclosureState } from "./shared/core-disclosureState.js";
import { avatarState } from "./avatar/index.js";
import { tableState } from "./table/index.js";
import { paginationState } from "./pagination/index.js";
import { breadcrumbState } from "./breadcrumb/index.js";
import { progressState } from "./progress/index.js";
import { emptyState } from "./empty/index.js";
import { labelState } from "./label/index.js";
import { tooltipState } from "./tooltip/index.js";
import { advancedHtmlComponents } from "./advanced.js";
import { resolveHtmlRendererKey } from "./index.js";

export const badgeSpecimens = () => `<div class="tui-badge-group" aria-label="Badge 颜色示例">${badgeState({ label: "进行中", tone: "info" })}${badgeState({ label: "已完成", tone: "success" })}${badgeState({ label: "待处理", tone: "warning" })}${badgeState({ label: "错误", tone: "danger" })}${badgeState({ label: "未开始", tone: "neutral" })}</div>`;

export const renderPrimaryNavigationItemGallery = () => `<nav class="tui-primary-navigation-items" aria-label="一级导航">${primaryNavigationItemState({ label: "工作台", iconName: "navigation/grid" })}${primaryNavigationItemState({ label: "项目", iconName: "field/calendar", selected: true })}${primaryNavigationItemState({ label: "消息", iconName: "navigation/mail-unread" })}${primaryNavigationItemState({ label: "设置", iconName: "action/settings" })}</nav>`;

export const alertRuntimeState = ({ specimens = [] } = {}) => `<div class="tui-feedback-specimens" data-runtime-component="alert">${specimens.map((specimen) => `<div class="tui-feedback-specimen" data-specimen="${escapeHtml(specimen.id ?? specimen.variant)}"><span class="tui-runtime-surface-label">${escapeHtml(specimen.label ?? specimen.variant)}</span>${alertState({ tone: specimen.variant, title: specimen.action, message: specimen.message })}</div>`).join("")}</div>`;

export const snackbarRuntimeState = ({ specimens = [] } = {}) => `<div class="tui-feedback-specimens" data-runtime-component="snackbar">${(specimens.length ? specimens : [{ id: "title-only", leftArea: "1" }, { id: "title-subtitle", leftArea: "2" }]).map((specimen) => {
  const titleSubtitle = specimen.leftArea === "2" || specimen.variant === "title-subtitle";
  return `<div class="tui-feedback-specimen" data-specimen="${escapeHtml(specimen.id ?? specimen.variant)}"><span class="tui-runtime-surface-label">${titleSubtitle ? "Title + Subtitle" : "Title"}</span>${snackbarState({ title: "Title", subtitle: titleSubtitle ? "Subtitle" : "", actionLabel: "文本按钮", leftArea: specimen.leftArea })}</div>`;
}).join("")}</div>`;

export const chipsRuntimeState = () => `<div class="tui-runtime-chips-gallery" data-runtime-component="chips">${chipsState()}</div>`;

export const stateLabel = (state) => ({ default: "Default", hover: "Hover", pressed: "Pressed", focus: "Focus", filled: "Filled", disabled: "Disabled", error: "Error" }[state] ?? state);

export function renderInputGallery() {
  const states = ["default", "hover", "focus", "filled", "disabled", "error"];
  const context = (surface, label) => `<section class="tui-runtime-state-group" data-surface-context="${surface}"><span data-typography-role="body-m">${label}</span><div class="tui-runtime-state-grid">${states.map((state) => `<div class="tui-runtime-state-cell"><span data-typography-role="body-s">${stateLabel(state)}</span>${inputState({ surface, state, value: state === "filled" ? "客户端设计系统" : "", disabled: state === "disabled" })}</div>`).join("")}</div></section>`;
  return `<div class="tui-runtime-core-gallery tui-runtime-input-gallery" data-component="input-gallery" data-framework="html"><p class="tui-runtime-note">白色内容面使用灰色输入面；灰色内容面使用白色输入面。下面每个控件都是真实 HTML Input 适配器，状态由 data-state 驱动。</p>${context("white", "White content surface")}${context("gray", "Gray content surface")}</div>`;
}

export function renderSearchGallery() {
  return `<div class="tui-runtime-core-gallery tui-runtime-search-gallery" data-component="search-gallery" data-framework="html"><p class="tui-runtime-note">Search 与 Input 共享 Surface 规则，输入、清除和 disabled 都由真实 DOM 控件提供。</p><div class="tui-runtime-surface-grid"><div class="tui-runtime-state-cell"><span data-typography-role="body-s">White content surface</span>${searchState({ surface: "white" })}</div><div class="tui-runtime-state-cell"><span data-typography-role="body-s">Gray content surface</span>${searchState({ surface: "gray" })}</div><div class="tui-runtime-state-cell"><span data-typography-role="body-s">Filled</span>${searchState({ surface: "white", state: "filled", value: "搜索项目" })}</div><div class="tui-runtime-state-cell"><span data-typography-role="body-s">Disabled</span>${searchState({ surface: "white", disabled: true })}</div></div></div>`;
}

export function renderSidebarGallery() {
  return `<div class="tui-runtime-core-gallery tui-runtime-sidebar-gallery"><p class="tui-runtime-note">每一行独立使用 Sidebar Item 身份，列表与分组只负责布局。</p>${sidebarState({items:[{label:"项目",count:24},{label:"Hover",state:"hover"},{label:"Pressed",state:"pressed"},{label:"Focus",state:"focus"},{label:"已选中",selected:true},{label:"Disabled",disabled:true}]})}${sidebarState({groups:[{label:"分组 A",items:[{label:"收件箱",count:12,selected:true}]},{label:"分组 B",items:[{label:"存档"}]}]})}</div>`;
}

export function renderListCardGallery() {
  const card = (title, state) => `<button class="tui-component tui-list-card" type="button" ${attrs("list-card", "List Item/White Surface/Default", state === "selected" ? "selected" : "default", state)} aria-pressed="${state === "selected" ? "true" : "false"}"><span data-slot="leading">${icon("navigation/list")}</span><span class="tui-list-card__content"><span class="tui-list-card__title" data-slot="title" data-typography-role="title-s">${title}</span><span class="tui-list-card__description" data-slot="description" data-typography-role="body-m">刚刚更新 · 12 位成员</span></span><span class="tui-list-card__meta" data-slot="trailing" data-typography-role="body-m">${stateLabel(state)}</span></button>`;
  return `<div class="tui-runtime-core-gallery tui-runtime-list-card-gallery" data-component="list-card-gallery" data-framework="html"><p class="tui-runtime-note">List Card 使用相同的真实 DOM 组件展示 Default、Hover、Pressed、Focus、Selected 和 Disabled。</p><div class="tui-runtime-state-grid tui-runtime-state-grid--single">${["default", "hover", "pressed", "focus", "selected", "disabled"].map((state) => `<div class="tui-runtime-state-cell"><span>${stateLabel(state)}</span>${card(state === "selected" ? "已选中的项目" : "HarmonyOS 组件规范", state)}</div>`).join("")}</div></div>`;
}

export function renderRuntimeHtmlComponent(id, options = {}) {
  const specimens = options.specimens ?? [{ id: "default", variant: "default", state: "default" }];
  if (id === "button") {
    const sample = (specimen) => {
      const mode = specimen.mode ?? "text";
      if (mode === "split-dropdown") {
        const iconOnly = specimen.iconOnly === true;
        return renderSplitDropdown({
          iconOnly,
          label: iconOnly ? "刷新" : "导出文件",
          iconName: iconOnly ? "action/refresh" : "action/download",
          menuItems: iconOnly ? ["重新加载", "同步数据", "清理缓存并刷新"] : undefined
        });
      }
      const variant = specimen.variant ?? "primary";
      const label = mode === "icon" ? "更多操作" : variant === "danger" ? "删除项目" : variant === "secondary" ? "次要操作" : variant === "ghost" ? "文本操作" : "确认操作";
      return renderButton({ label, variant, size: specimen.size ?? "standard", mode, iconName: mode === "icon-text" ? "action/add" : mode === "icon" ? "action/more" : undefined });
    };
    return `<div class="tui-runtime-structural-grid tui-runtime-structural-grid--button" data-runtime-component="button">${specimens.map((specimen) => `<div class="tui-runtime-structural-cell" data-specimen="${escapeHtml(specimen.id)}"><span class="tui-runtime-surface-label">${escapeHtml(specimen.id)}</span>${sample(specimen)}</div>`).join("")}</div>`;
  }
  if (id === "input") {
    const surfaces = ["white", "gray"];
    const basic = surfaces.map((surface) => `<div data-surface-context="${surface}"><span class="tui-runtime-surface-label">${surface === "white" ? "白色内容面 · 灰色输入面" : "灰色内容面 · 白色输入面"}</span>${inputState({ surface, state: "default", placeholder: "项目名称" })}</div>`).join("");
    const tagEntry = inputState({ surface: "gray", variant: "tag-entry", label: "参与成员", placeholder: "输入姓名后按 Enter", options: ["林娜", "王昊", "陈佳", "周明"], tags: ["林娜"] });
    return `<div class="tui-runtime-core-gallery"><p class="tui-runtime-note">Tag Entry 是一个通用变体：按内容面设置 surface="white" 或 "gray" 即可复用；此处直接展示组件。自由文本可保留，Enter 打开建议，方向键或点击选项后生成可移除标签。</p><div class="tui-runtime-surface-pair">${basic}</div>${tagEntry}</div>`;
  }
  if (id === "search") return `<div class="tui-runtime-surface-pair tui-runtime-search-pair"><div data-surface-context="white"><span class="tui-runtime-surface-label">白色内容面 · 灰色搜索面 · Search · Scoped + 高级</span>${searchState({ surface: "white", state: "default", placeholder: "搜索项目", scopeOptions: ["全部", "标题", "内容"], advancedSearch: true })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">灰色内容面 · 白色搜索面 · Search · Scoped + 高级</span>${searchState({ surface: "gray", state: "default", placeholder: "搜索项目", scopeOptions: ["全部", "标题", "内容"], advancedSearch: true })}</div></div>`;
  if (id === "primary-navigation-item") return `<div class="tui-runtime-core-gallery tui-runtime-primary-navigation-gallery"><p class="tui-runtime-note">一级导航使用独立的原生 Primary Navigation Item；Pattern 只负责把它放入底部对齐的 primary-navigation-shell。</p>${renderPrimaryNavigationItemGallery()}</div>`;
  if (id === "sidebar") {
    return sidebarState({items:[{label:"项目",selected:true,count:24},{label:"最近访问",icon:"navigation/recent"},{label:"与我共享",icon:"action/more"}]});
  }
  if (id === "list-card") {
    const listItem = (options) => itemState({ id: "list-card", logicalName: "List Item/White Surface/Default", ...options });
    return `<div class="tui-list-card-group" role="list">${listItem({ title: "项目设置", lines: 1, trailing: "text-arrow", trailingText: "详情" })}${listItem({ title: "成员权限", description: "管理角色和访问范围", lines: 2, trailing: "icon" })}${listItem({ title: "通知方式", description: "邮件通知", supporting: "已同步到云端", lines: 3, trailing: "radio" })}${listItem({ title: "自动同步", lines: 1, trailing: "switch" })}${listItem({ title: "项目归档", lines: 1, trailing: "checkbox" })}${listItem({ title: "更新动态", lines: 1, trailing: "notification-arrow" })}</div>`;
  }
  if (id === "titlebar") return `<div class="tui-runtime-titlebar-gallery" data-runtime-component="titlebar">${createTitlebarPreviewScenes().map(({ size, label, scenes }) => `<section class="tui-runtime-titlebar-size-group" data-preview-size="${size}"><h4 class="tui-runtime-titlebar-size-title">${label}</h4><div class="tui-runtime-titlebar-layouts">${scenes.map(scene => `<div data-preview-layout="${scene.layout}"><strong class="tui-runtime-titlebar-scenario-title">${scene.label}</strong><span class="tui-runtime-titlebar-scenario-slots">${scene.description}</span><div class="tui-runtime-titlebar-layout-shell tui-runtime-titlebar-layout-shell--${scene.columns}">${scene.segments.map(options => titlebarState(options)).join("")}</div></div>`).join("")}</div></section>`).join("")}</div>`;
  if (id === "textarea") return `<div class="tui-runtime-surface-pair tui-runtime-textarea-pair"><div data-surface-context="white"><span class="tui-runtime-surface-label">白色内容面 · 灰色输入面</span>${textareaState({ surface: "white" })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">灰色内容面 · 白色输入面</span>${textareaState({ surface: "gray" })}</div></div>`;
  if (id === "field") return fieldState({ surface: "white" });
  if (id === "form-field") return `<div class="tui-runtime-form-field-states"><div data-surface-context="white"><span class="tui-runtime-surface-label">默认 · 白色内容面 / 灰色输入面</span>${renderHtmlComponent("form-field", { surface: "white", control: "input" })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">默认 · 灰色内容面 / 白色输入面</span>${renderHtmlComponent("form-field", { surface: "gray", control: "input" })}</div><div data-surface-context="white"><span class="tui-runtime-surface-label">必填 · 白色内容面 / 灰色选择面</span>${renderHtmlComponent("form-field", { surface: "white", control: "select", required: true })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">必填 · 灰色内容面 / 白色选择面</span>${renderHtmlComponent("form-field", { surface: "gray", control: "select", required: true })}</div><div data-surface-context="white"><span class="tui-runtime-surface-label">错误 · 白色内容面 / 灰色输入面</span>${renderHtmlComponent("form-field", { surface: "white", control: "input", error: "项目名称不能为空", value: "" })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">错误 · 灰色内容面 / 白色输入面</span>${renderHtmlComponent("form-field", { surface: "gray", control: "input", error: "项目名称不能为空", value: "" })}</div></div>`;
  if (id === "select") return `<div class="tui-runtime-surface-pair"><div data-surface-context="white"><span class="tui-runtime-surface-label">白色内容面 · 灰色选择面</span>${selectState({ id: "select", surface: "white" })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">灰色内容面 · 白色选择面</span>${selectState({ id: "select", surface: "gray" })}</div></div>`;
  if (id === "combobox") return comboboxState();
  if (id === "native-select") return nativeSelectState();
  if (id === "checkbox") return checkboxState();
  if (id === "radio") return `<div class="tui-runtime-structural-grid" data-runtime-component="radio">${radioState({ checked: false, label: "未选中", value: "unselected" })}${radioState({ checked: true, label: "已选中", value: "selected" })}</div>`;
  if (id === "radio-group") return radioGroupState();
  if (id === "switch") return switchState();
  if (id === "segmented-button") return renderHtmlComponent(id, options);
  if (id === "number-selector") return numberSelectorState();
  if (id === "tabs") return tabsState();
  if (id === "sub-tabs") return `<div class="tui-runtime-sub-tabs-sizes"><div><span class="tui-runtime-surface-label">默认尺寸</span>${subTabsState()}</div><div><span class="tui-runtime-surface-label">小尺寸 · 28px</span>${subTabsState({ size: "small" })}</div></div>`;
  if (id === "tree-view") return treeViewState();
  if (id === "accordion") return renderHtmlComponent("accordion", options);
  if (id === "collapsible") return renderHtmlComponent("collapsible", options);
  if (id === "avatar") return `<div class="tui-runtime-avatar-pair"><div><span class="tui-runtime-surface-label">32 × 32</span>${avatarState({ initials: "H", name: "HarmonyOS 32", size: 32 })}</div><div><span class="tui-runtime-surface-label">40 × 40</span>${avatarState({ initials: "H", name: "HarmonyOS 40", size: 40 })}</div></div>`;
  if (id === "badge") return badgeSpecimens();
  if (id === "table") return tableState("table");
  if (id === "data-table") return tableState("data-table");
  if (id === "pagination") return paginationState();
  if (id === "breadcrumb") return breadcrumbState();
  if (id === "progress") return progressState();
  if (id === "empty") return emptyState();
  if (id === "label") return labelState();
  if (id === "alert") return alertRuntimeState({ specimens });
  if (id === "tooltip") return tooltipState();
  if (id === "snackbar") return snackbarRuntimeState({ specimens });
  if (id === "chips") return chipsRuntimeState({ specimens });
  if (id === "menubar") return `<div class="tui-runtime-surface-pair" data-runtime-component="menubar"><div data-surface-context="white"><span class="tui-runtime-surface-label">灰色底 · Menubar</span>${renderHtmlComponent(id, { surface: "gray" })}</div><div data-surface-context="gray"><span class="tui-runtime-surface-label">白色底 · Menubar</span>${renderHtmlComponent(id, { surface: "white" })}</div></div>`;
  if (id === "slider") return advancedHtmlComponents.slider({ ...options, gallery: true });
  if (advancedHtmlComponents[id]) return renderHtmlComponent(id, options);
  return resolveHtmlRendererKey(id) ? renderHtmlComponent(id, options) : `<p class="tui-runtime-framework-missing">HTML 适配器缺失：${escapeHtml(id)}</p>`;
}

export const galleryCell = (name, content, className = "") => `<div class="tui-button-gallery__cell${className ? ` ${className}` : ""}"><span class="tui-button-gallery__label">${escapeHtml(name)}</span>${content}</div>`;

export const sectionRule = (title) => `<div class="tui-button-gallery__rule"><span>${escapeHtml(title)}</span></div>`;

export function renderButtonGallery() {
  const variants = [
    ["Primary", "primary", "确认操作"],
    ["Secondary", "secondary", "次要操作"],
    ["Ghost", "ghost", "文本操作"],
    ["Danger", "danger", "删除项目"]
  ];
  const sized = ["standard", "small"].map((size) => {
    const title = size === "standard" ? "Standard · 40px" : "Small · 28px";
    const cells = [false, true].flatMap((disabled) => variants.map(([name, variant, label]) => galleryCell(`${name}${disabled ? " · Disabled" : ""}`, renderButton({ label, variant, size, disabled }))));
    return `<section class="tui-button-gallery__section" data-logical-group="Button/Size/${size === "standard" ? "Standard" : "Small"}">${sectionRule(title)}<div class="tui-button-gallery__grid tui-button-gallery__grid--four">${cells.join("")}</div></section>`;
  }).join("");

  const iconTextDefault = [
    ["Primary", "primary", "action/add", "新建项目"],
    ["Secondary", "secondary", "action/download", "导出文件"],
    ["Ghost", "ghost", "action/settings", "更多设置"]
  ].map(([name, variant, iconName, label]) => galleryCell(name, renderButton({ label, variant, mode: "icon-text", iconName }))).join("");
  const iconTextDisabled = [
    ["Primary · Disabled", "primary", "action/add", "新建项目"],
    ["Secondary · Disabled", "secondary", "action/download", "导出文件"],
    ["Ghost · Disabled", "ghost", "action/settings", "更多设置"]
  ].map(([name, variant, iconName, label]) => galleryCell(name, renderButton({ label, variant, mode: "icon-text", iconName, disabled: true }))).join("");

  const iconButtons = [
    ["Ghost · Default", "ghost", "action/more", false],
    ["Secondary · Explicit", "secondary", "action/close", false],
    ["Ghost · Disabled", "ghost", "action/more", true],
    ["Secondary · Disabled", "secondary", "action/close", true]
  ].map(([name, variant, iconName, disabled]) => galleryCell(name, renderButton({ label: name, variant, mode: "icon", iconName, disabled }), "tui-button-gallery__cell--icon")).join("");

  const selection = [
    galleryCell("List selection", renderSelectionDropdown()),
    galleryCell("Disabled", renderSelectionDropdown({ disabled: true }))
  ].join("");
  const splitDefault = [
    galleryCell("Icon + Text · Independent actions", renderSplitDropdown()),
    galleryCell("Icon · Independent actions", renderSplitDropdown({ label: "刷新", iconName: "action/refresh", iconOnly: true, menuItems: ["重新加载", "同步数据", "清理缓存并刷新"] }))
  ].join("");
  const splitDisabled = [
    galleryCell("Icon + Text · Disabled", renderSplitDropdown({ disabled: true })),
    galleryCell("Icon · Disabled", renderSplitDropdown({ label: "刷新", iconName: "action/refresh", iconOnly: true, disabled: true, menuItems: ["重新加载", "同步数据", "清理缓存并刷新"] }))
  ].join("");

  return `<div class="tui-button-gallery" data-component="button" data-logical-component="Button/Module/Complete" data-framework="html">${sized}<section class="tui-button-gallery__section" data-logical-group="Button/Icon Text/Default">${sectionRule("Icon + Text · 40px · Icon 20px")}<div class="tui-button-gallery__grid tui-button-gallery__grid--three">${iconTextDefault}</div><div class="tui-button-gallery__grid tui-button-gallery__grid--three">${iconTextDisabled}</div></section><section class="tui-button-gallery__section" data-logical-group="Button/Icon/Default">${sectionRule("Icon Button · 图标按钮 · Default = Ghost · 40×40px · Icon 20px")}<div class="tui-button-gallery__grid tui-button-gallery__grid--four">${iconButtons}</div></section><section class="tui-button-gallery__section" data-logical-group="Button/Selection Dropdown/Default">${sectionRule("Selection Dropdown · 选择型下拉按钮 · Text + Chevron · Secondary · 40px")}<div class="tui-button-gallery__grid tui-button-gallery__grid--two">${selection}</div></section><section class="tui-button-gallery__section" data-logical-group="Button/Split Dropdown/Default">${sectionRule("Split Dropdown Button · 分裂式下拉按钮 · Ghost · 40px")}<div class="tui-button-gallery__grid tui-button-gallery__grid--two">${splitDefault}</div><div class="tui-button-gallery__grid tui-button-gallery__grid--two">${splitDisabled}</div></section></div>`;
}
