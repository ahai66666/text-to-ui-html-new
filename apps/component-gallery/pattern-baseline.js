const response = await fetch("/api/patterns");
if (!response.ok) throw new Error("Pattern registry unavailable");
const patternRegistry = await response.json();
import { createTitlebarSegments, renderHtmlComponent } from "../../packages/components-html/src/index.js";
import { createPatternRuntime, createSecondaryPageRuntime } from "../../packages/pattern-runtime/src/index.js";

const runtimePreviewSlots = (patternId) => {
  const primaryNavigation = (items) => renderHtmlComponent("sidebar", {
    ariaLabel: "主导航",
    items
  });
  const primaryAction = (label) => renderHtmlComponent("button", {
    label,
    variant: "primary",
    size: "standard",
    mode: "icon-text",
    iconName: "action/add"
  });
  if (patternId === "pattern-a-two-pane") {
    return {
      "global-title-layer": runtimePreviewTitleLayer(patternId),
      "primary-navigation-shell": primaryNavigation([
        { label: "概览", icon: "navigation/grid", count: 1, selected: true },
        { label: "项目", icon: "object/file", count: 12 },
        { label: "成员", icon: "navigation/contacts" }
      ]),
      "global-primary-action": primaryAction("新建项目"),
      "primary-navigation-footer": renderHtmlComponent("button", {
        label: "设置", icon: "action/settings", variant: "ghost", mode: "icon-text", size: "standard"
      })
    };
  }
  return {
    "global-title-layer": runtimePreviewTitleLayer(patternId),
    "secondary-navigation-content": primaryNavigation([
      { label: "收件箱", icon: "navigation/grid", count: 24, selected: true },
      { label: "项目", icon: "object/file", count: 12 },
      { label: "成员", icon: "navigation/contacts" }
    ]),
    "global-primary-action": primaryAction("新建任务"),
    "primary-navigation-bottom": `<nav class="pattern-runtime-preview-primary-items" aria-label="一级导航">${renderHtmlComponent("primary-navigation-item", { label: "工作台", iconName: "navigation/grid" })}${renderHtmlComponent("primary-navigation-item", { label: "项目", iconName: "field/calendar", selected: true })}${renderHtmlComponent("primary-navigation-item", { label: "消息", iconName: "navigation/mail-unread" })}</nav>`,
  };
};

const runtimePreviewTitleLayer = (patternId) => {
  const pattern = patternRegistry.patterns.find((candidate) => candidate.id === patternId);
  if (!pattern) return "";
  const segmentContent = patternId === "pattern-a-two-pane"
    ? {
      "primary-navigation": { slots: { label: "项目空间" } },
      "main-content": { slots: { "main-content-title": "概览" } }
    }
    : {
      "primary-navigation": { slots: { label: "任务工作台" } },
      "secondary-list": { slots: {} },
      "main-detail": { slots: { "main-detail-actions": [{ id: "more", label: "更多", icon: "action/more" }] } }
    };
  const segments = createTitlebarSegments(pattern, segmentContent);
  return `<div class="tui-pattern-runtime__title-segments" data-pattern-title-segments="${patternId}">${segments.map(({ region, ...segment }) => `<div class="tui-pattern-runtime__title-segment" data-pattern-title-segment="${region}">${renderHtmlComponent("titlebar", segment)}</div>`).join("")}</div>`;
};

const secondaryListCards = [
  { id: "client-design-system", type: "project", title: "客户端设计系统", meta: "1 小时前 · 3 位成员" },
  { id: "component-guidelines", type: "specification", title: "组件规范", meta: "2 小时前 · 4 位成员" },
  { id: "workbench-refresh", type: "workbench", title: "工作台改版", meta: "3 小时前 · 5 位成员" },
  { id: "release-check", type: "release", title: "发布检查", meta: "4 小时前 · 6 位成员" }
];

const runtimePreviewRegionContent = (patternId) => {
  if (patternId === "pattern-a-two-pane") {
    return {
      "main-content": `<div class="pattern-runtime-preview-content"><div class="pattern-runtime-preview-card"><strong data-typography-role="subtitle-m">项目概览</strong><span data-typography-role="body-m">页面内容由业务方填入，Pattern 只提供区域和滚动边界。</span></div><div class="pattern-runtime-preview-card pattern-runtime-preview-card--large"><span class="pattern-runtime-preview-line"></span><span class="pattern-runtime-preview-line pattern-runtime-preview-line--wide"></span><span class="pattern-runtime-preview-line pattern-runtime-preview-line--short"></span></div></div>`
    };
  }
  const secondaryListAction = renderHtmlComponent("button", {
    label: "筛选",
    variant: "ghost",
    size: "standard",
    mode: "icon",
    iconName: "action/filter",
    extraAttrs: ' data-pattern-content-slot="secondary-list-actions" data-action-scope="secondary-list"'
  });
  const secondaryListCardsMarkup = secondaryListCards.map((card, index) => `<button class="pattern-runtime-preview-list-item${index === 0 ? " is-selected" : ""}" type="button" data-pattern-content-slot="secondary-list-card-${card.id}" data-pattern-card-type="${card.type}" data-selected="${index === 0}"><span class="pattern-runtime-preview-list-icon" data-slot="leading">${index + 1}</span><span class="pattern-runtime-preview-list-item-content" data-slot="content"><strong data-slot="title" data-typography-role="body-l">${card.title}</strong><small data-slot="description" data-typography-role="body-m">${card.meta}</small></span></button>`).join("");
  return {
    "secondary-list": `<div class="pattern-runtime-preview-list" role="list" aria-label="任务列表"><div class="pattern-runtime-preview-list-heading"><strong data-typography-role="title-s">全部任务</strong><span class="pattern-runtime-preview-list-heading-actions" data-slot="actions">${secondaryListAction}</span></div><div class="pattern-runtime-preview-list-meta" data-slot="meta"><span data-typography-role="body-m">18 个项目</span></div>${secondaryListCardsMarkup}</div>`,
    "main-detail": `<div class="pattern-runtime-preview-content"><div class="pattern-runtime-preview-detail-heading"><strong data-typography-role="title-m">客户端设计系统</strong><span class="pattern-runtime-preview-status">进行中</span></div><p data-typography-role="body-m">这里是业务方详情内容。Renderer 负责 pane 顺序、标题段、滚动和 inset；页面内容仍由调用方提供。</p><div class="pattern-runtime-preview-card pattern-runtime-preview-card--large"><span class="pattern-runtime-preview-line"></span><span class="pattern-runtime-preview-line pattern-runtime-preview-line--wide"></span><span class="pattern-runtime-preview-line pattern-runtime-preview-line--short"></span></div></div>`
  };
};

const createPatternRuntimePreview = () => {
  const card = document.createElement("article");
  card.className = "pattern-baseline-card pattern-runtime-renderer-card";
  card.dataset.patternId = "pattern-runtime-renderer";
  card.innerHTML = `<section class="section" aria-labelledby="pattern-runtime-renderer-title">
    <div class="section-head">
      <div>
        <h3 id="pattern-runtime-renderer-title">Pattern Runtime Renderer · 可调用预览</h3>
        <p class="section-note">这里展示同一份 Pattern Contract 如何输出 Skeleton 和 Runtime 两种结果；切换后可直接检查区域顺序、槽位和最小窗口规则。</p>
      </div>
      <span class="section-note" data-runtime-preview-meta></span>
    </div>
    <div class="pattern-runtime-preview-controls">
      <div class="pattern-runtime-preview-control-group" role="group" aria-label="Pattern 选择">
        <span>Pattern</span>
        <button type="button" class="pattern-runtime-preview-control is-selected" data-runtime-pattern="pattern-a-two-pane" aria-pressed="true">A · 双栏</button>
        <button type="button" class="pattern-runtime-preview-control" data-runtime-pattern="pattern-b-three-pane" aria-pressed="false">B · 三栏</button>
      </div>
      <div class="pattern-runtime-preview-control-group" role="group" aria-label="Renderer 模式">
        <span>Renderer</span>
        <button type="button" class="pattern-runtime-preview-control" data-runtime-mode="skeleton" aria-pressed="false">Skeleton</button>
        <button type="button" class="pattern-runtime-preview-control is-selected" data-runtime-mode="runtime" aria-pressed="true">Runtime</button>
      </div>
    </div>
    <div class="pattern-runtime-renderer-sample pattern-sample" data-runtime-preview-host aria-live="polite"></div>
  </section>`;
  return card;
};

const setupPatternRuntimePreview = (root) => {
  const card = root.querySelector(".pattern-runtime-renderer-card");
  if (!card) return;
  const host = card.querySelector("[data-runtime-preview-host]");
  const meta = card.querySelector("[data-runtime-preview-meta]");
  const state = { patternId: "pattern-a-two-pane", mode: "runtime" };
  const render = () => {
    const runtime = createPatternRuntime({
      registry: patternRegistry,
      patternId: state.patternId,
      mode: state.mode,
      slots: state.mode === "runtime" ? runtimePreviewSlots(state.patternId) : {},
      regionContent: state.mode === "runtime" ? runtimePreviewRegionContent(state.patternId) : {}
    });
    host.replaceChildren();
    host.insertAdjacentHTML("afterbegin", runtime.render());
    const contract = runtime.contract;
    meta.textContent = `${contract.id} · ${state.mode} · ${contract.paneOrder.join(" → ")} · min ${contract.minimumWindow?.width || 0}×${contract.minimumWindow?.height || 0}`;
    card.querySelectorAll("[data-runtime-pattern]").forEach((button) => {
      const selected = button.dataset.runtimePattern === state.patternId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    card.querySelectorAll("[data-runtime-mode]").forEach((button) => {
      const selected = button.dataset.runtimeMode === state.mode;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };
  card.querySelectorAll("[data-runtime-pattern]").forEach((button) => button.addEventListener("click", () => {
    state.patternId = button.dataset.runtimePattern;
    render();
  }));
  card.querySelectorAll("[data-runtime-mode]").forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.runtimeMode;
    render();
  }));
  render();
};

const secondaryPageRuntimeContent = (layout) => `<div class="secondary-page-runtime-content"><div class="secondary-page-runtime-heading"><div><h4>${layout === "new-page" ? "项目设置" : "项目设置"}</h4><p>${layout === "new-page" ? "弹出新页面使用上下布局；顶部为 Titlebar_S。" : "延续一级布局进入项目设置，页面内容在主内容区滚动。"}</p></div>${renderHtmlComponent("button", { label: "保存", variant: "primary", size: "standard", mode: "text" })}</div><section class="secondary-page-runtime-form" aria-label="项目设置表单"><div class="secondary-page-runtime-setting"><span><strong>桌面通知</strong><small>项目有新动态时显示桌面提醒</small></span>${renderHtmlComponent("switch", { checked: true })}</div><div class="secondary-page-runtime-setting"><span><strong>邮件通知</strong><small>每天汇总一次重要动态</small></span>${renderHtmlComponent("switch", { checked: false })}</div></section></div>`;

// Secondary Page continuation keeps the same global navigation shell as the
// canonical Pattern Runtime Renderer. The right pane still owns its own
// pane-aligned Titlebar_L, while this left shell owns the workspace brand and navigation.
const secondaryPageRuntimeNavigation = () => `<div class="secondary-page-runtime-navigation-shell" data-secondary-page-navigation-shell="pattern-runtime"><div class="secondary-page-runtime-navigation-titlebar">${renderHtmlComponent("titlebar", { label: "项目空间", size: "large", layout: "two-column", segmentRole: "primary-navigation", showWindowControls: false })}</div><div class="secondary-page-runtime-navigation-body"><div class="secondary-page-runtime-primary-action">${renderHtmlComponent("button", { label: "新建项目", variant: "primary", size: "standard", mode: "icon-text", iconName: "action/add" })}</div>${renderHtmlComponent("sidebar", { ariaLabel: "主导航", items: [{ label: "概览", icon: "navigation/grid", count: 1, selected: true }, { label: "项目", icon: "object/file", count: 12 }, { label: "成员", icon: "navigation/contacts" }] })}</div><div class="secondary-page-runtime-navigation-footer">${renderHtmlComponent("button", { label: "设置", icon: "action/settings", variant: "ghost", mode: "icon-text", size: "standard" })}</div></div>`;

const secondaryPageRuntimeSlots = (layout) => {
  const titlebar = layout === "new-page"
    ? renderHtmlComponent("titlebar", { label: "项目设置", size: "small", layout: "standalone", segmentRole: "global" })
    : renderHtmlComponent("titlebar", {
      paneTitle: "项目设置",
      size: "large",
      layout: "two-column",
      segmentRole: "final-pane",
      mainContentLeading: { id: "back", label: "返回项目", icon: "navigation/back", buttonType: "icon" }
    });
  return {
    navigation: layout === "continuation" ? secondaryPageRuntimeNavigation() : renderHtmlComponent("sidebar", {
      ariaLabel: "项目设置导航",
      items: [
        { label: "项目概览", icon: "navigation/grid" },
        { label: "项目设置", icon: "action/settings", selected: true },
        { label: "成员权限", icon: "navigation/contacts" }
      ]
    }),
    titlebar,
    content: secondaryPageRuntimeContent(layout)
  };
};

const createSecondaryPageRuntimePreview = () => {
  const card = document.createElement("article");
  card.className = "pattern-baseline-card secondary-page-runtime-card";
  card.dataset.patternId = "secondary-page-runtime";
  card.innerHTML = `<section class="section" aria-labelledby="secondary-page-runtime-title">
    <div class="section-head">
      <div>
        <h3 id="secondary-page-runtime-title">Secondary Page Runtime · 可调用预览</h3>
        <p class="section-note">二级页面也有 Runtime：延续一级布局使用返回按钮 + Titlebar_L；弹出新页面使用 Titlebar_S + 上下布局。</p>
      </div>
      <span class="section-note" data-secondary-runtime-meta></span>
    </div>
    <div class="pattern-runtime-preview-controls">
      <div class="pattern-runtime-preview-control-group" role="group" aria-label="Secondary Page 布局">
        <span>Layout</span>
        <button type="button" class="pattern-runtime-preview-control is-selected" data-secondary-runtime-layout="continuation" aria-pressed="true">延续一级布局</button>
        <button type="button" class="pattern-runtime-preview-control" data-secondary-runtime-layout="new-page" aria-pressed="false">弹出新页面</button>
      </div>
      <div class="pattern-runtime-preview-control-group" role="group" aria-label="Secondary Page Renderer 模式">
        <span>Renderer</span>
        <button type="button" class="pattern-runtime-preview-control" data-secondary-runtime-mode="skeleton" aria-pressed="false">Skeleton</button>
        <button type="button" class="pattern-runtime-preview-control is-selected" data-secondary-runtime-mode="runtime" aria-pressed="true">Runtime</button>
      </div>
    </div>
    <div class="secondary-page-runtime-sample pattern-sample" data-secondary-runtime-host aria-live="polite"></div>
  </section>`;
  return card;
};

const setupSecondaryPageRuntimePreview = (root) => {
  const card = root.querySelector(".secondary-page-runtime-card");
  if (!card) return;
  const host = card.querySelector("[data-secondary-runtime-host]");
  const meta = card.querySelector("[data-secondary-runtime-meta]");
  const state = { layout: "continuation", mode: "runtime" };
  const render = () => {
    const runtime = createSecondaryPageRuntime({
      layout: state.layout,
      mode: state.mode,
      slots: state.mode === "runtime" ? secondaryPageRuntimeSlots(state.layout) : {}
    });
    host.replaceChildren();
    host.insertAdjacentHTML("afterbegin", runtime.render());
    meta.textContent = `secondary-page-runtime · ${state.mode} · ${state.layout === "continuation" ? "返回 + Titlebar_L" : "Titlebar_S + 上下布局"}`;
    card.querySelectorAll("[data-secondary-runtime-layout]").forEach((button) => {
      const selected = button.dataset.secondaryRuntimeLayout === state.layout;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    card.querySelectorAll("[data-secondary-runtime-mode]").forEach((button) => {
      const selected = button.dataset.secondaryRuntimeMode === state.mode;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };
  card.querySelectorAll("[data-secondary-runtime-layout]").forEach((button) => button.addEventListener("click", () => {
    state.layout = button.dataset.secondaryRuntimeLayout;
    render();
  }));
  card.querySelectorAll("[data-secondary-runtime-mode]").forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.secondaryRuntimeMode;
    render();
  }));
  render();
};

export const mountPatternBaseline = (mount) => {
  if (!mount) return;
  const fragment = document.createDocumentFragment();
  fragment.append(createPatternRuntimePreview());
  fragment.append(createSecondaryPageRuntimePreview());
  mount.replaceChildren(fragment);
  mount.dataset.patternReady = "true";
  setupPatternRuntimePreview(mount);
  setupSecondaryPageRuntimePreview(mount);
};
