import { iconMarkup } from "../icon-map.js";

export const icon = (name, className = "", options = {}) => iconMarkup(name, options).replace("class=\"", `class=\"${className ? `${className} ` : ""}`);
