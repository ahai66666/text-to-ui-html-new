import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'packages/tokens/src/tokens.colors.css');
const names=[...new Set([...fs.readFileSync(file,'utf8').matchAll(/(^|[;{}\n])\s*(--[A-Za-z0-9_-]+)\s*:/g)].map(m=>m[2]))].sort();
const output=path.join(root,'packages/components-html/src/color-references/token-colors.js');
const content='// Generated from packages/tokens/src/tokens.colors.css. Do not edit.\nexport const canonicalColorVariables = Object.freeze('+JSON.stringify(names,null,2)+');\n';
if(process.argv.includes('--check')){if(fs.readFileSync(output,'utf8')!==content)throw Error('Color reference token index is stale');}
else fs.writeFileSync(output,content);
console.log(JSON.stringify({ok:true,colorVariables:names.length}));
