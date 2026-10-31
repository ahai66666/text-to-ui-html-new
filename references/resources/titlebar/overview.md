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

