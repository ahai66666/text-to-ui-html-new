# HTML Component Mapping

Use this reference when an HTML page must reuse the HarmonyOS component system.

## One contract and one HTML renderer

Use `references/index/generated/component-index.json` to find the required capability, then read that component's `contractPath` under `packages/component-contracts/src/components/` for its logical name, variants, states, props, slots, Token roles, and readiness. `packages/component-contracts/src/components.json` is a generated compatibility aggregate. Matching appearance or manually added `data-component` attributes alone do not prove reuse.

Use semantic HTML and the registered factories from `@text-to-ui/components-html`. Load canonical Tokens and the shared component styles. Preserve `data-component`, `data-logical-component`, `data-variant`, and `data-state` emitted by the adapter. Do not copy component DOM or CSS into a page.

## Page contract

New strict pages use the current `component-usage.json` schema and declare `targetFramework: "html"`. Every binding records its exact logical name, supported props and slots, region, and renderer key. The selection receipt ties that binding to the registry, Context Packet, recipes, and current HTML component package.

```json
{
  "schemaVersion": 3,
  "targetFramework": "html",
  "renderer": {
    "package": "@text-to-ui/components-html",
    "factoryImport": "renderHtmlComponent"
  }
}
```

If a registered component lacks a required prop, slot, behavior, or HTML implementation, stop and resolve that gap in the canonical contract and package. Do not replace it with a visual lookalike.

## Preview and verification

Use the managed Component Gallery at `apps/component-gallery/index.html#runtime-view` and the managed HTTP preview. Verify source imports, exact renderer calls, contract attributes, runtime count, state, required slots, and Token coverage. Contract fixtures are not production components.

For Pixso reuse, resolve exact component identities by logical name, create linked instances, and read back `mainComponent`, exposed slots, and variable bindings. If a required property or mapping is missing, repair the shared library rather than redrawing the registered component.
