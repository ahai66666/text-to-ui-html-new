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

