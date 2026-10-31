import { renderMarkup } from '../shared/render-markup.js';
import { renderInputTagChip } from "../shared/core-renderInputTagChip.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { attrs } from "../shared/core-attrs.js";

export let nextInputTagEntryId = 0;

export const inputTagEntryState = ({ surface = "white", state = "default", label = "成员", placeholder = "输入文本后按 Enter 选择", disabled = false, value = "", options = [], tags = [], id } = {}) => {
  const resolvedState = disabled ? "disabled" : state;
  const inputId = id ?? `tui-input-tag-entry-${++nextInputTagEntryId}`;
  const labelId = `${inputId}-label`;
  const listboxId = `${inputId}-suggestions`;
  const suggestions = Array.isArray(options) ? options.filter((option) => option !== null && option !== undefined && String(option).trim()) : [];
  const selectedTags = Array.isArray(tags) ? tags.map(String) : [];
  const chips = selectedTags.map(renderInputTagChip).join("");
  const optionsMarkup = suggestions.map((option, index) => {
    const text = String(option);
    return `<button id="${escapeHtml(listboxId)}-option-${index + 1}" class="tui-advanced-menu__item" type="button" role="option" aria-selected="false" data-option-value="${escapeHtml(text)}" data-typography-role="body-l">${escapeHtml(text)}</button>`;
  }).join("");
  const valueAttr = value ? ` value="${escapeHtml(value)}"` : "";
  const componentAttrs = attrs(
    "input",
    "Input/Tag Entry/Default",
    "tag-entry",
    resolvedState,
    ` data-surface="${escapeHtml(surface)}" data-input-tag-entry`
  );
  return [
    `<div class="tui-component tui-input tui-input--tag-entry" ${componentAttrs} role="group" aria-labelledby="${escapeHtml(labelId)}">`,
    `<label class="tui-input-tag-entry__label" id="${escapeHtml(labelId)}" for="${escapeHtml(inputId)}" data-slot="label" data-typography-role="body-l">${escapeHtml(label)}</label>`,
    `<div class="tui-input-tag-entry__editor">`,
    `<div class="tui-input-tag-entry__tags" data-slot="tags" role="list" aria-label="${escapeHtml(label)}已选">${chips}</div>`,
    `<input id="${escapeHtml(inputId)}" class="tui-input-tag-entry__input" data-slot="value" data-typography-role="body-l" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${escapeHtml(listboxId)}" aria-labelledby="${escapeHtml(labelId)}" autocomplete="off" placeholder="${escapeHtml(placeholder)}"${valueAttr}${disabled ? " disabled" : ""} />`,
    `<div id="${escapeHtml(listboxId)}" class="tui-advanced-menu__panel tui-input-tag-entry__menu" role="listbox" aria-label="${escapeHtml(label)}建议" hidden>${optionsMarkup}<div class="tui-input-tag-entry__empty" data-empty-state hidden>无匹配项</div></div>`,
    `</div></div>`
  ].join("");
};

export const inputState = ({ surface = "white", state = "default", placeholder = "项目名称", disabled = false, value = "", variant = "default", ...options } = {}) => {
  if (variant === "tag-entry") return inputTagEntryState({ surface, state, placeholder, disabled, value, ...options });
  const resolvedState = disabled ? "disabled" : state;
  // Surface describes the host context; the logical component stays the same.
  const logicalName = "Input/White Surface/Default";
  const valueAttr = value ? ` value="${escapeHtml(value)}"` : "";
  return `<label class="tui-component tui-input" ${attrs("input", logicalName, "default", resolvedState, ` data-surface="${surface}"`)}><input data-slot="value" data-typography-role="body-l" type="text" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}"${valueAttr}${disabled ? " disabled" : ""}${state === "error" ? " aria-invalid=\"true\"" : ""} /></label>`;
};

export const componentId = "input";
const renderer = (options = {}) => inputState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
