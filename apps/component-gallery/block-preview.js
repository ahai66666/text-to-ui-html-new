import {bindTitlebarOverflow,renderHtmlComponent,selectSidebarItem,toggleDisclosure} from "../../packages/components-html/src/index.js";
import {mountGroupedMailList} from "./mail-block-demo.js";

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content) node.textContent = content;
  return node;
}

function optionGroup(host, label, values, current, onChange) {
  host.innerHTML = renderHtmlComponent('segmented-button',{label, options:values, value:current});
  const group = host.firstElementChild;
  group.addEventListener('click', event => {
    const choice = event.target.closest('[data-value]');
    if (!choice) return;
    setPressed(choice.dataset.value);
    onChange(choice.dataset.value);
  });
  function setPressed(value) {
    for (const option of group.querySelectorAll('[data-value]')) {
      const selected = option.dataset.value === value;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed',String(selected));
    }
  }
}

function mountGroupedExample(host) {
  const controls = element('div','block-preview-controls');
  const frame = element('div','block-demo-frame');
  host.append(controls,frame);
  mountGroupedMailList(frame,renderHtmlComponent);
  optionGroup(controls,'列表预览宽度',['标准宽度','窄栏压力测试'],'标准宽度',width => {
    frame.classList.toggle('block-demo-frame--narrow',width === '窄栏压力测试');
  });
}

function mountNavigationExample(host) {
  const frame = element('div','block-navigation-example');
  frame.innerHTML = renderHtmlComponent('sidebar',{
    ariaLabel:'邮箱文件夹导航',
    groups:[
      {label:'工作邮箱',items:[
        {label:'收件箱',icon:'navigation/inbox',count:12,selected:true},
        {label:'未读邮件',icon:'navigation/mail-unread'},
        {label:'草稿箱',icon:'navigation/drafts',count:3},
        {label:'已发送',icon:'navigation/sent'},
        {label:'已删除',icon:'action/delete',count:26}
      ]},
      {label:'项目邮箱',items:[
        {label:'项目收件箱',icon:'navigation/inbox',count:4},
        {label:'项目存档',icon:'action/archive'}
      ]}
    ]
  });
  frame.addEventListener('click', event => {
    if (toggleDisclosure(event.target.closest('[data-component="collapsible"]'))) return;
    selectSidebarItem(event.target.closest('[data-component="sidebar"]'));
  });
  host.append(frame);
}

function mountTitlebarActionsExample(host) {
  const actions = [
    {id:'save',label:'保存当前版本',icon:'action/save'},
    {id:'rename',label:'重命名',icon:'action/rename'},
    {id:'copy',label:'复制',icon:'action/copy'},
    {id:'download',label:'下载',icon:'action/download'},
    {id:'archive',label:'归档',icon:'action/archive'},
  ];
  const buttonTypes = new Map([['图标文字','icon-text-ghost'],['纯图标','icon']]);
  const buttonStyles = element('div','block-titlebar-styles');
  const controls = element('label','block-titlebar-width','预览宽度');
  const slider = element('input');
  Object.assign(slider,{type:'range',min:'100',max:'700',value:'340'});
  const width = element('span','block-titlebar-width-value');
  controls.append(slider,width);
  const frame = element('div','block-titlebar-example');
  const status = element('p','block-titlebar-action-status');
  status.setAttribute('role','status');
  host.append(buttonStyles,controls,frame,status);
  let unbindOverflow;
  function renderActions(style) {
    unbindOverflow?.();
    const buttonType = buttonTypes.get(style);
    frame.innerHTML = renderHtmlComponent('titlebar',{
      size:'large',layout:'three-column',segmentRole:'main-detail',
      slots:{'main-detail-actions':actions.map(action => ({...action,buttonType})),actions:false}
    });
    unbindOverflow = bindTitlebarOverflow(frame,{onAction:showAction});
  }
  function setWidth() {
    frame.style.setProperty('--block-titlebar-width',slider.value+'px');
    width.textContent = slider.value+' px';
  }
  function showAction(id) {
    const action = actions.find(item => item.id === id);
    if (action) status.textContent = '已触发'+action.label;
  }
  slider.addEventListener('input',setWidth);
  setWidth();
  const defaultStyle = '图标文字';
  optionGroup(buttonStyles,'按钮样式',[...buttonTypes.keys()],defaultStyle,renderActions);
  renderActions(defaultStyle);
  frame.addEventListener('click',event => {
    const button = event.target.closest('[data-overflow-item="true"]');
    if (button) showAction(button.dataset.action);
  });
  window.addEventListener('pagehide',() => unbindOverflow(),{once:true});
}

function rulesList(heading, items) {
  const section = element('section');
  const list = element('ul');
  section.append(element('h5',null,heading),list);
  for (const item of items) list.append(element('li',null,item));
  return section;
}

export async function mountBlockPreviews(host) {
  const response = await fetch('/api/blocks');
  if (!response.ok) throw new Error('无法读取 Block 规范');
  const {blocks} = await response.json();
  host.replaceChildren();
  for (const block of blocks) {
    const id = 'block-' + block.id;
    const card = element('article','gallery-surface block-preview-card');
    card.id = id;
    card.setAttribute('aria-labelledby',id+'-title');
    const head = element('div','gallery-surface__head');
    const title = element('h4',null,block.title);
    title.id = id+'-title';
    head.append(title);
    const rules = element('details','block-preview-rules');
    rules.append(element('summary',null,'Block 规范'),
      rulesList('应用场景',block.scenarios.map(scene => scene.name + ' · ' + scene.description)),
      rulesList('组合规则',block.rules),rulesList('验收要点',block.checks));
    const demo = element('div');
    card.append(head,demo,rules);
    host.append(card);
    if (block.id === 'grouped-mail-list') mountGroupedExample(demo);
    if (block.id === 'collapsible-navigation-group') mountNavigationExample(demo);
    if (block.id === 'titlebar-action-overflow') mountTitlebarActionsExample(demo);
  }
}
