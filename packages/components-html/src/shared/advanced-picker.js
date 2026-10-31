import { attrs } from "./advanced-attrs.js";
import { escapeHtml } from "./advanced-escapeHtml.js";
import { icon } from "./advanced-icon.js";

export const picker = (id, logicalName, label, value, iconName, panel) => `<div class="tui-component tui-picker" ${attrs(id, logicalName)}><label data-typography-role="body-m">${escapeHtml(label)}</label><button class="tui-picker__trigger" type="button" aria-haspopup="dialog" aria-expanded="false"><span data-slot="value" data-typography-role="body-l">${escapeHtml(value)}</span>${icon(iconName, 20)}</button><div class="tui-picker__panel" role="dialog" hidden>${panel}</div></div>`;
