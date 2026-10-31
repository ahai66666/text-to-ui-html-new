export { toggleDisclosure } from "./shared/disclosure-behavior.js";
import { escapeHtml } from './shared/core-escapeHtml.js';
import { render as render_button } from './button/index.js';
import { render as render_input } from './input/index.js';
import { render as render_search } from './search/index.js';
import { render as render_sidebar } from './sidebar/index.js';
import { render as render_primary_navigation_item } from './primary-navigation-item/index.js';
import { render as render_list_card } from './list-card/index.js';
import { render as render_item } from './item/index.js';
import { render as render_titlebar } from './titlebar/index.js';
import { render as render_textarea } from './textarea/index.js';
import { render as render_field } from './field/index.js';
import { render as render_form_field } from './form-field/index.js';
import { render as render_select } from './select/index.js';
import { render as render_combobox } from './combobox/index.js';
import { render as render_native_select } from './native-select/index.js';
import { render as render_checkbox } from './checkbox/index.js';
import { render as render_radio } from './radio/index.js';
import { render as render_radio_group } from './radio-group/index.js';
import { render as render_switch } from './switch/index.js';
import { render as render_segmented_button } from './segmented-button/index.js';
import { render as render_number_selector } from './number-selector/index.js';
import { render as render_tabs } from './tabs/index.js';
import { render as render_sub_tabs } from './sub-tabs/index.js';
import { render as render_tree_view } from './tree-view/index.js';
import { render as render_accordion } from './accordion/index.js';
import { render as render_collapsible } from './collapsible/index.js';
import { render as render_avatar } from './avatar/index.js';
import { render as render_badge } from './badge/index.js';
import { render as render_table } from './table/index.js';
import { render as render_data_table } from './data-table/index.js';
import { render as render_pagination } from './pagination/index.js';
import { render as render_breadcrumb } from './breadcrumb/index.js';
import { render as render_progress } from './progress/index.js';
import { render as render_empty } from './empty/index.js';
import { render as render_label } from './label/index.js';
import { render as render_alert } from './alert/index.js';
import { render as render_tooltip } from './tooltip/index.js';
import { render as render_snackbar } from './snackbar/index.js';
import { render as render_chips } from './chips/index.js';
import { render as render_dialog } from './dialog/index.js';
import { render as render_alert_dialog } from './alert-dialog/index.js';
import { render as render_semi_modal } from './semi-modal/index.js';
import { render as render_menubar } from './menubar/index.js';
import { render as render_context_menu } from './context-menu/index.js';
import { render as render_dropdown_menu } from './dropdown-menu/index.js';
import { render as render_popover } from './popover/index.js';
import { render as render_hover_card } from './hover-card/index.js';
import { render as render_slider } from './slider/index.js';
import { render as render_color_picker } from './color-picker/index.js';
import { render as render_input_otp } from './input-otp/index.js';
import { render as render_kbd } from './kbd/index.js';
import { render as render_chart } from './chart/index.js';
import { render as render_calendar } from './calendar/index.js';
import { render as render_date_picker } from './date-picker/index.js';
import { render as render_time_picker } from './time-picker/index.js';
import { render as render_attachment } from './attachment/index.js';
import { renderButtonGallery } from "./gallery.js";
import { renderInputGallery } from "./gallery.js";
import { renderSearchGallery } from "./gallery.js";
import { renderSidebarGallery } from "./gallery.js";
import { renderPrimaryNavigationItemGallery } from "./gallery.js";
import { renderListCardGallery } from "./gallery.js";
export { createTitlebarSegments } from "../../component-contracts/src/titlebar-segments.js";
export { bindTitlebarOverflow } from "./titlebar-overflow.js";
export { bindInputTagEntry } from "./input/behavior.js";
export { renderPrimaryNavigationItemGallery } from "./gallery.js";
export { renderInputGallery } from "./gallery.js";
export { renderSearchGallery } from "./gallery.js";
export { renderSidebarGallery } from "./gallery.js";
export { renderListCardGallery } from "./gallery.js";
export { renderRuntimeHtmlComponent } from "./gallery.js";
export { renderButtonGallery } from "./gallery.js";
export { collectHtmlComponentEvidence } from "./runtime.js";
export { collectHtmlVisualSnapshot } from "./runtime.js";
export const htmlComponents = {
  "native-select": render_native_select,
  "radio-group": render_radio_group,
  "sub-tabs": render_sub_tabs,
  "tree-view": render_tree_view,
"button": render_button,
"buttonGallery": () => renderButtonGallery(),
"input": render_input,
"inputGallery": () => renderInputGallery(),
"search": render_search,
"searchGallery": () => renderSearchGallery(),
"sidebar": render_sidebar,
"sidebarGallery": () => renderSidebarGallery(),
"primary-navigation-item": render_primary_navigation_item,
"primaryNavigationItem": render_primary_navigation_item,
"primaryNavigationItemGallery": () => renderPrimaryNavigationItemGallery(),
"listCard": render_list_card,
"list-card": render_list_card,
"item": render_item,
"listCardGallery": () => renderListCardGallery(),
"titlebar": render_titlebar,
"textarea": render_textarea,
"field": render_field,
"formField": render_form_field,
"form-field": render_form_field,
"select": render_select,
"combobox": render_combobox,
"nativeSelect": render_native_select,
"checkbox": render_checkbox,
"radio": render_radio,
"radioGroup": render_radio_group,
"switch": render_switch,
"segmentedButton": render_segmented_button,
"segmented-button": render_segmented_button,
"numberSelector": render_number_selector,
"tabs": render_tabs,
"subTabs": render_sub_tabs,
"treeView": render_tree_view,
"accordion": render_accordion,
"collapsible": render_collapsible,
"avatar": render_avatar,
"badge": render_badge,
"table": render_table,
"dataTable": render_data_table,
"pagination": render_pagination,
"breadcrumb": render_breadcrumb,
"progress": render_progress,
"empty": render_empty,
"label": render_label,
"alert": render_alert,
"tooltip": render_tooltip,
"snackbar": render_snackbar,
"chips": render_chips,
"dialog": render_dialog,
"alert-dialog": render_alert_dialog,
"semi-modal": render_semi_modal,
"menubar": render_menubar,
"context-menu": render_context_menu,
"dropdown-menu": render_dropdown_menu,
"popover": render_popover,
"hover-card": render_hover_card,
"slider": render_slider,
"color-picker": render_color_picker,
"input-otp": render_input_otp,
"kbd": render_kbd,
"chart": render_chart,
"calendar": render_calendar,
"date-picker": render_date_picker,
"time-picker": render_time_picker,
"attachment": render_attachment,
"colorPicker": render_color_picker,
"number-selector": render_number_selector
};
export function renderHtmlComponent(name, options) {
  const renderer = htmlComponents[name] ?? htmlComponents[String(name).replace(/-([a-z])/g, (_, character) => character.toUpperCase())];
  if (!renderer) throw new Error(`Unknown HTML component: ${name}`);
  // Gallery no-argument calls retain specimen text. Product calls must not
  // inherit unrelated demo descriptions or a pre-selected checkbox.
  const resolvedOptions = name === "checkbox" && options
    ? { checked: false, description: "", ...options } : options;
  const markup = renderer(resolvedOptions);
  if (/\bdata-renderer-key=/.test(markup)) return markup;
  return markup.replace(/(<[a-z][^>]*\bdata-component="[^"]+")/i, `$1 data-renderer-key="${escapeHtml(name)}"`);
}
export function resolveHtmlRendererKey(componentId) {
  if (htmlComponents[componentId]) return componentId;
  const camelKey = String(componentId).replace(/-([a-z])/g, (_, character) => character.toUpperCase());
  return htmlComponents[camelKey] ? camelKey : null;
}

export { selectSidebarItem } from "./shared/sidebar-behavior.js";

export { bindColorReferences } from "./color-references/index.js";
