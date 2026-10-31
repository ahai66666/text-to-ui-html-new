## Pattern-owned navigation shells

When a Pattern Context Packet selects `patternMode.navigation: "two-level"`,
the model must not author `composition.regions.primary-navigation`. Instead it
must provide `patternShell.navigation` with `mode: "two-level"` and these
slot-owned trees:

- `global-title-layer` and `global-primary-action`: top area;
- `secondary-navigation-content`: the middle, independently scrollable second
  level navigation;
- `primary-navigation-bottom`: icon-only first-level navigation, pinned to the
  bottom edge.

The renderer owns slot order and layout. A `primary-navigation-shell` binding
must use `primary-navigation-bottom`; a `secondary-navigation` binding must
use `secondary-navigation-content`. The generator rejects any other placement
before it writes a page artifact.
When multiple first-level items share a behavior group in
`primary-navigation-bottom`, use `tag: "nav"` and include
`tui-primary-navigation-items` in its `className`. Do not define a vertical
layout for this group in page CSS; the registered container and Pattern
Runtime own the horizontal distribution.

`global-primary-action` owns the primary action's only horizontal inset. Its
`navigation-top` wrapper is structural and carries no additional padding, even
though it retains legacy `data-pattern-shell-slot` metadata. Do not wrap the
action in a second padded container; a full-width primary action must have the
same width in the Pattern Runtime Renderer and in generated page output.

Static `pattern-shell.css` is retained only for legacy static Pattern markup.
It is scoped below a non-Runtime Pattern root and must not style a
`.tui-pattern-runtime` subtree. Runtime panes, slots, and scroll bodies own
their `border-box` model explicitly, so generated pages cannot depend on a
host application's global CSS reset for their geometry.

