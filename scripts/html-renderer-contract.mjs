export const rendererPackage = "@text-to-ui/components-html";
export const styleImports = [
  "@text-to-ui/tokens",
  "@text-to-ui/components-html/styles.css",
  "@text-to-ui/components-html/pattern-shell.css",
];

export function componentRendererBinding(component, target = "html") {
  if (target !== "html") throw new Error("text-to-ui-html supports HTML components only");
  const runtime = component.frameworks?.html;
  if (!runtime?.exists) return null;
  return {
    capability: null,
    logicalName: component.logicalName,
    rendererKey: runtime.rendererKey,
    source: runtime.source,
    supportedProps: component.props ?? [],
    supportedSlots: component.slots ?? [],
    slotContracts: component.slotContracts ?? {},
    tokenRoles: component.tokenRoles ?? [],
  };
}

export function buildHtmlRendererContract(target, components) {
  if (target !== "html") throw new Error("text-to-ui-html supports HTML components only");
  return {
    framework: "html",
    package: rendererPackage,
    renderStrategy: "factory",
    factoryImport: "renderHtmlComponent",
    evidenceImport: "collectHtmlComponentEvidence",
    runtimeImport: null,
    styleImports,
    components: components.filter(Boolean),
  };
}
