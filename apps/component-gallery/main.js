import { bindColorReferences } from "../../packages/components-html/src/color-references/index.js";
import {renderHtmlComponent, renderRuntimeHtmlComponent} from "../../packages/components-html/src/index.js";
import {bindPreviewInteractions} from "./preview-interactions.js";
import {renderContractDialogHtml} from "./contract-inspector.js";
import {readinessInfoFor, setCatalogPolicy} from "./catalog-helpers.js";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const status = document.querySelector("#gallery-status");
const setStatus = message => { status.textContent = message; };
const cache = new Map(), pending = new Map(), cleanup = new Map();
let designMappings = new Map();
let components = [], observer, patternPromise, previewSequence = 0, anchorId = null;
const anchorObserver = new ResizeObserver(() => {
 if (!anchorId || !cache.has(anchorId)) return;
 document.querySelector(`[data-component-card="${anchorId}"]`)?.scrollIntoView({block:"start"});
});
for (const eventName of ["wheel","pointerdown","touchstart","keydown"]) window.addEventListener(eventName,()=>{anchorId=null;},{passive:true});
async function readJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`${response.status}: ${url}`); return response.json(); }
const specimensFor = c => c.specimens?.length ? c.specimens : [{id:"default",variant:c.variants?.[0] || "default",state:"default"}];
const feedbackCopy = {info:{label:"Info / 信息",message:"系统将在今晚自动完成更新。",action:"查看详情"},success:{label:"Success / 成功",message:"所有修改已经同步到云端。",action:"查看详情"},warning:{label:"Warning / 警告",message:"连接不稳定，部分内容可能暂时无法加载。",action:"重新连接"},danger:{label:"Danger / 危险",message:"存储空间不足，请清理空间后重试。",action:"清理空间"},neutral:{label:"Neutral / 中性",message:"当前为只读模式，部分编辑操作暂不可用。",action:"知道了"}};
const fixtureSpecimens = c => c.id === "alert" ? specimensFor(c).map(s => ({...(feedbackCopy[s.variant] || feedbackCopy.info),...s})) : specimensFor(c);
function componentTitle(c) {
 const mapping = designMappings.get(c.id);
 const mapped = mapping?.logicalName === c.logicalName;
 const tooltip = mapped ? `Pixso：${mapping.pixsoTarget}。已登记映射，不代表全部变体或视觉验收通过。${mapping.note || ""}` : "";
 return `<div class="compact-component-title"><h3 id="runtime-html-${esc(c.id)}-title">${esc(c.logicalName.split("/")[0])}</h3>${mapped ? `<span class="compact-design-mapping-badge" data-design-component-mapped title="${esc(tooltip)}">已映射设计组件</span>` : ""}</div>`;
}
function parameterInspector(c) {
 return `<details class="compact-parameter-preview" data-parameters><summary>页面实际调用与参数</summary><p class="status">与页面生成使用同一个组件入口。输入契约允许的 JSON 参数后查看实际输出。</p><label>参数 JSON<textarea aria-label="${esc(c.id)} 参数 JSON" spellcheck="false">{}</textarea></label><button type="button" class="tui-button" data-apply-parameters data-variant="secondary">应用参数</button><p class="compact-parameter-message" role="status"></p><div class="tui-runtime-card__preview" data-production-preview></div></details>`;
}
function bindCard(card, c) {
 cleanup.get(c.id)?.(); cleanup.set(c.id, bindPreviewInteractions(card, setStatus, components));
}
async function loadCard(id) {
 if (cache.has(id)) return cache.get(id);
 if (pending.has(id)) return pending.get(id);
 const task = (async () => {
  const card = document.querySelector(`[data-component-card="${id}"]`);
  try {
   const c = await readJson(`/packages/component-contracts/src/components/${id}.json`);
   const readiness = readinessInfoFor(c);
   card.className = `tui-runtime-card tui-runtime-card--core${["titlebar","button"].includes(id) ? " tui-runtime-card--wide" : ""} tui-runtime-card--${c.sizing === "fill" ? "fill" : c.sizing === "overlay" ? "overlay" : "intrinsic"}`;
   card.dataset.readiness = readiness.level;
   card.dataset.fixtureId = c.fixtureId || `fixture-${id}`;
   card.innerHTML = `<header class="tui-runtime-card__head">${componentTitle(c)}<button type="button" class="tui-component tui-button tui-runtime-card__contract-trigger" data-component="button" data-renderer-key="button" data-logical-component="Icon Text Button/Ghost/Default" data-variant="ghost" data-state="default" data-framework="html" data-mode="icon-text" data-size="small" data-button-type="icon-text-ghost" data-contract-dialog-trigger aria-haspopup="dialog" aria-controls="contract-dialog-html-${esc(id)}" aria-expanded="false">组件规范</button></header><div class="tui-runtime-card__preview" data-fixture-id="${esc(c.fixtureId || `fixture-${id}`)}">${renderRuntimeHtmlComponent(id,{specimens:fixtureSpecimens(c),fixtureId:c.fixtureId})}</div>${renderContractDialogHtml(c,"html",esc)}`;
   card.querySelector(".tui-contract-inspector__body").insertAdjacentHTML("beforeend",parameterInspector(c));
   const details = card.querySelector("[data-parameters]"), editor = details.querySelector("textarea"), output = details.querySelector("[data-production-preview]"), message = details.querySelector('[role="status"]');
   let previewCreated = false;
   function applyParameters() {
    try {
     const options = JSON.parse(editor.value);
     if (!options || typeof options !== "object" || Array.isArray(options)) throw new Error("参数必须是 JSON 对象");
     const allowed = new Set([...(c.props || []),"variant","state"]);
     const extra = Object.keys(options).filter(key => !allowed.has(key));
     if (extra.length) throw new Error(`契约未声明参数：${extra.join(", ")}`);
     if (options.variant && !c.variants?.includes(options.variant)) throw new Error("variant 不在契约范围内");
     if (options.state && !c.states?.includes(options.state)) throw new Error("state 不在契约范围内");
     output.innerHTML = renderHtmlComponent(id,options);
     const prefix = `parameter-${++previewSequence}-`, ids = new Map();
     output.querySelectorAll("[id]").forEach(el => { ids.set(el.id,prefix+el.id); el.id=prefix+el.id; });
     output.querySelectorAll("[for], [aria-controls], [aria-labelledby], [aria-describedby]").forEach(el => {
      for (const name of ["for","aria-controls","aria-labelledby","aria-describedby"]) if (el.hasAttribute(name)) el.setAttribute(name,el.getAttribute(name).split(/\s+/).map(value=>ids.get(value)||value).join(" "));
     });
     message.textContent = "已通过页面使用的正式入口渲染；实际外观以实现支持范围为准。";
     bindCard(card,c); previewCreated = true;
    } catch (error) { message.textContent = error.message; }
   }
   details.addEventListener("toggle", () => { if (details.open && !previewCreated) applyParameters(); });
   card.querySelector("[data-apply-parameters]").addEventListener("click",applyParameters);
   cache.set(id,c); bindCard(card,c); card.removeAttribute("data-loading"); observer?.unobserve(card);
   return c;
  } catch (error) { card.removeAttribute("data-loading"); card.innerHTML += `<p class="tui-runtime-framework-missing">加载失败：${esc(error.message)}</p>`; throw error; }
 })();
 pending.set(id,task);
 try { return await task; } finally { pending.delete(id); }
}
async function selectView() {
 const requested = location.hash.slice(1) || "runtime-view";
 const component = components.find(c => c.id === requested);
 anchorId = component?.id || null;
 const view = component ? "runtime" : requested === "pattern-view" ? "pattern" : requested === "regression-view" ? "regression" : "runtime";
 document.querySelectorAll("[data-view]").forEach(section => section.hidden = section.dataset.view !== view);
 document.querySelectorAll("[data-view-link]").forEach(link => { if (link.dataset.viewLink === view) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current"); });
 if (view === "pattern") {
  patternPromise ||= import("./pattern-baseline.js").then(module => module.mountPatternBaseline(document.querySelector("[data-pattern-baseline]")));
  try { await patternPromise; } catch (error) { document.querySelector("[data-pattern-baseline]").textContent = `Pattern 加载失败：${error.message}`; }
 }
 document.querySelectorAll('[data-component-card][data-selected="true"]').forEach(card => card.removeAttribute("data-selected"));
 if (component) {
  await loadCard(component.id);
  const card = document.querySelector(`[data-component-card="${component.id}"]`); card.dataset.selected = "true"; card.scrollIntoView({block:"start"});
 }
}
const colorReferences = bindColorReferences(document.body);
window.addEventListener("pagehide", () => colorReferences.dispose(), {once:true});
try {
 const [metadata, mappingSnapshot] = await Promise.all([readJson("/api/components"), readJson("./design-component-mappings.json")]);
 designMappings = new Map(mappingSnapshot.components.map(mapping => [mapping.id, mapping]));
 components = metadata.components; setCatalogPolicy(metadata.readinessPolicy);
 const groups = metadata.registryPolicy?.comparisonGroups || [...new Set(components.map(c=>c.category))].map(id=>({id,label:components.find(c=>c.category===id).categoryLabel,componentIds:components.filter(c=>c.category===id).map(c=>c.id)}));
 const byId = new Map(components.map(c=>[c.id,c]));
 document.querySelector("#runtime-coverage-count").textContent = `${components.length} 个已注册`;
 const mount = document.querySelector('[data-component-mount="component-catalog"]');
 mount.innerHTML = `<div class="tui-runtime-directory-grid" data-runtime-framework="html">${groups.map(group=>`<section class="tui-runtime-category" data-runtime-category="${esc(group.id)}"><h4 class="tui-runtime-category__title">${esc(group.label)}</h4><div class="tui-runtime-category__grid">${group.componentIds.filter(id=>byId.has(id)).map(id=>`<article class="tui-runtime-card${["button","titlebar"].includes(id)?" tui-runtime-card--wide":""}" data-component-card="${esc(id)}" data-category="${esc(group.id)}" data-framework="html" data-loading aria-labelledby="runtime-html-${esc(id)}-title"><header class="tui-runtime-card__head">${componentTitle(byId.get(id))}</header><p class="status">组件将按可见区域加载…</p></article>`).join("")}</div></section>`).join("")}</div>`;
 anchorObserver.observe(mount);
 observer = new IntersectionObserver(entries => entries.filter(entry=>entry.isIntersecting).forEach(entry=>loadCard(entry.target.dataset.componentCard).catch(error=>setStatus(error.message))), {rootMargin:"400px"});
 document.querySelectorAll("[data-component-card]").forEach(card=>observer.observe(card));
 document.querySelector("[data-sidebar-toggle]").addEventListener("click",event=>{
  const shell=document.querySelector(".gallery-shell"), button=event.currentTarget, collapsed=shell.dataset.sidebarCollapsed!=="true";
  shell.dataset.sidebarCollapsed=String(collapsed); button.setAttribute("aria-expanded",String(!collapsed)); button.setAttribute("aria-label",collapsed?"展开导航":"收起导航");button.title=collapsed?"展开导航":"收起导航";
 });
 window.addEventListener("hashchange",()=>selectView().catch(error=>setStatus(error.message)));
 window.addEventListener("pagehide",()=>{observer.disconnect();anchorObserver.disconnect();cleanup.forEach(unbind=>unbind());},{once:true});
 setStatus(`已加载 ${components.length} 个组件目录；契约与示例按可见区域读取。`);
 await selectView();
} catch(error) { setStatus(error.message); }
