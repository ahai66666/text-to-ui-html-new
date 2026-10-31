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

