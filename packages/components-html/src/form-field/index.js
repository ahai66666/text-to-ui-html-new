import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/core-attrs.js";
import { escapeHtml } from "../shared/core-escapeHtml.js";
import { icon } from "../shared/core-icon.js";

export const formFieldState = ({ surface = "white", control = "input", required = false, error = "", value = "客户端设计系统" } = {}) => {
  const label = control === "select" ? "项目状态" : "项目名称";
  const input = `<label class="tui-component tui-input" ${attrs("input", "Input/White Surface/Default", "default", error ? "error" : "default", ` data-surface="${surface}"`)}><input data-slot="value" data-typography-role="body-l" type="text" value="${escapeHtml(value)}" aria-label="${label}"${error ? " aria-invalid=\"true\"" : ""}/></label>`;
  const select = `<div class="tui-component tui-select tui-form-field__select" ${attrs("select", "Select/Default", "default", error ? "error" : "default", ` data-surface="${surface}"`)}><button class="tui-select__trigger" type="button" aria-label="${label}" aria-haspopup="listbox" aria-expanded="false"><span data-slot="value" data-typography-role="body-m">进行中</span>${icon("navigation/chevron-down", "", { size: 16 })}</button><div class="tui-select__menu" role="listbox" aria-label="${label}" hidden><button type="button" role="option" aria-selected="true" data-typography-role="body-l">进行中</button><button type="button" role="option" aria-selected="false" data-typography-role="body-l">已完成</button></div></div>`;
  return `<section class="tui-component tui-form-field" ${attrs("form-field", "Form Field/Default", control, error ? "error" : "default", ` data-surface="${surface}" data-required="${required}"`)}><span data-slot="label" data-typography-role="subtitle-s">${required ? '<span class="tui-form-field__required" aria-hidden="true">*</span>' : ""}${label}</span><div class="tui-form-field__control" data-slot="control">${control === "select" ? select : input}</div>${error ? `<span class="tui-form-field__error" data-slot="error" role="alert" data-typography-role="body-s">${escapeHtml(error)}</span>` : ""}</section>`;
};

export const componentId = "form-field";
const renderer = (options = {}) => formFieldState(options);
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
