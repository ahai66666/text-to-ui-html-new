import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";

export const chart = () => `<figure class="tui-component tui-chart" ${attrs("chart", "Chart/Default")}><figcaption data-typography-role="title-s">项目趋势</figcaption><svg class="tui-chart__svg" viewBox="0 0 240 96" role="img" aria-label="项目趋势图" data-svg-role="chart"><path d="M8 78L52 58L96 64L140 32L184 42L232 14" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="M8 80H232" fill="none" stroke="currentColor" stroke-width="1" opacity=".24" /></svg><span data-typography-role="body-s">本周完成度 84%</span></figure>`;

export const componentId = "chart";
const renderer = chart;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
