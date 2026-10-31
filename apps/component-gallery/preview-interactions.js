import { selectSidebarItem } from "../../packages/components-html/src/shared/sidebar-behavior.js";
import { toggleDisclosure } from "../../packages/components-html/src/shared/disclosure-behavior.js";
// Adapted from the canonical Text-to-UI HTML Gallery runtime.
// Origin and source hashes: maintenance/gallery-source.json. License: MIT.
import { bindInputTagEntry, bindTitlebarOverflow } from "../../packages/components-html/src/index.js";
const componentTitle = component => component.logicalName.split("/")[0];
const syncMenu = (trigger, menu, open) => {
  trigger?.setAttribute("aria-expanded", String(open));
  if (menu) menu.hidden = !open;
};
export const bindPreviewInteractions = (root, setStatus = () => {}, runtimeComponents = []) => {
  root.dataset.interactionsBound = "true";
  const overlayTriggers = new Map();
  const contractDialogTriggers = new Map();
  const closeOverlay = (layer, reason = "关闭") => {
    if (!layer) return;
    layer.hidden = true;
    const dialog = layer.querySelector(".tui-dialog");
    const componentId = dialog?.dataset.component ?? "dialog";
    dialog && (dialog.dataset.state = "closed");
    overlayTriggers.get(layer)?.focus();
    overlayTriggers.delete(layer);
    setStatus(`${componentId === "alert-dialog" ? "Alert Dialog" : componentId === "semi-modal" ? "Semi-modal" : "Dialog"} · ${reason}`);
  };
  const closeMenus = () => {
    root.querySelectorAll(".tui-button-dropdown__menu, .tui-select__menu, .tui-generated__menu, .tui-generated__panel, .tui-advanced-menu__panel, .tui-advanced-menu__submenu, .tui-advanced-popover__panel, .tui-picker__panel, .tui-attachment__menu, .tui-titlebar__overflow-menu").forEach((menu) => {
      menu.hidden = true;
      menu.classList.remove("is-open");
      const trigger = menu.previousElementSibling;
      const controls = trigger?.matches("button, input") ? [trigger] : [...(trigger?.querySelectorAll?.("button[aria-expanded], input[aria-expanded]") ?? [])];
      controls.forEach((control) => control.setAttribute("aria-expanded", "false"));
    });
  };
  const closeAdvancedSubmenus = (component, except = null) => {
    component?.querySelectorAll(".tui-advanced-menu__submenu").forEach((submenu) => {
      if (submenu === except) return;
      submenu.hidden = true;
      submenu.classList.remove("is-open");
      submenu.previousElementSibling?.setAttribute("aria-expanded", "false");
    });
  };
  const closeContractDialog = (dialog, reason = "关闭") => {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    const trigger = contractDialogTriggers.get(dialog);
    trigger?.setAttribute("aria-expanded", "false");
    trigger?.focus();
    contractDialogTriggers.delete(dialog);
    setStatus(`组件规范 · ${reason}`);
  };
  const onClick = (event) => {
    const contractTrigger = event.target.closest?.("[data-contract-dialog-trigger]");
    if (contractTrigger && root.contains(contractTrigger)) {
      const dialog = root.querySelector(`#${CSS.escape(contractTrigger.getAttribute("aria-controls") ?? "")}`);
      if (dialog) {
        contractDialogTriggers.set(dialog, contractTrigger);
        dialog.hidden = false;
        contractTrigger.setAttribute("aria-expanded", "true");
        queueMicrotask(() => dialog.querySelector(".tui-contract-dialog__close")?.focus());
        setStatus("组件规范 · 已打开");
      }
      return;
    }
    const contractCloseControl = event.target.closest?.("[data-contract-dialog-close]");
    if (contractCloseControl && root.contains(contractCloseControl)) {
      closeContractDialog(contractCloseControl.closest("[data-contract-dialog]"));
      return;
    }
    const isAdvancedMenuInteraction = event.target.closest?.(".tui-advanced-menu__trigger, .tui-advanced-menu__item");
    const isInputTagEntrySelection = event.target.closest?.("[data-input-tag-entry] .tui-input-tag-entry__menu [role=option], [data-input-tag-entry] [data-remove-tag]");
    if (isInputTagEntrySelection) return;
    if (root.contains(event.target) && !event.target.closest(".tui-attachment__actions") && !isAdvancedMenuInteraction) closeMenus();
    const target = event.target.closest("button, input, textarea, select, a, [role=button], .tui-combobox__trigger");
    if (!target || !root.contains(target) || target.disabled) return;
    const owner = target.closest("[data-component-card]");
    const id = owner?.dataset.componentCard;
    if (target.matches("[data-overlay-trigger]")) {
      const layer = (target.closest("[data-production-preview]") || root).querySelector(`[data-overlay-id="${CSS.escape(target.dataset.overlayTrigger)}"]`);
      if (layer) {
        overlayTriggers.set(layer, target);
        layer.hidden = false;
        const dialog = layer.querySelector(".tui-dialog");
        dialog && (dialog.dataset.state = "open");
        queueMicrotask(() => dialog?.focus());
        setStatus(`${dialog?.dataset.component === "alert-dialog" ? "Alert Dialog" : dialog?.dataset.component === "semi-modal" ? "Semi-modal" : "Dialog"} · 已打开`);
      }
      return;
    }
    if (target.matches("[data-overlay-close], [data-overlay-action]")) {
      const action = target.dataset.overlayAction;
      closeOverlay(target.closest(".tui-overlay-layer"), action === "confirm" ? target.textContent.trim() : action === "cancel" ? "取消" : "关闭");
      return;
    }
    if (target.matches(".tui-split-button__trigger")) {
      event.stopPropagation();
      const menu = target.closest(".tui-button-dropdown, .tui-split-button")?.querySelector(":scope > .tui-button-dropdown__menu");
      if (menu) { const open = menu.hidden; closeMenus(); syncMenu(target, menu, open); setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "Button" })} · ${open ? "打开" : "收起"}`); }
      return;
    }
    if (target.matches(".tui-button-dropdown__item") && !target.closest(".tui-attachment__menu")) {
      const rootButton = target.closest(".tui-button-dropdown")?.querySelector("[data-slot=label]");
      if (rootButton) rootButton.textContent = target.textContent;
      closeMenus();
      setStatus(`已选择 ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-attachment__menu-trigger")) {
      const component = target.closest(".tui-attachment");
      const menu = component?.querySelector(":scope > .tui-attachment__actions > .tui-attachment__menu");
      if (menu) {
        const open = menu.hidden;
        closeMenus();
        menu.hidden = !open;
        menu.classList.toggle("is-open", open);
        target.setAttribute("aria-expanded", String(open));
        if (open) menu.querySelector('[role="menuitem"]')?.focus();
        setStatus(`Attachment · ${open ? "打开操作菜单" : "收起操作菜单"}`);
      }
      return;
    }
    if (target.matches('.tui-attachment__menu [role="menuitem"]')) {
      const action = target.dataset.action;
      closeMenus();
      setStatus(`Attachment · ${action === "preview" ? "已预览" : "已下载"}`);
      return;
    }
    if (target.matches(".tui-titlebar__action, .tui-titlebar__pane-action, .tui-titlebar__pane-leading-action")) {
      const scope = target.matches(".tui-titlebar__pane-leading-action") ? "Main Content · " : target.matches(".tui-titlebar__pane-action") ? "Main Detail · " : "";
      setStatus(`Titlebar · ${scope}${target.dataset.action ?? "action"}`);
      return;
    }
    if (target.matches(".tui-primary-navigation-item")) {
      target.closest(".tui-primary-navigation-items")?.querySelectorAll(".tui-primary-navigation-item").forEach((item) => {
        if (!item.disabled) {
          const selected = item === target;
          item.dataset.state = selected ? "selected" : "default";
          item.dataset.variant = selected ? "selected" : "default";
          item.setAttribute("aria-pressed", String(selected));
        }
      });
      setStatus(`Primary Navigation Item · ${target.getAttribute("aria-label") ?? "已选择"}`);
      return;
    }
    if (target.matches('.tui-search [data-slot="advanced-search"]')) {
      setStatus("Search · 高级");
      return;
    }
    if (target.matches(".tui-alert .tui-icon-button, .tui-toast .tui-icon-button")) {
      target.closest(".tui-alert, .tui-toast")?.remove();
      setStatus(`${id === "toast" ? "Toast" : "Alert"} · 已关闭`);
      return;
    }
    if (target.matches(".tui-combobox__input, .tui-combobox__trigger")) {
      const component = target.closest(".tui-combobox");
      const menu = component?.querySelector(":scope > .tui-select__menu");
      const input = component?.querySelector(".tui-combobox__input");
      if (menu && input) {
        const open = menu.hidden;
        closeMenus();
        menu.hidden = false;
        input.dataset.filterActive = "false";
        menu.querySelectorAll('[role="option"]').forEach((option) => { option.hidden = false; });
        input.setAttribute("aria-expanded", "true");
        if (target.matches(".tui-combobox__trigger")) input.focus();
        setStatus(`Combobox · ${open ? "打开" : "聚焦"}`);
      }
      return;
    }
    if (target.matches(".tui-select__trigger")) {
      const component = target.closest(".tui-select");
      const menu = component?.querySelector(":scope > .tui-select__menu");
      if (menu) {
        const open = menu.hidden;
        closeMenus();
        menu.hidden = !open;
        target.setAttribute("aria-expanded", String(open));
        if (open) menu.querySelector('[role="option"]')?.focus();
        setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "选择控件" })} · ${open ? "打开" : "收起"}`);
      }
      return;
    }
    if (target.matches('.tui-select__menu [role="option"]')) {
      const component = target.closest(".tui-select");
      const valueControl = component?.querySelector('[data-slot="value"]');
      if (valueControl instanceof HTMLInputElement) valueControl.value = target.textContent.trim();
      else valueControl?.replaceChildren(document.createTextNode(target.textContent.trim()));
      if (valueControl instanceof HTMLInputElement) valueControl.dataset.filterActive = "false";
      component?.querySelectorAll('[role="option"]').forEach((option) => option.setAttribute("aria-selected", String(option === target)));
      closeMenus();
      setStatus(`已选择 ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-disclosure__trigger")) {
      if (!toggleDisclosure(target)) return;
      const open = target.getAttribute("aria-expanded") === "true";
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "披露组件" })} · ${open ? "展开" : "收起"}`);
      return;
    }
    if (target.matches('.tui-tabs__list [role="tab"]')) {
      const tablist = target.closest('[role="tablist"]');
      tablist?.querySelectorAll('[role="tab"]').forEach((tab) => {
        const selected = tab === target;
        tab.classList.toggle("is-selected", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      const panel = target.closest(".tui-tabs")?.querySelector('[role="tabpanel"]');
      if (panel) panel.textContent = target.dataset.tab === "projects" ? "项目列表" : target.dataset.tab === "members" ? "成员列表" : "工作空间概览";
      setStatus(`Tabs · ${target.textContent.trim()}`);
      return;
    }
    if (target.matches('.tui-sub-tabs__list [role="tab"]')) {
      const component = target.closest(".tui-sub-tabs");
      const isSmall = component?.dataset.size === "small";
      const tablist = target.closest('[role="tablist"]');
      tablist?.querySelectorAll('[role="tab"]').forEach((tab) => {
        const selected = tab === target;
        tab.classList.toggle("is-selected", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        tab.setAttribute("data-typography-role", isSmall ? "body-m" : selected ? "subtitle-m" : "body-l");
      });
      const panel = component?.querySelector('[role="tabpanel"]');
      if (panel) {
        panel.dataset.tabPanel = target.dataset.tab;
        panel.setAttribute("aria-labelledby", target.id);
        panel.textContent = target.dataset.tab === "activity" ? "项目活动" : target.dataset.tab === "settings" ? "项目设置" : "项目概览";
      }
      setStatus(`Sub Tabs · ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-tree-view__item")) {
      const tree = target.closest(".tui-tree-view");
      const hasChildren = target.dataset.treeToggle === "true";
      if (hasChildren) {
        const open = target.getAttribute("aria-expanded") !== "true";
        target.setAttribute("aria-expanded", String(open));
        target.querySelector(".tui-tree-view__chevron")?.classList.toggle("is-expanded", open);
        const group = target.closest(".tui-tree-view__node")?.querySelector(":scope > .tui-tree-view__group");
        if (group) group.hidden = !open;
      }
      tree?.querySelectorAll('.tui-tree-view__item[aria-selected="true"]').forEach((item) => {
        item.setAttribute("aria-selected", "false");
        item.classList.remove("is-selected");
      });
      target.setAttribute("aria-selected", "true");
      target.classList.add("is-selected");
      setStatus(`Tree View · ${target.querySelector(".tui-tree-view__label")?.textContent.trim() ?? "已选择"}`);
      return;
    }
    if (target.matches(".tui-advanced-menu__trigger")) {
      const component = target.closest(".tui-advanced-menu, .tui-advanced-menubar");
      const panel = component?.querySelector(":scope > .tui-advanced-menu__panel");
      if (panel) {
        const open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
        panel.classList.toggle("is-open", open);
        target.setAttribute("aria-expanded", String(open));
        setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "菜单" })} · ${open ? "打开" : "收起"}`);
      }
      return;
    }
    if (target.matches(".tui-advanced-menu__item.has-submenu")) {
      const component = target.closest(".tui-advanced-menubar");
      const submenu = target.parentElement?.querySelector(":scope > .tui-advanced-menu__submenu");
      if (component && submenu) {
        closeAdvancedSubmenus(component, submenu);
        submenu.hidden = false;
        submenu.classList.add("is-open");
        target.setAttribute("aria-expanded", "true");
        submenu.querySelector('[role="menuitem"]')?.focus();
        setStatus("Menubar · 打开子菜单");
        return;
      }
    }
    if (target.matches('.tui-search [data-scope-option]')) {
      const scope = target.closest('.tui-search__scope');
      const value = target.dataset.scopeOption ?? target.textContent.trim();
      scope?.querySelector('[data-slot="value"]')?.replaceChildren(document.createTextNode(value));
      scope?.querySelectorAll('[data-scope-option]').forEach((option) => option.setAttribute("aria-selected", String(option === target)));
      scope?.classList.add("is-selected");
      closeMenus();
      setStatus(`Search · 范围：${value}`);
      return;
    }
    if (target.matches(".tui-advanced-menu__item")) {
      const component = target.closest(".tui-advanced-menu, .tui-advanced-menubar");
      component?.querySelector('[data-slot="value"]')?.replaceChildren(document.createTextNode(target.textContent.trim()));
      closeMenus();
      setStatus(`已选择 ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-advanced-popover > .tui-button")) {
      const component = target.closest(".tui-advanced-popover");
      const panel = component?.querySelector(":scope > .tui-advanced-popover__panel");
      if (panel) {
        const open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
        target.setAttribute("aria-expanded", String(open));
        setStatus(`Popover · ${open ? "打开" : "收起"}`);
      }
      return;
    }
    if (target.matches(".tui-picker__trigger")) {
      const component = target.closest(".tui-picker");
      const panel = component?.querySelector(":scope > .tui-picker__panel");
      if (panel) {
        const open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
        target.setAttribute("aria-expanded", String(open));
        setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "选择器" })} · ${open ? "打开" : "收起"}`);
      }
      return;
    }
    if (target.matches(".tui-calendar__days button[data-day], .tui-picker__calendar button[data-day], .tui-picker__columns button[data-time-hour], .tui-picker__columns button[data-time-minute]")) {
      target.closest(".tui-calendar__days, .tui-picker__calendar, .tui-picker__columns")?.querySelectorAll("button").forEach((button) => button.classList.remove("is-selected"));
      target.classList.add("is-selected");
      const value = target.closest(".tui-picker")?.querySelector('[data-slot="value"]');
      if (value) {
        const picker = target.closest(".tui-picker");
        if (target.dataset.day) value.textContent = `2026-08-${target.dataset.day.padStart(2, "0")}`;
        if (target.dataset.timeHour) value.textContent = `${target.dataset.timeHour}:${value.textContent.split(":")[1] ?? "30"}`;
        if (target.dataset.timeMinute) value.textContent = `${value.textContent.split(":")[0] ?? "09"}:${target.dataset.timeMinute}`;
        picker?.dataset && (picker.dataset.state = "selected");
      }
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "选择器" })} · 已选择`);
      return;
    }
    if (target.matches(".tui-color-picker__tab")) {
      const picker = target.closest(".tui-color-picker");
      picker?.querySelectorAll(".tui-color-picker__tab").forEach((tab) => {
        const selected = tab === target;
        tab.classList.toggle("is-selected", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      if (picker) picker.dataset.activeTab = target.dataset.colorPickerTab ?? "color-card";
      setStatus(`ColorPicker · ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-color-picker__favorite:not(.tui-color-picker__favorite--add)")) {
      const picker = target.closest(".tui-color-picker");
      const hex = String(target.dataset.colorValue ?? "").replace(/^#/, "").toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
      const normalized = hex.padEnd(6, "0");
      const input = picker?.querySelector("[data-color-picker-hex]");
      if (input) input.value = normalized;
      if (picker) { picker.dataset.colorValue = normalized; picker.style.setProperty("--tui-color-picker-color", `#${normalized}`); }
      setStatus(`ColorPicker · #${normalized}`);
      return;
    }
    if (target.matches(".tui-color-picker__eyedropper")) {
      setStatus("ColorPicker · 吸取颜色");
      return;
    }
    if (target.matches(".tui-dialog__form input")) {
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "表单" })} · 已编辑`);
      return;
    }
    if (target.matches(".tui-checkbox input, .tui-switch input, .tui-radio input, .tui-radio-group input")) {
      const owner = target.closest(".tui-checkbox, .tui-switch, .tui-radio, .tui-radio-group");
      if (owner && target.type !== "radio") owner.dataset.state = target.checked ? "selected" : "default";
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "选择控件" })} · ${target.checked ? "选中" : "取消"}`);
      return;
    }
    if (target.matches(".tui-generated__control")) {
      const component = target.closest(".tui-generated--menu, .tui-generated--picker");
      const panel = component?.querySelector(":scope > .tui-generated__menu, :scope > .tui-generated__panel");
      if (panel) {
        const open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
        panel.classList.toggle("is-open", open);
        target.setAttribute("aria-expanded", String(open));
        setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "组件" })} · ${open ? "打开" : "收起"}`);
      }
      return;
    }
    if (target.matches(".tui-generated__disclosure")) {
      const content = target.parentElement?.querySelector(":scope > .tui-generated__disclosure-content");
      const open = target.getAttribute("aria-expanded") !== "true";
      target.setAttribute("aria-expanded", String(open));
      target.dataset.state = open ? "open" : "default";
      target.dataset.variant = open ? "open" : "default";
      if (content) content.hidden = !open;
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "披露组件" })} · ${open ? "展开" : "收起"}`);
      return;
    }
    if (target.matches(".tui-generated__tab")) {
      const tablist = target.closest('[role="tablist"]');
      tablist?.querySelectorAll('[role="tab"]').forEach((tab) => {
        const selected = tab === target;
        tab.classList.toggle("is-selected", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      setStatus(`Tabs · ${target.textContent.trim()}`);
      return;
    }
    if (target.matches('.tui-generated__menu [role="menuitem"]')) {
      const component = target.closest(".tui-generated--menu");
      const value = component?.querySelector('[data-slot="value"]');
      if (value) value.textContent = target.textContent.trim();
      closeMenus();
      setStatus(`已选择 ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-segmented-button__item")) {
      const component = target.closest(".tui-segmented-button");
      component?.querySelectorAll(".tui-segmented-button__item").forEach((item) => {
        const selected = item === target;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      setStatus(`Segmented Button · ${target.textContent.trim()}`);
      return;
    }
    if (target.matches(".tui-number-selector__step")) {
      const component = target.closest(".tui-number-selector");
      const input = component?.querySelector('input[type="number"]');
      if (input) {
        const step = Number(input.step || 1);
        const min = Number.isFinite(Number(input.min)) ? Number(input.min) : -Infinity;
        const max = Number.isFinite(Number(input.max)) ? Number(input.max) : Infinity;
        const next = Math.min(max, Math.max(min, Number(input.value || 0) + (target.dataset.direction === "increment" ? step : -step)));
        input.value = String(next);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      return;
    }
    if (target.matches(".tui-sidebar-item")) {
      selectSidebarItem(target);
      setStatus(`Sidebar · ${target.textContent.trim()}`);
    } else if (target.matches(".tui-list-card")) {
      target.closest(".tui-list-card-group")?.querySelectorAll(".tui-list-card").forEach((item) => {
        const selected = item === target;
        item.dataset.state = selected ? "selected" : "default";
        item.setAttribute("aria-pressed", String(selected));
      });
      setStatus(`List Card · ${target.querySelector('[data-slot="title"]')?.textContent.trim() ?? "已选择"}`);
    } else if (target.matches(".tui-pagination button")) {
      const pagination = target.closest(".tui-pagination");
      const pages = [...(pagination?.querySelectorAll("button[data-page]") ?? [])];
      const current = Number(pagination?.querySelector('[aria-current="page"]')?.dataset.page ?? 1);
      const raw = target.dataset.page;
      const next = raw === "prev" ? Math.max(1, current - 1) : raw === "next" ? Math.min(pages.filter((button) => !["prev", "next"].includes(button.dataset.page)).length, current + 1) : Number(raw);
      pages.forEach((button) => button.removeAttribute("aria-current"));
      pagination?.querySelector(`button[data-page="${next}"]`)?.setAttribute("aria-current", "page");
      setStatus(`Pagination · 第 ${next} 页`);
    } else if (target.matches(".tui-breadcrumb a")) {
      event.preventDefault();
      setStatus(`Breadcrumb · ${target.textContent.trim()}`);
    } else if (target.matches(".tui-button")) {
      setStatus(`${componentTitle(runtimeComponents.find((item) => item.id === id) ?? { logicalName: "组件" })} · 已触发`);
    }
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") {
      const contractDialog = [...root.querySelectorAll("[data-contract-dialog]:not([hidden])")].at(-1);
      if (contractDialog) { event.preventDefault(); closeContractDialog(contractDialog, "已关闭"); return; }
      const layer = [...root.querySelectorAll(".tui-overlay-layer:not([hidden])")].at(-1);
      if (layer) { event.preventDefault(); closeOverlay(layer, "取消"); return; }
    }
    const listCard = event.target.closest?.(".tui-list-card[role=button]");
    if (listCard && root.contains(listCard) && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      listCard.click();
      return;
    }
    const target = event.target.closest?.(".tui-combobox__input, .tui-select__trigger, .tui-select__menu [role=option], .tui-tabs__list [role=tab], .tui-sub-tabs__list [role=tab], .tui-tree-view__item, .tui-color-picker__tabs [role=tab], .tui-advanced-menu__trigger, .tui-advanced-menu__item[role=menuitem], .tui-picker__trigger, .tui-attachment__menu-trigger, .tui-attachment__menu [role=menuitem]");
    if (!target || !root.contains(target)) return;
    if (target.matches(".tui-combobox__input")) {
      const component = target.closest(".tui-combobox");
      const menu = component?.querySelector(":scope > .tui-select__menu");
      if (event.key === "Escape") { event.preventDefault(); closeMenus(); target.setAttribute("aria-expanded", "false"); target.focus(); return; }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (menu) { menu.hidden = false; target.setAttribute("aria-expanded", "true"); const options = [...menu.querySelectorAll('[role="option"]:not([hidden])')]; options[event.key === "ArrowDown" ? 0 : Math.max(0, options.length - 1)]?.focus(); }
        return;
      }
      if (event.key === "Enter" && menu && !menu.hidden) { const option = menu.querySelector('[role="option"]:not([hidden])'); if (option) { event.preventDefault(); option.click(); } }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); closeMenus(); (target.closest(".tui-select, .tui-advanced-menu, .tui-advanced-menubar, .tui-picker")?.querySelector(".tui-select__trigger, .tui-advanced-menu__trigger, .tui-picker__trigger") ?? target.closest(".tui-attachment")?.querySelector(".tui-attachment__menu-trigger"))?.focus(); return; }
    if (target.matches(".tui-tree-view__item") && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) {
      const items = [...target.closest(".tui-tree-view")?.querySelectorAll('.tui-tree-view__item[role="treeitem"]') ?? []];
      const index = Math.max(0, items.indexOf(target));
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
      } else if (event.key === "ArrowRight" && target.getAttribute("aria-expanded") === "false") {
        event.preventDefault(); target.click();
      } else if (event.key === "ArrowLeft" && target.getAttribute("aria-expanded") === "true") {
        event.preventDefault(); target.click();
      }
      return;
    }
    if (target.matches('[role="tab"]') && ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const tabs = [...target.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]') ?? []];
      const index = Math.max(0, tabs.indexOf(target));
      const next = tabs[(index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : tabs.length - 1)) % tabs.length];
      next?.focus(); next?.click();
      return;
    }
    if (target.matches('.tui-advanced-menu__item[role="menuitem"]')) {
      const menu = target.closest('.tui-advanced-menu__panel, .tui-advanced-menu__submenu');
      const items = [...menu?.querySelectorAll(':scope > .tui-advanced-menu__item-wrap > .tui-advanced-menu__item') ?? []];
      if (event.key === "ArrowRight" && target.classList.contains("has-submenu")) { event.preventDefault(); target.click(); return; }
      if (event.key === "ArrowLeft" && menu?.classList.contains("tui-advanced-menu__submenu")) {
        event.preventDefault();
        const parent = menu.previousElementSibling;
        menu.hidden = true;
        menu.classList.remove("is-open");
        parent?.setAttribute("aria-expanded", "false");
        parent?.focus();
        return;
      }
      if (["ArrowDown", "ArrowUp"].includes(event.key) && items.length) {
        event.preventDefault();
        const index = Math.max(0, items.indexOf(target));
        items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
        return;
      }
    }
    if (target.matches('[role="menuitem"]') && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      const items = [...target.closest(".tui-attachment__menu")?.querySelectorAll('[role="menuitem"]') ?? []];
      if (!items.length) return;
      event.preventDefault();
      const index = Math.max(0, items.indexOf(target));
      items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
      return;
    }
    if (!target.matches('[role="option"]')) return;
    const options = [...target.closest(".tui-select__menu")?.querySelectorAll('[role="option"]') ?? []];
    if (!options.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const index = Math.max(0, options.indexOf(target));
    options[(index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].focus();
  };
  const onChange = (event) => {
    const control = event.target.closest?.("[data-semi-axis]");
    if (!control || !root.contains(control)) return;
    const example = control.closest('[data-overlay-example="semi-modal"]');
    const layer = example?.querySelector('[data-overlay-id="semi-modal"]');
    if (!layer) return;
    layer.dataset[control.dataset.semiAxis] = control.value;
    const dialog = layer.querySelector(".tui-dialog--semi");
    if (dialog) {
      dialog.setAttribute("aria-modal", String(layer.dataset.mode === "modal"));
      dialog.dataset.variant = `${layer.dataset.size}-${layer.dataset.surface}-${layer.dataset.mode}`;
      dialog.querySelectorAll("[data-field-control]").forEach((field) => { field.dataset.surface = layer.dataset.surface; });
    }
    setStatus(`Semi-modal · ${layer.dataset.size.toUpperCase()} · ${layer.dataset.surface} · ${layer.dataset.mode}`);
  };
  const onInput = (event) => {
    const input = event.target.closest(".tui-search input, .tui-field__control input, .tui-textarea textarea, .tui-generated--field input, .tui-generated--field textarea, .tui-input-otp__cell, .tui-slider input, .tui-color-picker__track, .tui-color-picker__hex-input, .tui-combobox__input, .tui-number-selector input");
    if (!input || !root.contains(input)) return;
    const search = input.closest(".tui-search");
    const clear = search?.querySelector("[data-slot=clear]");
    if (clear) clear.hidden = !input.value;
    if (search?.dataset) {
      const scoped = Boolean(search.querySelector("[data-slot=scope-selector]"));
      const advanced = Boolean(search.querySelector("[data-slot=advanced-search]"));
      search.dataset.state = input.value ? "typing" : "focus";
      search.dataset.variant = scoped ? advanced ? "scoped-advanced-search" : "scoped-search" : advanced ? "advanced-search" : "default";
    }
    if (input.matches(".tui-input-otp__cell") && input.value) {
      const cells = [...input.closest(".tui-input-otp__cells")?.querySelectorAll(".tui-input-otp__cell") ?? []];
      cells[cells.indexOf(input) + 1]?.focus();
    }
    if (input.matches(".tui-combobox__input")) {
      const component = input.closest(".tui-combobox");
      const menu = component?.querySelector(":scope > .tui-select__menu");
      if (menu) {
        const query = input.value.trim().toLowerCase();
        menu.querySelectorAll('[role="option"]').forEach((option) => { option.hidden = query ? !option.textContent.trim().toLowerCase().includes(query) : false; });
        input.dataset.filterActive = "true";
        menu.hidden = false;
        input.setAttribute("aria-expanded", "true");
      }
      setStatus(`Combobox · 输入中`);
    }
    if (input.matches(".tui-number-selector input")) setStatus(`Number Selector · ${input.value}`);
    if (input.matches(".tui-slider input")) {
      input.closest(".tui-slider__control")?.style.setProperty("--tui-slider-value", `${input.value}%`);
      input.closest(".tui-slider")?.querySelector("output")?.replaceChildren(document.createTextNode(input.value));
    }
    if (input.matches(".tui-color-picker__track")) {
      input.closest(".tui-color-picker__field")?.querySelector("[data-color-picker-value]")?.replaceChildren(document.createTextNode(input.value));
      input.setAttribute("aria-valuetext", input.value);
    }
    if (input.matches(".tui-color-picker__hex-input")) {
      const picker = input.closest(".tui-color-picker");
      const normalized = String(input.value ?? "").replace(/^#/, "").toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6).padEnd(6, "0");
      input.value = normalized;
      if (picker) { picker.dataset.colorValue = normalized; picker.style.setProperty("--tui-color-picker-color", `#${normalized}`); }
    }
  };
  const onFocusin = (event) => {
    const input = event.target.closest?.(".tui-input input, .tui-search input, .tui-textarea textarea, .tui-combobox__input");
    if (!input || !root.contains(input) || input.disabled) return;
    const owner = input.closest(".tui-input, .tui-search, .tui-textarea, .tui-combobox");
    if (!owner || (owner.matches(".tui-input") && owner.dataset.state === "error")) return;
    owner.dataset.state = owner.matches(".tui-search") && input.value ? "typing" : "focus";
  };
  const onFocusout = (event) => {
    const input = event.target.closest?.(".tui-input input, .tui-search input, .tui-textarea textarea, .tui-combobox__input");
    if (!input || !root.contains(input)) return;
    const owner = input.closest(".tui-input, .tui-search, .tui-textarea, .tui-combobox");
    if (!owner || (owner.matches(".tui-input") && owner.dataset.state === "error") || input.disabled) return;
    owner.dataset.state = input.value ? "filled" : "default";
  };
  const onMouseover = (event) => {
    const target = event.target.closest?.(".tui-advanced-menu__item");
    if (!target || !root.contains(target)) return;
    const component = target.closest(".tui-advanced-menubar");
    if (!component || target.closest(".tui-advanced-menu__submenu")) return;
    const submenu = target.classList.contains("has-submenu")
      ? target.parentElement?.querySelector(":scope > .tui-advanced-menu__submenu")
      : null;
    if (!submenu) {
      closeAdvancedSubmenus(component);
      return;
    }
    if (submenu.hidden === false) return;
    closeAdvancedSubmenus(component, submenu);
    submenu.hidden = false;
    submenu.classList.add("is-open");
    target.setAttribute("aria-expanded", "true");
    setStatus("Menubar · 打开子菜单");
  };
  const onMouseout = (event) => {
    const component = event.target.closest?.(".tui-advanced-menubar");
    if (!component || !root.contains(component) || (event.relatedTarget && component.contains(event.relatedTarget))) return;
    closeAdvancedSubmenus(component);
  };
  const onDocumentClick = (event) => { if (!root.contains(event.target)) closeMenus(); };
  const directOverlayAbort = new AbortController();
  root.querySelectorAll("[data-overlay-trigger]").forEach((trigger) => trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const layer = (trigger.closest("[data-production-preview]") || root).querySelector(`[data-overlay-id="${CSS.escape(trigger.dataset.overlayTrigger)}"]`);
    if (!layer) return;
    overlayTriggers.set(layer, trigger);
    layer.hidden = false;
    const dialog = layer.querySelector(".tui-dialog");
    dialog && (dialog.dataset.state = "open");
    queueMicrotask(() => dialog?.focus());
    setStatus(`${dialog?.dataset.component === "alert-dialog" ? "Alert Dialog" : dialog?.dataset.component === "semi-modal" ? "Semi-modal" : "Dialog"} · 已打开`);
  }, { signal: directOverlayAbort.signal }));
  root.querySelectorAll("[data-overlay-close], [data-overlay-action]").forEach((control) => control.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = control.dataset.overlayAction;
    closeOverlay(control.closest(".tui-overlay-layer"), action === "confirm" ? control.textContent.trim() : action === "cancel" ? "取消" : "关闭");
  }, { signal: directOverlayAbort.signal }));
  root.addEventListener("click", onClick);
  root.addEventListener("input", onInput);
  root.addEventListener("focusin", onFocusin);
  root.addEventListener("focusout", onFocusout);
  root.addEventListener("keydown", onKeydown);
  root.addEventListener("change", onChange);
  root.addEventListener("mouseover", onMouseover);
  root.addEventListener("mouseout", onMouseout);
  document.addEventListener("click", onDocumentClick);
  const removeTitlebarOverflow = bindTitlebarOverflow(root, {
    onAction: (action) => setStatus(`Titlebar · Main Detail · ${action}`)
  });
  const removeInputTagEntry = bindInputTagEntry(root);
  return () => {
    delete root.dataset.interactionsBound;
    root.removeEventListener("click", onClick);
    root.removeEventListener("input", onInput);
    root.removeEventListener("focusin", onFocusin);
    root.removeEventListener("focusout", onFocusout);
    root.removeEventListener("keydown", onKeydown);
    root.removeEventListener("change", onChange);
    root.removeEventListener("mouseover", onMouseover);
    root.removeEventListener("mouseout", onMouseout);
    document.removeEventListener("click", onDocumentClick);
    removeTitlebarOverflow();
    removeInputTagEntry();
    directOverlayAbort.abort();
  };
};

