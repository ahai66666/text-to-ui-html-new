import { renderMarkup } from '../shared/render-markup.js';
import { picker } from "../shared/advanced-picker.js";

export const timePicker = () => picker("time-picker", "Time Picker/Default", "时间", "09:30", "field/clock", `<div class="tui-picker__columns"><div><span data-typography-role="body-s">时</span>${["08", "09", "10"].map((d) => `<button type="button" data-time-hour="${d}" data-typography-role="body-l" class="${d === "09" ? "is-selected" : ""}">${d}</button>`).join("")}</div><b data-typography-role="body-l">:</b><div><span data-typography-role="body-s">分</span>${["25", "30", "35"].map((d) => `<button type="button" data-time-minute="${d}" data-typography-role="body-l" class="${d === "30" ? "is-selected" : ""}">${d}</button>`).join("")}</div></div><footer><button type="button" data-action="clear" data-typography-role="body-l">清除</button><button type="button" data-action="confirm" data-typography-role="body-l">确定</button></footer>`);

export const componentId = "time-picker";
const renderer = timePicker;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
