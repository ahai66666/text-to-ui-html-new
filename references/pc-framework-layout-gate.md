# PC Framework Layout Gate

Apply this gate before component selection for every HarmonyOS PC page. The
framework layout contract is the highest page-composition rule: components fill
its slots; components do not invent or override the application shell.

## Required order

1. Read `references/harmonyos-layout-patterns.md` and
   `references/layout-system.md` before writing `page-spec.json` or page code.
2. Classify the primary workflow, then choose the simplest approved shell:
   - `pattern-a-two-pane`: navigation plus content for browsing, settings, and
     content hubs.
   - `pattern-b-three-pane`: navigation plus list plus detail for repeated
     list-to-detail work.
   - `pattern-c-tool-workspace`: navigation plus command-heavy editor, file,
     asset, or canvas workspace.
   - `pattern-d-inspector`: add a contextual Inspector to B or C only when
     current-selection properties require it.
3. Write `layout-contract.json` before `component-usage.json`.
4. Validate it with `validate-pc-framework-layout.mjs`.
5. Copy the approved shell, pane, title-layer, inset, scrolling, resize, and
   action-slot decisions into `page-spec.json.constraintContract`.
6. Only after this gate passes, select components and fill the declared slots.

## Mandatory framework rules

- Use a desktop application window, not a website container or mobile layout.
- Use the approved `1728 × 1152` reference viewport and `1100 × 720` minimum
  window unless the confirmed requirement contract supplies another desktop
  value.
- Keep the Global Title Layer fixed and segmented on the same vertical
  boundaries as Workspace panes.
- Keep application shell regions structural; do not wrap the whole navigation,
  list, detail, workspace, or Inspector pane in decorative cards.
- Declare one owner for every pane inset and every scrollbar. Do not duplicate
  padding on both a pane shell and its children.
- Put the only page-global Primary action in the Primary Navigation Shell
  Global Primary Slot. Local actions stay with their scope.
- Declare the Final Pane Leading Slot according to the chosen two-pane,
  three-pane, or secondary-page contract.
- Preserve fixed component and type sizes during resize. Let the final Main
  region consume remaining width; do not switch to mobile navigation.
- Declare expanded/collapsed navigation only when the workflow supports it;
  preserve selection, accessible names, focus transfer, and first-level routes.
- Use layout, spacing, size, divider, surface, and typography Tokens from the
  shared system. Literal layout values are allowed only when the contract marks
  an approved intrinsic-content exception.

## Minimal contract

```json
{
  "schemaVersion": 1,
  "platform": "harmonyos-pc",
  "pattern": "pattern-b-three-pane",
  "references": [
    "references/harmonyos-layout-patterns.md#pattern-b-three-pane-navigation-list-detail",
    "references/layout-system.md"
  ],
  "viewport": { "width": 1728, "height": 1152, "minWidth": 1100, "minHeight": 720 },
  "paneOrder": ["primary-navigation", "secondary-list", "main-detail"],
  "globalTitleLayer": true,
  "titleSegments": ["primary-navigation", "secondary-list", "main-detail"],
  "primaryActionSlot": "primary-navigation-shell",
  "finalPaneLeadingSlot": "main-detail-operations",
  "requiredSlots": ["primary-navigation-shell", "global-title-layer", "global-primary-action", "main-detail-actions"],
  "insetOwners": {
    "primary-navigation": "primary-navigation-shell",
    "secondary-list": "secondary-list-shell",
    "main-detail": "main-detail-shell"
  },
  "scrollOwners": ["primary-navigation", "secondary-list", "main-detail"],
  "resizeBehavior": "fixed-panes-flexible-final-pane",
  "contentMode": "default-content",
  "layoutTokens": ["layout/sidebar-width", "layout/secondary-pane-width", "layout/main-detail-padding-x"]
}
```

Validate from the Monorepo root:

```bash
node scripts/validate-pc-framework-layout.mjs \
  --contract /absolute/path/to/layout-contract.json
```
