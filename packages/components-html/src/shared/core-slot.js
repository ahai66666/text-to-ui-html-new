
export const slot = (value, fallback = "") => value === undefined || value === null ? fallback : String(value);
