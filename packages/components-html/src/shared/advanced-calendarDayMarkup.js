import { calendarDays } from "./advanced-calendarDays.js";

export const calendarDayMarkup = (className = "tui-calendar__days", selectedDay = "7") => `<div class="${className}" role="grid">${calendarDays.map((day, i) => `<button type="button" role="gridcell" class="${day === selectedDay && i === 12 ? "is-selected" : ""}" data-day="${day}" data-typography-role="body-l">${day}</button>`).join("")}</div>`;
