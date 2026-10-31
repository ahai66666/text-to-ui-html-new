# Titlebar · 分段标题栏

Titlebar is a segment component, not a second Pattern shell. Pattern owns the
ordered title segments, their widths, dividers and height. Do not give Titlebar
a separate grid or hard-code a navigation width. Preserve the existing size
and visual variants. Use the current segmentRole parameter; paneRole is removed and rejected.

The brand image is the canonical `logo` slot. Global and
primary-navigation (first-level) segments always show it. Secondary-pane and
final-pane (second-level and third-level) segments hide it by default and may
opt in or out with `showLogo`; when shown, they use the same `logo` slot and
the same size alignment as the first-level brand. The old `leading` image slot
remains a compatibility alias for `logo` on first-level segments only.

Titlebar has no outer frame. Its segment boundary is a Runtime-owned divider;
the component itself uses a transparent surface and `border-bottom: 0` except
for any explicitly contracted final-pane separator. Do not add an outline,
rounded card border, or shadow around a Titlebar from page CSS. Structural
dividers use `--layout-navigation-divider-width` (`0.5px`); focus outlines
belong only to the registered button/input states.

Every generated canonical Pattern page must contain one renderer-owned
Titlebar scene. The global binding is the page-level invariant; Pattern A/B/C/D
may vary the registered Titlebar size, not the ownership or geometry. Use
`medium` (M), `large` (L, default), or `xlarge` (XL) for pane-aligned Pattern
titlebars. `small` (S) belongs only to the standalone Secondary Page runtime;
the page compiler rejects it in a Pattern title layer and emits the resolved
size in `titlebar-scene.json`.

The Runtime shell itself is one column with two rows: the pane-aligned Global
Title Layer, then the Pattern pane grid. Pattern-specific column widths belong
to `.tui-pattern-runtime__pane-grid`, not the Runtime root. A page or adapter
that adds `grid-template-columns` to the root recreates the historical
four-column/overlap bug and is a blocking layout error.

## Scenarios

- Two panes: brand segment → content-title + window-control segment.
- Three panes: brand Titlebar → middle content segment → final Titlebar with
  detail actions + window controls. The middle segment may be empty. When a
  registered component is supplied through `secondary-pane-content`, the
  Titlebar owns the shared height, applies one `space/5` (16px) inline inset,
  and centers the component on the cross axis for the selected S/M/L/XL
  Titlebar height. It does not add top/bottom padding. Pattern Runtime still
  owns the segment width, order, and dividers. When the Titlebar is mounted as
  the segment itself, the shell suppresses its duplicate middle inset; when a
  Search is mounted directly in the Pattern slot, the renderer owns that one
  inset instead.
- `Titlebar_S` (`size: "small"`, 40px) is standalone-only. It may be used as
  one complete titlebar (including a standalone final-pane title), but it must
  not be split into two-column or three-column Pattern segments. Use M/L/XL for
  pane-aligned title segments.
- `segmentRole` uses `primary-navigation`, `secondary-list`, `main-content`,
  or `main-detail`. paneRole is removed and rejected.
- Other Pattern segment sequences may use `createTitlebarSegments` with the
  resolved `pattern.titleLayer.segments`; it returns configurations only and
  does not render a competing layout.

## Title typography

The standalone `Titlebar_S` title uses `Subtitle_M` (`16px / 20px / 500`).
Pane-aligned title slots on Titlebar M/L/XL use `Title_S` (`20px / 24px / 700`);
the brand/app `label` uses `Subtitle_M` at every size. The component selects the
role from its registered size and emits the matching typography marker. Do not
copy a Dialog or Semi-modal title role onto Titlebar S, and do not add a
page-owned font override.

## Trailing inset

The rendered Titlebar keeps a 12px trailing inset. This applies to the S / 40px
standalone preview as well as the generic generated adapter, which use the
existing `--padding-titlebar-trailing-l` token. Do not replace it with a raw
`12px` value or the legacy `--padding-titlebar-trailing-s` token; the component
style is the shared source for HTML.

## Executable HTML slots

| Slot | Value | Segment |
| --- | --- | --- |
| `logo` | `{ src, alt? }` logo image | All segments; visible by default only for global/primary-navigation |
| `leading` | `{ src, alt? }` legacy alias for `logo` | Global/primary-navigation only |
| `label` | Text | Brand |
| `main-content-leading` | `{ id, label, icon, buttonType? }` action object | Two-pane final segment; leading action such as Back; 24×24 icon, 4px gap to title |
| `main-content-title` | Text | Standalone final title or two-pane final segment |
| `main-detail-actions` | Action objects array | Three-pane final segment |
| `secondary-pane-content` | `{ component: "search", props? }` | Three-pane middle segment; registered Search only |
| `actions` | Boolean; enable/disable built-in window controls | Final segment |

These are controlled content slots, not arbitrary HTML or containers. Titles
are escaped text, actions render through library buttons, and window controls
remain component-owned. Invalid slot/segment combinations fail before render.
Use `showLogo` to control secondary-pane/final-pane visibility; setting it to
`false` on a first-level segment is invalid because first-level Titlebars must
always expose the logo. If `slots.logo` is supplied for a secondary or final
segment, it is shown unless `showLogo: false` is supplied. Do not provide both
`slots.logo` and the legacy `slots.leading` alias.
`showWindowControls: false` hides the built-in controls only where the Pattern
permits it. Pattern B requires the final segment controls. Only a standalone
global Titlebar or a final segment may show them.

In a generated Pattern B HTML page, the compiler composes the primary,
secondary, and final values into one pane-aligned Global Title Layer. The
detail action group is then activated with `bindTitlebarOverflow`; do not leave
the detail Titlebar in a pane-local header or add a second hand-written action
row, because that produces an apparent fourth column and allows actions to
paint over the fixed window controls.

The same rule applies to the primary-navigation segment: in a two-level shell
`global-title-layer` must contain exactly one direct `Titlebar/Default` binding
with `layout: "three-column"` and `segmentRole: "primary-navigation"`. Do not wrap
it in a page `header`, put a collapse button beside it, or add a second
background layer. The navigation shell supplies the subtle surface; the
Titlebar component itself remains transparent through
`--color-titlebar-normal-bg`. A collapse affordance, if the selected Pattern
contract exposes one, must be a declared Titlebar/component slot rather than a
page-owned sibling.

For Pattern B the `secondary-list-title` segment is Search-only (at most one
registered Search component), and Search must explicitly bind that Pattern
slot. Scope, filter, refresh, and selection controls belong in the list body or
a registered component-owned action slot. The shell uses one 64px row with
`align-items: center`, applies the middle `space/5` inline inset once, and lets
Search fill the remaining width. Page CSS must not add top/bottom alignment or
another title-row padding. The standalone Titlebar gallery uses the same
`secondary-pane-content` contract so the component preview and Pattern Runtime
cannot drift apart.

The right segment must be exactly one `Titlebar/Default` binding in
`main-detail-title`, with `semanticContext: "main-detail-titlebar"`,
`layout: "three-column"`, and `segmentRole: "main-detail"`. Put business
actions in that binding's `slots["main-detail-actions"]`; never bind sibling
Button components directly to the Pattern `main-detail-actions` slot. The
Titlebar then owns action normalization, responsive collapse-to-More, and the
fixed trailing 3×40px window-control group. Every window control is a
registered `Icon Button/Ghost/Default` with a 24×24 icon.

## Generated Titlebar Scene

For every canonical Pattern page, page generation resolves the binding data
through `assets/design-system/titlebar-scene-contracts.json` and commits a
sibling `titlebar-scene.json`. It is the inspectable source of the rendered
title layer, not an optional preview file.

Pattern B's three segments are fixed
as follows:

- Primary navigation: one pane-aligned `Titlebar/Default`, transparent over the
  Runtime-owned navigation surface, with no window controls.
- Secondary list: zero or one registered Search component, vertically centered
  in the shared title height with one `space/5` inline inset.
- Main detail: one final `Titlebar/Default`; nested business actions have one
  uniform mode and collapse to More, followed by the component-owned
  minimize/maximize/close group of 40px Ghost Icon Buttons with 24px icons.


The page author supplies only product copy and action objects. A separate
title-row wrapper, direct Pattern action binding, mixed business-action modes,
or a page-owned window control is a scene mismatch and stops compilation.

```js
import { createTitlebarSegments, renderHtmlComponent } from '@text-to-ui/components-html';
const segments = createTitlebarSegments(resolvedPattern, {
  'primary-navigation': { slots: { logo: { src: './logo.svg', alt: '产品' }, label: '项目空间' } },
  'main-detail': { slots: { 'main-detail-actions': [
    { id: 'reply', label: '回复', icon: 'action/reply', buttonType: 'icon-text-ghost' }
  ] } }
});
for (const { region, ...options } of segments) {
  // Pass the markup to the corresponding existing Pattern title segment.
  titleSegmentContent[region] = renderHtmlComponent('titlebar', options);
}
```


HTML callers bind the existing `data-action` events; these are web-window requests, not browser permission to close or minimize the native application.

For generated `page-bindings.json`, put values on the binding's `slots`, not
both `options.slots` and `slots`. The generator forwards this content to the registered HTML implementation. Declare the semantic context for the segment
as usual; slots do not authorize moving the segment or using a handwritten
button. Preserve the main-detail action restrictions in source-resolution.md.

When individual Titlebar actions have separate Behavior Plan outcomes, map
their stable action ids with `actionBehaviors` on the same Titlebar binding:

```json
{
  "id": "detail-titlebar",
  "logicalName": "Titlebar/Default",
  "semanticContext": "main-detail-titlebar",
  "region": "main-detail",
  "slot": "main-detail-title",
  "options": { "layout": "three-column", "segmentRole": "main-detail" },
  "slots": {
    "main-detail-actions": [
      { "id": "reply", "label": "回复", "icon": "action/reply", "buttonType": "icon-text-ghost" }
    ]
  },
  "actionBehaviors": { "reply": "reply-message" }
}
```
