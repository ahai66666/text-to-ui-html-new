import { renderMarkup } from '../shared/render-markup.js';
import { picker } from "../shared/advanced-picker.js";
import { calendar } from "../calendar/index.js";

export const datePicker = () => picker("date-picker", "Date Picker/Default", "日期", "2026-08-07", "field/calendar", `${calendar({ className: "tui-calendar--embedded" })}<footer><button type="button" data-action="clear" data-typography-role="body-l">清除</button><button type="button" data-action="today" data-typography-role="body-l">今天</button></footer>`);

export const componentId = "date-picker";
const renderer = datePicker;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
