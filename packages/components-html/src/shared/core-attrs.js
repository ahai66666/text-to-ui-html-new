
export const attrs = (id, logicalName, variant, state, extra = "") => `data-component="${id}" data-renderer-key="${id}" data-logical-component="${logicalName}" data-variant="${variant}" data-state="${state}" data-framework="html"${extra}`;
