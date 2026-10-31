import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";
import { escapeHtml } from "../shared/advanced-escapeHtml.js";

export const sliderState = ({ variant = "style-1", label = "透明度", value = 84 } = {}) => {
  const style = variant === "style-2" ? "style-2" : "style-1";
  const numericValue = Number(value);
  const normalizedValue = Number.isFinite(numericValue) ? Math.min(100, Math.max(0, numericValue)) : 84;
  return `<label class="tui-component tui-slider tui-slider--${style}" ${attrs("slider", "Slider/Default", style, "default", ` data-slider-style="${style}"`)}><span data-slot="label" data-typography-role="body-m">${escapeHtml(label)}</span><span class="tui-slider__control" style="--tui-slider-value:${normalizedValue}%"><span class="tui-slider__track" aria-hidden="true"><span class="tui-slider__fill"></span><span class="tui-slider__thumb"></span></span><input type="range" min="0" max="100" value="${normalizedValue}" data-typography-role="body-l" aria-label="${escapeHtml(label)}" /></span><output data-typography-role="body-m">${normalizedValue}</output></label>`;
};

export const slider = ({ gallery = false, ...options } = {}) => {
  if (!gallery) return sliderState(options);
  return `<div class="tui-slider-gallery" data-runtime-component="slider"><div class="tui-slider-specimen" data-slider-style="style-1"><span class="tui-runtime-surface-label">样式 1 · 4px 背景条 / 16px 圆形把手</span>${sliderState({ ...options, variant: "style-1" })}</div><div class="tui-slider-specimen" data-slider-style="style-2"><span class="tui-runtime-surface-label">样式 2 · 20px 背景条 / 12px 圆形把手</span>${sliderState({ ...options, variant: "style-2" })}</div></div>`;
};

export const componentId = "slider";
const renderer = slider;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
