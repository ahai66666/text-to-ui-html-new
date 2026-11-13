import {toggleDisclosure} from '../../packages/components-html/src/index.js';

const sampleMessages = [
  {id:'review', group:'今天', sender:'林晓', time:'09:42', subject:'项目工作计划评审会', excerpt:'请提前阅读评审材料，并确认参会安排。', unread:true},
  {id:'delivery', group:'今天', sender:'陈默', time:'09:18', subject:'请关注本周交付预测', excerpt:'本周交付预测与风险清单已更新。'},
  {id:'report', group:'今天', sender:'周宁', time:'08:56', subject:'伙伴与商业销售部周报', excerpt:'请查阅本周重点工作总结。'},
  {id:'plan', group:'本周', sender:'项目协作组', time:'昨天', subject:'下一阶段工作计划及验收安排，请各工作组确认交付范围、责任人和时间节点后于本周五前汇总反馈', excerpt:'请在周五前反馈重点事项。', unread:true},
  {id:'material', group:'上周', sender:'李东', time:'上周三', subject:'合同审批材料缺少盖章页', excerpt:'请补齐盖章页后回复。'}
];

function renderMailRow(row, {active}) {
  return '<button type="button" class="block-mail-row" aria-pressed="' + active + '" data-demo-row="' + escape(row.id) +
    '"><span class="block-mail-row__from">' + (row.unread ? '<i aria-label="未读"></i>' : '') +
    escape(row.sender) + '</span><time>' + escape(row.time) + '</time><span class="block-mail-row__subject">' +
    escape(row.subject) + '</span><span class="block-mail-row__excerpt">' + escape(row.excerpt) + '</span></button>';
}


const escape = value => String(value ?? '').replace(/[&<>"]/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[char]));

export function mountGroupedMailList(pane, renderComponent) {
  const scroller = document.createElement('div');
  scroller.className = 'block-demo-scroll block-grouped-scroll';
  scroller.setAttribute('aria-label','分组列表');
  const groups = Map.groupBy(sampleMessages, mail => mail.group);
  scroller.innerHTML = [...groups].map(([label,rows],index)=>renderComponent('accordion',{
    title:label,expanded:true,contentId:'block-mail-group-'+index,
    content:rows.map(row=>renderMailRow(row,{active:row.id === 'review'})).join('')
  })).join('');
  pane.append(scroller);
  scroller.addEventListener('click', event => {
    const trigger = event.target.closest('[data-component="accordion"]');
    if (trigger) {
      toggleDisclosure(trigger);
      return;
    }
    const selected = event.target.closest('[data-demo-row]');
    if (!selected) return;
    for (const row of scroller.querySelectorAll('[data-demo-row]')) {
      row.setAttribute('aria-pressed',String(row === selected));
    }
  });
}
