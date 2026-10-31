本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.4 Tabs, Navigation, and Lists

### Classes

```text
.nav
.nav-item
.nav-item-active
.sidebar
.topbar
.breadcrumb
.accordion
.accordion-trigger
.accordion-chevron
.accordion-panel
.tabs
.tabs-list
.tab
.tab-panel
.tabs-filled
.tabs-line
.tabs-vertical
.tab-icon
.list-context-demo.on-white
.list-context-demo.on-gray
.list-card
.list-item
```

### Rules

Breadcrumb separators between every hierarchy level use the secondary icon color `--color-icon-muted` (`--color-neutral-dark-60`). Separator color does not inherit from the adjacent link or current-page text.

Accordion triggers use `body-l` (16px / 22px / Regular 400). The label and chevron both use secondary text color `--color-text-muted`; the icon inherits the trigger color. The default trigger is a transparent Ghost row with no outer border, uses 8px horizontal padding, 8px button radius, and fills its available frame. Put one 20px SVG `navigation/chevron-right` before the title with an 8px token gap; collapsed points right and expanded rotates 90 degrees to point down. Keep the label/icon order, SVG geometry, and fixed icon box unchanged across states.

When multiple Accordion instances are composed in one region, the parent wrapper
uses the canonical `tui-disclosure-group` class and owns a `--space-5` (16px)
gap between Accordion instances. The individual Accordion keeps its own
trigger-to-panel spacing; do not add per-instance margins.

Collapsible triggers vertically center the label and one fixed 20px SVG `navigation/chevron-down` on the right. The label and chevron both use secondary text color `--color-text-muted`; the icon inherits the trigger color. The trigger fills its available frame, uses 8px horizontal padding and 8px button radius, keeps the label on the left and the icon on the right, and has no outer border on the default transparent Ghost surface. The label and icon positions never change when content opens. Collapsed rotates the same icon 180 degrees to point up; expanded leaves it pointing down. Do not use a text character as the disclosure icon.

Independent Collapsible navigation groups are separated by a parent-owned
`--space-5` (16px) gap. The gap from each group heading to its own route list
remains `--space-1` (2px); these are separate spacing responsibilities.

Accordion and Collapsible trigger labels are single-line content. When a label is too long for the available width, keep the fixed chevron and hit area in place and truncate the label with an ellipsis (`text-overflow: ellipsis`); do not wrap the trigger or increase its height. Put the complete explanation in the expanded content region instead.

Tabs switch between peer panels inside one page. Use them for content views at the same hierarchy level; do not use Tabs for primary application navigation, sequential steps, filters that do not replace a panel, or independent toggle actions.

Composition is `Tabs → TabsList → Tab Trigger + TabPanel`. The root owns value, orientation, and activation mode. Every `TabsList` uses `role="tablist"` and an accessible label. Every trigger uses `role="tab"`, `aria-selected`, `aria-controls`, and roving `tabindex`; every panel uses `role="tabpanel"` and `aria-labelledby`. The active panel remains the only displayed panel.

Approved variants:

- **Filled:** the default compact desktop variant. The list is 36px high with `--padding-segmented-control`, `--gap-tabs-list`, and `--radius-tab`. Selected uses a white surface and subtle elevation.
- **Line:** for wider content headers and dense tool views. Triggers are 40px high with `--padding-tab-x`; Selected uses brand text plus a 2px bottom indicator. The list has a bottom divider and no filled container.
- **Vertical:** for settings/property groups when labels are longer or there are 4–8 stable categories. Triggers are 40px high, left aligned, and at least 160px wide. The panel occupies the remaining width. Do not use vertical Tabs as a substitute for the application sidebar.
- **Icon + Text:** allowed in Filled or Line variants. Use 16px SVG icons bound to `--icon-size-sm`; do not use font glyphs because their baselines create inconsistent optical alignment. The trigger centers the fixed icon box and the text line box independently on the vertical axis. Icons must accompany visible text. Icon-only Tabs are not approved for ordinary product navigation.

Tab trigger text uses `body-m` (14px / 20px / Regular 400) in every state. Default text uses `--color-tab-text`; Hover uses `--color-tab-hover-bg`; Selected uses `--color-tab-selected-text` and the variant-specific indicator without increasing font weight. Focus uses the standard external focus ring. Disabled applies `--state-disabled-opacity` (40%) once to the complete trigger and cannot receive selection.

Horizontal Tabs use Left/Right; Vertical Tabs use Up/Down. Home and End move to the first and last enabled trigger. Automatic activation is the default when panels render immediately. Use manual activation only when panel changes are expensive or asynchronous; in manual mode arrow keys move focus, while Enter or Space activates. Navigation loops and skips disabled triggers.

When labels overflow, preserve every trigger's readable label and use horizontal scrolling with scroll affordance. Do not shrink text, wrap labels, or introduce a “More” menu that hides the currently selected Tab. Changing Tabs must preserve user-entered state when the workflow expects return navigation.

List collection surfaces adapt to the canvas context:

- **White canvas:** the List collection has no visible container fill. Keep `.list-card` transparent so rows sit directly on the white canvas.
- **Gray/subtle canvas:** the List collection uses `--color-surface` (white) as its container fill, with `--radius-list` (`--radius-4`, 12px) and `--padding-list-card`.
- In both canvas contexts, `.list-card` owns the vertical spacing between every adjacent `.list-item` through `--gap-list-item`, which references `--space-1` (2px). Do not add item margins or collapse the gap in Selected, Hover, or Disabled states.
- Every `.list-item` uses `--radius-list-item`, which references `--radius-3` (8px), independent of the List container radius.

Do not use a gray List container on a white canvas. Row Hover uses `--state-layer-hover`; Selected uses `--color-sidebar-selected` and `--color-sidebar-selected-text`. The surrounding page or preview owns any documentation border; it is not part of the white-canvas List component.

List primary labels use `body-l`; timestamps, summaries, and secondary copy use `body-m`. Do not use `caption-m` for visible list metadata.

List Item trailing text and chevrons use the secondary text color `--color-text-muted`; unselected leading and trailing icons use the secondary icon color `--color-icon-muted`. Semantic notification dots keep their status color and are not recolored as neutral icons. A multi-item group draws a `--layout-navigation-divider-width` (0.5px) divider in `--color-neutral-dark-20` (the `neutral-dark.20` token) only before each subsequent item, inset by `--space-3` (8px) on both sides so the line aligns with the row content; a single item and the final item have no divider.

### List Item row contract

- List Item content rows use `--height-list-item-single-line` (48px), `--height-list-item-double-line` (56px), and `--height-list-item-triple-line` (80px). Do not stretch a one-line row merely because the List container is taller.
- Every row uses horizontal padding `--space-3` (8px). The leading icon box is `--icon-size-lg` (24px), and the icon-to-content gap is `--gap-menu-item-content` (8px).
- Approved trailing slots are: text plus right chevron, icon, radio, checkbox, switch, and notification dot plus right chevron. The leading 24px icon remains present unless a named variant explicitly omits it.
- A multi-row List Item group places a divider only before each subsequent child. The last child and a single Item have no bottom divider.

