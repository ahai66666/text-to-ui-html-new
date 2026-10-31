import { componentIdentityEvidence, collectComponentIdentityViolations } from "./component-identity.js";

export function collectHtmlComponentEvidence(root = document) {
  const nodes = [...root.querySelectorAll(".tui-component[data-component][data-logical-component]")];
  const patternRoot = root.querySelector("[data-pattern][data-structure-digest], [data-tui-pattern][data-structure-digest]");
  const rectEvidence = (node) => {
    const rect = node?.getBoundingClientRect?.();
    return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
  };
  const stylesheetEvidence = [...(root.styleSheets ?? [])].map((stylesheet) => {
    try {
      return { href: stylesheet.href ?? "inline", loaded: true, ruleCount: stylesheet.cssRules.length };
    } catch {
      return { href: stylesheet.href ?? "inline", loaded: true, ruleCount: null };
    }
  });
  const patternStyle = patternRoot ? getComputedStyle(patternRoot) : null;
  const patternRegions = patternRoot ? [...patternRoot.querySelectorAll(":scope > [data-pattern-region], :scope > [data-ui-region], [data-tui-pane-role]")].map((node) => {
    const style = getComputedStyle(node);
    const readBoxStyle = (candidate) => {
      if (!candidate) return null;
      const candidateStyle = getComputedStyle(candidate);
      return {
        paddingInlineStart: candidateStyle.paddingInlineStart,
        paddingInlineEnd: candidateStyle.paddingInlineEnd,
        paddingBlockStart: candidateStyle.paddingBlockStart,
        paddingBlockEnd: candidateStyle.paddingBlockEnd
      };
    };
    const titleSegment = node.querySelector(":scope > [data-pattern-title-segment]");
    const scrollBody = node.querySelector(":scope > [data-pattern-scroll-body]");
    return {
      region: node.getAttribute("data-pattern-region") ?? node.getAttribute("data-ui-region") ?? node.getAttribute("data-tui-pane-role"),
      display: style.display,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      bounds: rectEvidence(node),
      padding: readBoxStyle(node),
      title: titleSegment ? { bounds: rectEvidence(titleSegment), padding: readBoxStyle(titleSegment) } : null,
      scrollBody: scrollBody ? { bounds: rectEvidence(scrollBody), padding: readBoxStyle(scrollBody), overflowY: getComputedStyle(scrollBody).overflowY } : null,
      slots: [...node.querySelectorAll(".tui-pattern-runtime__slot[data-pattern-slot]")].map((slot) => ({ id: slot.getAttribute("data-pattern-slot"), bounds: rectEvidence(slot), padding: readBoxStyle(slot) }))
    };
  }) : [];
  const interactiveSelector = "button, input, select, textarea, a[href], [role='button'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [role='menuitem'], [contenteditable='true']";
  const unclassifiedInteractive = [...root.querySelectorAll(interactiveSelector)]
    .filter((node) => !node.closest(".tui-component[data-component][data-logical-component], [data-custom-ui], [data-contract-ui]"))
    .map((node, index) => ({
      index,
      tag: node.tagName.toLowerCase(),
      role: node.getAttribute("role"),
      label: node.getAttribute("aria-label") ?? node.getAttribute("title") ?? node.textContent?.trim().slice(0, 80) ?? ""
    }));
  return {
    schemaVersion: 1,
    colorReferences: (root.querySelector?.("#app") ?? root).__tuiColorReferences?.getEvidence?.() ?? null,
    url: root.location?.href ?? null,
    pattern: patternRoot?.dataset.pattern ?? patternRoot?.dataset.tuiPattern ?? null,
    structureDigest: patternRoot?.dataset.structureDigest ?? null,
    stylesheets: stylesheetEvidence,
    patternLayout: patternRoot ? {
      display: patternStyle.display,
      gridTemplateColumns: patternStyle.gridTemplateColumns,
      gridTemplateRows: patternStyle.gridTemplateRows,
      bounds: rectEvidence(patternRoot),
      regions: patternRegions
    } : null,
    customRegions: [...root.querySelectorAll("[data-custom-ui]")].map((node) => node.getAttribute("data-custom-ui")).filter(Boolean),
    contractRegions: [...root.querySelectorAll("[data-contract-ui]")].map((node) => node.getAttribute("data-contract-ui")).filter(Boolean),
    unclassifiedInteractive,
    identityViolations: collectComponentIdentityViolations(root),
    components: nodes.map((node, index) => ({
      index,
      tagName: node.tagName.toLowerCase(),
      bounds: rectEvidence(node),
      identity: componentIdentityEvidence(node),
      rendererKey: node.dataset.rendererKey ?? node.dataset.component,
      componentId: node.dataset.component,
      framework: node.dataset.framework ?? null,
      logicalName: node.dataset.logicalComponent,
      variant: node.dataset.variant,
      state: node.dataset.state,
      region: node.closest("[data-ui-region], [data-pattern-region]")?.getAttribute("data-ui-region") ?? node.closest("[data-pattern-region]")?.getAttribute("data-pattern-region") ?? null,
      slots: [...new Set([...node.querySelectorAll("[data-slot]")].map((slotNode) => slotNode.getAttribute("data-slot")))],
      hiddenByDisclosure: Boolean(node.closest(".tui-disclosure__content[hidden]")),
      visible: Boolean(node.getClientRects().length && getComputedStyle(node).visibility !== "hidden")
    }))
  };
}

export function visualNodeState(node, view) {
  const style = view.getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  const visible = Boolean(node.getClientRects().length && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0);
  const labelNode = node.querySelector("[data-slot='label'], .tui-button__label");
  const label = (labelNode?.textContent ?? node.textContent ?? "").trim();
  const labelVisible = Boolean(visible && label && (!labelNode || (labelNode.getClientRects().length && view.getComputedStyle(labelNode).display !== "none")) && !node.classList.contains("tui-button--icon"));
  const iconNode = node.querySelector("[data-slot='leading'] svg, [data-slot='leading'] img, svg, img");
  const iconRect = iconNode?.getBoundingClientRect?.() ?? null;
  const mode = node.classList.contains("tui-button--icon") || !labelVisible ? "icon" : "icon-text";
  return {
    htmlSelector: node.dataset.action ? `[data-action='${node.dataset.action}']` : null,
    label: labelVisible ? label : "",
    labelVisible,
    mode,
    visible,
    buttonWidth: Number(rect.width.toFixed(3)),
    buttonHeight: Number(rect.height.toFixed(3)),
    iconSize: iconRect ? { width: Number(iconRect.width.toFixed(3)), height: Number(iconRect.height.toFixed(3)) } : null,
    color: style.color,
    backgroundColor: style.backgroundColor,
    border: style.border,
    borderRadius: style.borderRadius,
    padding: style.padding,
    gap: style.gap,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
  };
}

export function collectHtmlVisualSnapshot(root = document, options = {}) {
  const view = root.defaultView ?? window;
  const actionsByRegion = {};
  for (const button of root.querySelectorAll("button[data-action]")) {
    // The overflow menu mirrors the visible business actions. It is not part
    // of the titlebar's rendered child order and must not overwrite the
    // computed state captured from the direct action buttons.
    if (button.matches("[data-overflow-menu-item='true']")) continue;
    const actionId = button.dataset.action;
    if (!actionId) continue;
    const uiRegion = button.closest("[data-ui-region]")?.getAttribute("data-ui-region") ?? "document";
    const region = uiRegion === "main-detail" && button.closest(".tui-titlebar__pane-actions")
      ? "detailTitlebarActions"
      : uiRegion;
    actionsByRegion[region] ??= { order: [], actions: {} };
    if (!actionsByRegion[region].order.includes(actionId)) actionsByRegion[region].order.push(actionId);
    actionsByRegion[region].actions[actionId] = visualNodeState(button, view);
  }
  return {
    schemaVersion: 2,
    source: "html-live-computed-style",
    capturedAt: new Date().toISOString(),
    url: view.location?.href ?? null,
    stateScope: options.stateScope ?? "default-visible",
    htmlSourceFingerprint: options.htmlSourceFingerprint ?? null,
    viewport: {
      width: Number(options.width ?? view.innerWidth),
      height: Number(options.height ?? view.innerHeight),
      devicePixelRatio: Number(view.devicePixelRatio ?? 1),
      zoom: Number(view.visualViewport?.scale ?? 1),
    },
    regions: actionsByRegion,
  };
}
