# HTML Component Reuse Gate

Use this gate for every generated HTML page. Pixso fidelity and HTML component reuse are separate checks: a fast visual import may relax linked-instance requirements, but it does not permit handwritten lookalikes. Components fill validated Pattern slots; they cannot change pane order, title ownership, scrolling, or resize behavior.

## Required order

1. Confirm the Context Packet and Layout Contract. Validate the Pattern and pane order.
2. Use this compact snapshot as the HTML source. Verify components/component-manifest.json with scripts/prepare-page-components.mjs --check. Refresh the snapshot before reusing changed shared components.
3. Use the compact component index to find candidates, then read only the exact `packages/component-contracts/src/components/<id>.json` files needed by the page. Check task, behavior, logical name, variant, slots, and states.
4. Resolve `component-selection.json` from the current Context Packet, bindings, and content recipes. Missing props/slots or absent implementation require a shared contract decision before generation.
5. Generate strict `component-usage.json` with `targetFramework: "html"` and a current selection receipt.
6. Import production HTML component factories and canonical styles/Tokens into editable source.
7. Validate source calls and Token usage, then check runtime evidence in the browser.

## What counts as reuse

Reuse requires all of these:

- The exact registry `logicalName` is recorded in `component-usage.json`.
- The binding names the registered HTML `rendererKey`.
- Editable source imports `renderHtmlComponent` from the verified project-local components/index.js registry and calls the matching factory. The registry delegates to the copied canonical runtime; the source validator checks this bundle before accepting local imports. Existing package-based artifacts may retain their canonical package import.
- Business content enters through supported renderer props and slots; rendered roots are not cleared or rebuilt.
- Runtime evidence contains the expected logical name, count, region, state, and required slots.
- Page-owned styles pass the canonical Token audit.

These are markers only: `data-component`, a class name, copied markup/CSS, a screenshot, or a Pixso Frame with the same name.

## Source priority

1. **Registered component:** use the production HTML renderer when it supports the job.
2. **Contract-based implementation:** use the matching canonical contract when the package does not supply the needed implementation; record the exact contract evidence.
3. **Custom implementation:** only when neither a production component nor a relevant contract covers the capability. Record searches, rejected candidates, Token roles, and whether the work should be promoted into the shared library.

Do not jump from a provisional component to custom drawing when the registered HTML source can meet the task. Disclose the unverified readiness dimensions.

## Minimal manifest

```json
{
  "schemaVersion": 3,
  "targetFramework": "html",
  "registry": "packages/component-contracts/src/components.json",
  "sourceRoots": ["src"],
  "registered": [],
  "contractBased": [],
  "custom": [],
  "previousOutputReuse": false
}
```

Validate with `scripts/validate-web-component-reuse.mjs` and the runtime evidence captured from `collectHtmlComponentEvidence(document)`.
