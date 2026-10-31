import { iconMarkup } from "../icon-map.js";

export const icon = (name, size = 20, kind = "auto") => iconMarkup(name, { size, kind });
