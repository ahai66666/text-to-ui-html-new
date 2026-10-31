/** Page-owned layout CSS is deliberately narrower than private business-module CSS. */
export function checkBusinessLayoutCss(css,groupIds){
 const text=css.replace(/\/\*[\s\S]*?\*\//g,'');if(/@/.test(text))throw Error('BUSINESS_CSS: page layout CSS cannot contain at-rules; use a declared business module for complex styling');
 const allowed=new Set(['display','flex-direction','flex-wrap','align-items','align-content','justify-content','gap','row-gap','column-gap','padding','padding-inline','padding-block','padding-inline-start','padding-inline-end','padding-block-start','padding-block-end','margin','margin-inline','margin-block','grid-template-columns','grid-template-rows','grid-auto-flow','flex','flex-grow','flex-shrink','flex-basis','min-width','min-height','max-width','max-height','width','height','overflow','overflow-x','overflow-y']);
 for(const match of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  for(const selector of match[1].split(',').map(s=>s.trim())){const id=selector.match(/^\[data-composition-id=["']([a-z][a-z0-9-]*)["']\]$/)?.[1];if(!id||!groupIds.has(id))throw Error('BUSINESS_CSS_SELECTOR: only declared business group roots are writable: '+selector);}
  for(const declaration of match[2].split(';').filter(s=>s.trim())){const colon=declaration.indexOf(':'),prop=declaration.slice(0,colon).trim();if(colon<0||!allowed.has(prop))throw Error('BUSINESS_CSS_PROPERTY: '+prop);if(/!important|url\(|expression\(/i.test(declaration))throw Error('BUSINESS_CSS_VALUE: '+prop);}
 }
 return css;
}
