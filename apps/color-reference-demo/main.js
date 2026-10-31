import {renderHtmlComponent} from '../../packages/components-html/src/index.js';
import {bindColorReferences} from '../../packages/components-html/src/color-references/index.js';
const root=document.querySelector('#app');
root.innerHTML=[['保存','demo-brand'],['取消','demo-brand'],['同色但不同变量','demo-link']].map(([label,className])=>renderHtmlComponent('button',{label,variant:'ghost',className})).join('');
const colors=bindColorReferences(root);root.__tuiColorReferences=colors;
const show=node=>{
 const e=colors.refresh();
 const refs=e.references.filter(r=>r.elementId===node.id);
 document.querySelector('#selected').textContent=JSON.stringify({label:node.textContent.trim(),classes:[...node.classList].filter(c=>c.startsWith('tui-colorref')),references:refs},null,2);
 document.querySelector('#evidence').textContent=JSON.stringify(e,null,2);
};
root.querySelectorAll('button').forEach((node,i)=>{node.id='color-example-'+i;});
root.addEventListener('click',event=>{const node=event.target.closest('button');if(node)show(node);});
show(root.querySelector('button'));
window.addEventListener('pagehide',()=>colors.dispose(),{once:true});
