import { calendarWeekdays } from "./advanced-calendarWeekdays.js";

export const calendarWeekMarkup = (className = "tui-calendar__week") => `<div class="${className}" data-typography-role="body-l">${calendarWeekdays.map((day) => `<span data-typography-role="body-l">${day}</span>`).join("")}</div>`;
