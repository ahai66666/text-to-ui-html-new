import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";
import { icon } from "../shared/advanced-icon.js";
import { calendarWeekMarkup } from "../shared/advanced-calendarWeekMarkup.js";
import { calendarDayMarkup } from "../shared/advanced-calendarDayMarkup.js";

export const calendar = ({ selectedDay = "7", className = "" } = {}) => `<section class="tui-component tui-calendar${className ? ` ${className}` : ""}" ${attrs("calendar", "Calendar/Default")}><header><button class="tui-icon-button tui-calendar__prev" type="button" aria-label="上个月">${icon("navigation/chevron-right", 20)}</button><strong data-typography-role="title-s">2026 年 08 月</strong><button class="tui-icon-button tui-calendar__next" type="button" aria-label="下个月">${icon("navigation/chevron-right", 20)}</button></header>${calendarWeekMarkup()}${calendarDayMarkup("tui-calendar__days", selectedDay)}</section>`;

export const componentId = "calendar";
const renderer = calendar;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
