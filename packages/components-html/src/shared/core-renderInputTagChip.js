import { escapeHtml } from "./core-escapeHtml.js";
import { icon } from "./core-icon.js";

export const renderInputTagChip = (label) => `<span class="tui-component tui-chip tui-input-tag-entry__chip" data-component="chips" data-logical-component="Chips/Default" data-variant="text-only-closable" data-state="default" data-framework="html" data-tag-value="${escapeHtml(label)}"><span class="tui-chip__leading" data-slot="leading"></span><span class="tui-chip__label" data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><button class="tui-chip__close" data-slot="close" data-remove-tag type="button" aria-label="移除 ${escapeHtml(label)}">${icon("action/close", "", { size: 16 })}</button></span>`;
