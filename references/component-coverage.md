# HTML Component Coverage

Use this reference when adding a component or reviewing registered component support.

## Current source

- `packages/component-contracts/src/components/<id>.json` is the source of truth for each component contract. `registry.json` stores registry-wide metadata, while `components.json` is regenerated for scripts that still need the aggregate format.
- `packages/components-html` contains this Skill's production HTML implementation snapshot.
- `apps/component-gallery/index.html#runtime-view` is the managed component preview.
- The registry currently contains 49 logical components. Check current readiness in the repository rather than maintaining a separate count here.
- This Skill bundles `apps/component-gallery/`; start it with `node scripts/preview-components.mjs`. Its category/card layout, inspector and scene styling come from the full Text-to-UI Gallery. The inspector parameter preview calls the same `renderHtmlComponent(componentId, options)` entry as generated project adapters. Individual contracts load when cards enter view; scenes and preview interactions are not approval evidence.

## Coverage gate

The production registry must not include legacy generated placeholder adapters. Keep those specimens in the separate legacy export; registered component IDs must call real implementations.

For a component addition or change, edit its individual contract and keep the HTML implementation, Tokens, Pixso mapping, and Gallery specimen aligned. Rebuild the aggregate registry and route index afterward. Repeatable interaction, keyboard, accessibility, and visual evidence is needed before marking a component approved. A fixture or copied preview cannot replace Gallery review.
