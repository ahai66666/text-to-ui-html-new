# HarmonyOS Desktop Layout System

Use this reference before composing any Pixso top-level Frame or interactive frontend view. Confirm project-specific values when supplied; otherwise use the approved defaults in this file. Proposed values must not become design truth until approved.

## 1. Window Foundation

| Property | Token | Value | Status |
|---|---|---:|---|
| Default design frame width | `--layout-frame-width` | 1728px | Approved |
| Default design frame height | `--layout-frame-height` | 1152px | Approved |
| Minimum window width | `--layout-window-min-width` | 1100px | Approved |
| Minimum window height | `--layout-window-min-height` | 720px | Approved |
| Maximum window width | `--layout-window-max-width` | none | Proposed |
| Window resizing | `--layout-window-resize` | fluid desktop | Approved |

The `1728 × 1152px` viewport is the HTML reference viewport. It is not a fixed application size. Desktop resizing behavior must be defined without introducing mobile layouts.

## 2. Application Shell

Choose the shell pattern using `harmonyos-layout-patterns.md` before assigning pane dimensions.

| Region | Token | Value | Status |
|---|---|---:|---|
| Non-dialog global title layer height | `--layout-titlebar-height` | 64px | Approved |
| Standard sidebar width | `--layout-sidebar-width` | 240px | Approved |
| Wide sidebar width | `--layout-sidebar-width-wide` | 360px | Approved |
| Collapsed sidebar width | `--layout-sidebar-width-collapsed` | 64px | Proposed |
| Secondary list pane width | `--layout-secondary-pane-width` | 360px | Approved |
| Right main/detail pane width | `--layout-main-pane-width` | remaining width (`1fr`) | Approved |
| Main content maximum width | `--layout-content-max-width` | none | Approved |

Recommended shell structure:

```text
Application Window
├── Titlebar
└── Workspace
    ├── Primary Navigation (default for full apps)
    ├── Secondary Pane (optional)
    ├── Main
        ├── Page Header / Toolbar
        └── Page Content
    └── Inspector (optional)
```

Do not wrap these primary shell regions in decorative cards. Adjacent panes are separated by quiet structural boundaries. The Titlebar is a transparent global title layer, not an independent color band. The component itself adds no fill or bottom divider by default; each shell segment uses the same surface as the pane directly below it. Vertical pane dividers remain continuous through the title layer and workspace.

### Primary Shell Global Primary Slot

The Primary Navigation Shell owns the page-global Primary action slot between its fixed Brand Anchor and the Sidebar navigation content. Every page-global action using the Primary Button variant must appear here. Most pages use it for New Project, New Document, New Task, or the equivalent primary CTA.

- Keep exactly one page-global Primary CTA in this slot. Do not place a page-global Primary Button in the Secondary Pane, Main Detail, Titlebar final-pane slot, or content toolbar.
- Expanded navigation uses the standard 40px-high Primary Button with icon and text. The Primary Navigation already owns a 16px horizontal inset; the action slot adds `--space-3` (8px) horizontal inner padding, so the button's left and right edges land on the 24px content axis shared with the Brand Anchor / Logo. The action slot owns an 8px gap below the Brand Anchor / Titlebar through `--layout-primary-action-slot-gap-top`, and a 12px gap before the first Sidebar navigation component through `--layout-primary-action-slot-gap-bottom`. These are scoped slot values: do not apply them as padding or direct-child gaps on the whole Primary Navigation, and do not change menu-row spacing. Collapsed 64px navigation keeps a 40px icon-only Primary Button, hides its label, and supplies an accessible name and Tooltip; its slot uses the collapsed-mode compensation so the icon remains centered in the 64px rail.
- Do not add a horizontal divider above or below this action slot. Use spacing to separate Brand Anchor, action, and Sidebar navigation.
- Secondary, Ghost, Icon, and other non-Primary buttons may appear elsewhere according to scope: list controls in Secondary Pane; Detail/Editor controls in Main Detail; local controls next to their target. Their presence elsewhere does not weaken the exclusive placement rule for the page-global Primary CTA.

### Final Pane Leading Slot

Segment the Global Title Layer on the same vertical boundaries as the Workspace panes. The top-left of the final pane is a semantic slot whose content changes with the shell structure:

| Workspace structure | Final pane leading slot |
|---|---|
| Two panes: Primary Navigation + Main Content | Current page or current section title |
| Three panes: Primary Navigation + Secondary Pane + Main Detail | `main-detail-actions` slot containing 0..n `icon` or `icon-text-ghost` Ghost Buttons |
| Secondary page inside the final pane | Ghost Back Icon Button + `Title_S` secondary-page title |

- The slot container begins at the final pane boundary. In a two-pane shell, the title uses `--layout-main-title-leading-padding` (`--space-6`, 24px). In a three-pane shell, the Main Detail operation group uses `--layout-main-detail-action-leading-padding` (`--space-5`, 16px).
- In a two-pane shell, the title identifies the final Main Content pane. Place view actions after the title or in the right action area according to available width.
- On a secondary page, keep the two- or three-pane shell boundaries unchanged and replace the final-pane leading content with a 40px Ghost Back Icon Button followed by `Title_S`. The group uses the Main Content 24px leading axis; do not add another nested title inset.
- In a three-pane shell, the Secondary Pane already supplies list context, so the final Main Detail pane uses its leading slot only for non-Primary actions whose scope is the complete current detail/editor workspace, such as save, share, expand, open separately, layout, or mode controls. The page-global Primary CTA stays in the Primary Shell Global Primary Slot. Do not repeat the page title in the final pane slot.
- `main-detail-actions` is the default and exclusive Titlebar slot for every action scoped to the complete third pane. It accepts 0..n `icon` or `icon-text-ghost` Buttons, both using the `ghost` variant. Keep all Main Detail pane-global actions together in one compact group, ordered by task priority. The first action begins 16px after the Main Detail divider; additional actions continue horizontally using the component spacing tokens.
- Actions scoped to a card, field, section, selected object, or inline content stay next to that target and do not enter the pane-global slot.
- Application-wide actions that are not owned by Main Detail remain in the far-right application action area. Window controls remain at the far right and never move into the final pane leading slot.
- When a three-pane shell collapses to two panes, replace the pane-global-action content with the final pane title. Do not merely hide the Secondary Pane while leaving the old slot semantics unchanged.
- Keep the title layer and pane boundaries vertically aligned in HTML Grid. Do not position the slot with arbitrary absolute offsets.
- Render ordinary product-operation buttons in the Titlebar as Ghost Button or Ghost Icon Button variants. Their resting background is transparent; Hover, Pressed, and Focus may add the approved state layer. Do not use Secondary or filled backgrounds for their resting state. Window controls remain governed by the Titlebar system-control rules rather than this product-operation rule.
- Declare the native Titlebar scene explicitly with `layout="standalone|two-column|three-column"` and `segmentRole="global|primary-navigation|secondary-list|main-content|main-detail"`. A two-column shell is composed of a branded Primary Navigation segment and a final segment containing the large title plus the three window controls; neither segment has a bottom divider. A three-column shell is composed of the branded Primary Navigation segment, a divider-free Secondary Pane segment, and a final segment containing the `main-detail-actions` 0..n operation slot plus the three window controls; only this final segment has the Tokenized bottom divider. Standalone/global Titlebar also has no bottom divider. The shell still owns continuous vertical pane dividers.

## 3. Page Spacing

| Role | Token | Reference | Value | Status |
|---|---|---|---:|---|
| Main Content horizontal padding | `--layout-main-content-padding-x` | `--space-6` | 24px | Approved; equal on left and right |
| Main Content top padding | `--layout-main-content-padding-top` | `--space-5` | 16px | Approved; begins below title layer |
| Main Content bottom padding | `--layout-main-content-padding-bottom` | `--space-0` | 0px | Approved; content normally continues beyond one viewport and owns vertical scrolling |
| Two-pane Main title leading padding | `--layout-main-title-leading-padding` | `--space-6` | 24px | Approved; measured from the Main pane divider |
| Three-pane Main Detail action leading padding | `--layout-main-detail-action-leading-padding` | `--space-5` | 16px | Approved; measured from the Main Detail divider |
| Sidebar horizontal padding | `--layout-sidebar-padding-x` | `--space-5` | 16px | Approved |
| Sidebar content vertical padding | `--layout-sidebar-padding-y` | `--space-5` | 16px | Approved; begins below title layer |
| Global Primary slot top gap | `--layout-primary-action-slot-gap-top` | `--space-3` | 8px | Approved; Titlebar / Brand Anchor to button only |
| Global Primary slot bottom gap | `--layout-primary-action-slot-gap-bottom` | `--space-4` | 12px | Approved; button to first navigation component only |
| Secondary List Pane horizontal padding | `--layout-secondary-pane-padding-x` | `--layout-secondary-list-card-inset-x` | 16px | Approved; aliases the List Card state-envelope inset |
| Secondary List Pane vertical padding | Pattern B Renderer: `--space-3` top / `--space-0` bottom; legacy static shell: `--layout-secondary-pane-padding-y` | 8px top / 0px bottom in the Renderer; 8px legacy static compatibility | Approved; the shared Renderer owns the top rhythm and keeps the list content flush to the pane at the bottom |
| Secondary List surface inset | `--layout-secondary-list-card-inset-x` | `--space-5` | 16px | Approved; standalone Search and List Card state-background edge |
| Secondary List Card horizontal padding | `--layout-secondary-list-card-padding-x` | `--space-3` | 8px | Approved; row content inset from its state background |
| Secondary List content alignment axis | `--layout-secondary-content-axis-x` | `--space-6` | 24px | Approved; title, toolbar/meta, states, and row content |
| Main Detail horizontal padding | `--layout-main-detail-padding-x` | `--space-6` | 24px | Approved; default content mode, equal on left and right |
| Main Detail top padding | `--layout-main-detail-padding-top` | `--space-5` | 16px | Approved; begins below title layer |
| Main Detail bottom padding | `--layout-main-detail-padding-bottom` | `--space-0` | 0px | Approved; content normally continues beyond one viewport and owns vertical scrolling |
| Major section gap | `--layout-section-gap` | `--space-7` | 32px | Proposed |
| Module group gap | `--layout-module-gap` | `--space-6` | 24px | Proposed |
| Toolbar-to-content gap | `--layout-toolbar-gap` | `--space-5` | 16px | Proposed |

### Pane Inset Matrix

Measure every inset from the pane's inner edge after its divider. The divider is structural and is never included in the padding value.

| Shell region | Left | Right | Top | Bottom | Owner |
|---|---:|---:|---:|---:|---|
| Primary Navigation content | 16px | 16px | 16px | 16px | Navigation scroll wrapper |
| Secondary List Search / Card state envelope | 16px | 16px | 8px | 0px | Secondary Pane scroll wrapper |
| Secondary List aligned content | 24px | 24px | — | — | Title/meta/states and row-content axis |
| Main Content in a two-pane shell | 24px | 24px | 16px | 0px | Main page-content scroll wrapper |
| Main Detail in a three-pane shell | 24px | 24px | 16px | 0px | Main Detail scroll wrapper |

Mandatory composition rules:

- Apply the pane inset exactly once. Put it on the direct scrolling content wrapper, not on the pane shell and every child section.
- The Secondary Pane uses a 16px surface axis and a nested 24px content axis. In the shared Pattern Renderer, the direct scrolling wrapper owns 16px horizontally, 8px at the top, and 0px at the bottom; the legacy static shell may retain its 8px compatibility token. A standalone Search occupies its own row and its control frame aligns directly with the List Card Selected/Hover/Pressed background at `--layout-secondary-list-card-inset-x` (16px). Each List Card adds `--layout-secondary-list-card-padding-x` (8px), placing row content on `--layout-secondary-content-axis-x` (24px). The title, toolbar/meta copy, and empty/loading/error content use the 24px axis. State changes must not alter either geometry.
- Main Content and Main Detail use 24px on the left and right, 16px on top, and 0px on the bottom. This is the mandatory default for every future skill-generated client page: apply it symmetrically through the direct content scroll wrapper, not as optional per-section spacing. Their content wrapper owns vertical scrolling, so do not reserve a fixed bottom inset merely to mark the viewport edge. The Main Detail Titlebar operation group is a separate 16px slot and does not align to the body's 24px leading edge. The slot contains Detail/Editor operations, never the page-global create action. Cards retain their own internal `--padding-card`; card padding does not replace or duplicate the pane inset.
- A secondary page reuses the owning Main Content or Main Detail scroll wrapper and therefore does not add another page-padding wrapper. The Back + title group changes title-layer content only; it must not shift pane boundaries or body geometry.
- In HTML, use one scroll wrapper per pane as the inset owner. Never reproduce these offsets with per-child margins or absolute positioning.

#### Secondary List Pane anatomy

Build the second column as `standalone Search in the transparent Titlebar segment -> scrolling inset owner -> List title + action row -> optional meta row -> List collection`. In this three-pane list-detail pattern, Search belongs to the Secondary Pane Titlebar slot and the List title belongs to the content area below it. Search fills the Titlebar row at the 16px surface edge and must not share that row with filter, sort, view, title, or other buttons. The shared Renderer scrolling wrapper owns the List content inset exactly once: 16px horizontally, 8px at the top, and 0px at the bottom. The first content row uses `--height-list-heading` (40px), aligns to the 24px content axis with the tokenized 8px nested inset, and pairs the complete `title-s` title on the left with its Ghost operation group on the right. Place count or auxiliary context in an optional meta row below rather than occupying the title action slot. List Cards fill the 16px envelope and use 8px horizontal padding, so their content lands on 24px. The collection is page-owned content: each card gets a stable content-slot ID plus `leading`, `content`, `title`, and `description` sub-slots; varying card types do not imply an automatic `List Item` component mapping. Empty/loading/error content also uses the 24px content axis. Selecting a row updates Main Detail in place and leaves the three-pane shell stable.

### Vertical-axis alignment principle

Classify each edge before aligning it: comparable control/state surfaces share a surface axis, while readable content shares a nested content axis. For Secondary List Pane, the standalone Search frame and List Card state background share the 16px surface axis. The title, toolbar/meta copy, list states, and List Card content share the 24px content axis, enforced as `24px = 16px surface inset + 8px List Card horizontal padding`. Do not align a full-width control frame to the nested card-content axis, and do not correct alignment with per-child margins or literal pixel values.

### Explicit Edge-Aligned Exception

Main Detail may use an edge-aligned canvas mode only for an editor canvas, data grid, media surface, map, or file workspace that must reach the pane boundary. This exception must be named `edge-aligned` in the requirement contract or layout record; do not infer it from available space.

- `default-content`: apply 24px left/right, 16px top, and 0px bottom to the Main Detail scroll wrapper.
- `edge-aligned`: the canvas/data surface may use 0px outer inset, but every toolbar, breadcrumb, form header, empty state, and readable text block still uses a safe-area wrapper with 24px left/right, 16px top, and 0px bottom.
- Never mix default-content and edge-aligned insets on sibling sections without an explicit edge-aligned container boundary.

## 4. Grid

| Property | Token | Value | Status |
|---|---|---:|---|
| Grid columns | `--layout-grid-columns` | 12 | Approved |
| Grid gutter | `--layout-grid-gutter` | 24px | Approved |
| Grid behavior | `--layout-grid-behavior` | fluid | Approved |
| Card minimum width | `--layout-card-min-width` | 280px | Proposed |

Use CSS Grid with the canonical layout Token values. Fixed-format boards, tables, and editor canvases may define a local grid, but must still align with the page shell.

## 5. Resize Rules

At or above the approved minimum window size:

- Keep typography and control sizes fixed; do not scale them with viewport width.
- Let Main consume remaining width after fixed shell regions.
- Allow data grids, editors, and canvases to grow before increasing page margins.
- Collapse Sidebar only when the product workflow supports a collapsed state.
- Preserve primary actions and task-critical information before secondary panels.
- Do not switch to tablet or mobile navigation patterns.

## 7. HTML Mapping

```css
:root {
  --layout-frame-width: 1728px;
  --layout-frame-height: 1152px;
  --layout-window-min-width: 1100px;
  --layout-window-min-height: 720px;
  --layout-titlebar-height: 64px;
  --layout-sidebar-width: 240px;
  --layout-sidebar-width-wide: 360px;
  --layout-sidebar-width-collapsed: 64px;
  --layout-secondary-pane-width: 360px;
  --layout-main-pane-width: 1fr;
  --layout-main-content-padding-x: var(--space-6);
  --layout-main-content-padding-top: var(--space-5);
  --layout-main-content-padding-bottom: var(--space-0);
  --layout-main-title-leading-padding: var(--space-6);
  --layout-main-detail-action-leading-padding: var(--space-5);
  --layout-sidebar-padding-x: var(--space-5);
  --layout-sidebar-padding-y: var(--space-5);
  --layout-primary-action-slot-gap-top: var(--space-3);
  --layout-primary-action-slot-gap-bottom: var(--space-4);
  --layout-secondary-list-card-inset-x: var(--space-5);
  --layout-secondary-list-card-padding-x: var(--space-3);
  --layout-secondary-content-axis-x: var(--space-6);
  --layout-secondary-pane-padding-x: var(--layout-secondary-list-card-inset-x);
  --layout-secondary-pane-padding-y: var(--space-3);
  --layout-main-detail-padding-x: var(--space-6);
  --layout-main-detail-padding-top: var(--space-5);
  --layout-main-detail-padding-bottom: var(--space-0);
  --layout-section-gap: var(--space-7);
  --layout-module-gap: var(--space-6);
  --layout-toolbar-gap: var(--space-5);
  --layout-grid-columns: 12;
  --layout-grid-gutter: var(--space-6);
  --layout-card-min-width: 280px;
}
```

Approved values are mirrored in `tokens.layout.css` and `tokens.layout.json`. Proposed values must not be copied into production output until approved.

## 8. Decisions To Confirm

1. Maximum window width, if any.
2. Collapsed sidebar width and collapse trigger.
3. Major section and module gap proposals.
4. Card minimum width.
5. Whether a separate property Inspector is needed in addition to the flexible right Main pane.
