import { frameworkLabels, readinessDimensionLabels, readinessInfoFor, readinessLabels, sourceFor } from "./catalog-helpers.js";

const readinessDimensions = [
  ["sourceReady", "源码"],
  ["contractReady", "契约"],
  ["visualParity", "视觉"],
  ["behaviorParity", "行为"],
  ["accessibilityParity", "可访问性"],
  ["tokenParity", "Token"]
];

const list = (values) => Array.isArray(values) ? values.filter(Boolean) : [];
const join = (values, fallback = "未声明") => list(values).join(" · ") || fallback;

/**
 * The runtime card and its compact inspector are both projections of the
 * generated registry. Consumers use logicalName as the public identity;
 * implementation IDs and fixtures stay internal to the renderer.
 */
export const contractInspectorData = (component, framework) => {
  const readiness = readinessDimensions.map(([key, label]) => ({
    key,
    label,
    complete: component.readiness?.[key] === true
  }));
  const completeCount = readiness.filter((item) => item.complete).length;
  const deliveryReadiness = readinessInfoFor(component);
  return {
    framework,
    frameworkLabel: frameworkLabels[framework] ?? framework,
    logicalName: component.logicalName,
    source: sourceFor(component, framework),
    variants: list(component.variants),
    states: list(component.allowedStates?.length ? component.allowedStates : component.states),
    slots: list(component.slots),
    behaviors: list(component.behaviors),
    tokenRoles: list(component.tokenRoles),
    note: component.contractNotes ?? "",
    readiness,
    completeCount,
    status: deliveryReadiness.level,
    statusLabel: readinessLabels[deliveryReadiness.level],
    unresolvedLabels: deliveryReadiness.unresolvedDimensions.map((key) => readinessDimensionLabels[key] ?? key)
  };
};

export const contractInspectorGroups = (component, framework) => {
  const data = contractInspectorData(component, framework);
  return [
    {
      label: "接口",
      rows: [
        ["Variant", join(data.variants)],
        ["状态", join(data.states)],
        ["Slots", join(data.slots)]
      ]
    },
    {
      label: "规则",
      rows: [
        ["行为", join(data.behaviors)],
        ["Token", join(data.tokenRoles)]
      ]
    },
    {
      label: "当前实现",
      rows: [
        [`${data.frameworkLabel} 源码`, data.source],
        ["交付等级", data.statusLabel],
        ["待验收", data.unresolvedLabels.join(" · ") || "无"]
      ]
    }
  ];
};

export const contractDialogId = (component, framework) => `contract-dialog-${framework}-${component.id}`;

export const renderContractInspectorBodyHtml = (component, framework, escapeHtml) => {
  const data = contractInspectorData(component, framework);
  const groups = contractInspectorGroups(component, framework);
  const renderRows = (rows) => rows.map(([label, value]) => `<div class="tui-contract-inspector__row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  return `<div class="tui-contract-inspector__body">
    <div class="tui-contract-inspector__identity"><span>逻辑身份</span><code>${escapeHtml(data.logicalName)}</code><strong class="tui-readiness-pill tui-readiness-pill--${escapeHtml(data.status)}">${escapeHtml(data.statusLabel)}</strong></div>
    ${groups.map((group) => `<section class="tui-contract-inspector__group"><h5>${escapeHtml(group.label)}</h5><dl>${renderRows(group.rows)}</dl></section>`).join("")}
    <div class="tui-contract-inspector__readiness" aria-label="验收维度">${data.readiness.map((item) => `<span class="tui-contract-inspector__badge${item.complete ? " is-complete" : ""}">${escapeHtml(item.label)}</span>`).join("")}</div>
    ${data.note ? `<p class="tui-contract-inspector__note">${escapeHtml(data.note)}</p>` : ""}
  </div>`;
};

export const renderContractDialogHtml = (component, framework, escapeHtml) => {
  const data = contractInspectorData(component, framework);
  const dialogId = contractDialogId(component, framework);
  return `<div class="tui-contract-dialog" id="${escapeHtml(dialogId)}" data-contract-dialog data-contract-logical-name="${escapeHtml(data.logicalName)}" hidden>
  <div class="tui-contract-dialog__backdrop" data-contract-dialog-close></div>
  <section class="tui-contract-dialog__surface" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(dialogId)}-title">
    <header class="tui-contract-dialog__header"><div><h4 id="${escapeHtml(dialogId)}-title">${escapeHtml(component.logicalName)} · 组件规范</h4><p>${escapeHtml(data.statusLabel)} · ${data.completeCount}/${data.readiness.length} 个验收维度已通过</p></div><button type="button" class="tui-contract-dialog__close" data-contract-dialog-close aria-label="关闭组件规范">×</button></header>
    ${renderContractInspectorBodyHtml(component, framework, escapeHtml)}
  </section>
</div>`;
};
