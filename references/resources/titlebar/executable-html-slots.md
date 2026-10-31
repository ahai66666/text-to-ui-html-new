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

<!-- tui-scope {"patterns":["pattern-b-three-pane"]} -->
In a generated Pattern B HTML page, the compiler composes the primary,
secondary, and final values into one pane-aligned Global Title Layer. The
detail action group is then activated with `bindTitlebarOverflow`; do not leave
the detail Titlebar in a pane-local header or add a second hand-written action
row, because that produces an apparent fourth column and allows actions to
paint over the fixed window controls.

<!-- /tui-scope -->
<!-- tui-scope {"contexts":["global-titlebar","primary-navigation-titlebar"]} -->
The same rule applies to the primary-navigation segment: in a two-level shell
`global-title-layer` must contain exactly one direct `Titlebar/Default` binding
with `layout: "three-column"` and `segmentRole: "primary-navigation"`. Do not wrap
it in a page `header`, put a collapse button beside it, or add a second
background layer. The navigation shell supplies the subtle surface; the
Titlebar component itself remains transparent through
`--color-titlebar-normal-bg`. A collapse affordance, if the selected Pattern
contract exposes one, must be a declared Titlebar/component slot rather than a
page-owned sibling.

<!-- /tui-scope -->
<!-- tui-scope {"contexts":["global-titlebar","secondary-list-search"],"patterns":["pattern-b-three-pane"]} -->
For Pattern B the `secondary-list-title` segment is Search-only (at most one
registered Search component), and Search must explicitly bind that Pattern
slot. Scope, filter, refresh, and selection controls belong in the list body or
a registered component-owned action slot. The shell uses one 64px row with
`align-items: center`, applies the middle `space/5` inline inset once, and lets
Search fill the remaining width. Page CSS must not add top/bottom alignment or
another title-row padding. The standalone Titlebar gallery uses the same
`secondary-pane-content` contract so the component preview and Pattern Runtime
cannot drift apart.

<!-- /tui-scope -->
<!-- tui-scope {"contexts":["global-titlebar","main-detail-titlebar","titlebar-main-detail-actions"],"patterns":["pattern-b-three-pane"]} -->
The right segment must be exactly one `Titlebar/Default` binding in
`main-detail-title`, with `semanticContext: "main-detail-titlebar"`,
`layout: "three-column"`, and `segmentRole: "main-detail"`. Put business
actions in that binding's `slots["main-detail-actions"]`; never bind sibling
Button components directly to the Pattern `main-detail-actions` slot. The
Titlebar then owns action normalization, responsive collapse-to-More, and the
fixed trailing 3×40px window-control group. Every window control is a
registered `Icon Button/Ghost/Default` with a 24×24 icon.

<!-- /tui-scope -->
