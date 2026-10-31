### Stroke ownership

The Pattern renderer owns the structural divider edges. It reads each region's
`dividerEdges` and paints only those edges with the canonical
`--layout-navigation-divider-width` Token (`0.5px`) and `--color-border`.
The same visual rule applies when a pane boundary becomes draggable: keep one
visible 0.5px stroke on the boundary, and place a wider transparent hit target
over it for pointer and keyboard interaction. Dragging must not change the
stroke width or create a second divider. The Pattern Runtime owns both the
separator and hit target; a page must not draw or position its own resizer.
Page-owned groups inherit the pane surface and inset; they must not add a
rectangle border, outline, or shadow around a Pattern root, pane, title layer,
Titlebar, or slot wrapper. This prevents a divider from becoming a visibly
thick double outline. Use a registered component when a business control or
card needs its own border; do not reproduce its frame in page CSS.

`outline` is valid only for a `:focus-visible` interaction state owned by the
component and must use the focus-ring Token. A persistent outline, a `1px` or
`2px` page-owned shell stroke, or a page CSS rule that replaces a declared
divider fails the pre-generation boundary check.

Business-page `Sidebar Item/Default` bindings must also provide explicit
`options.items` or `options.groups`. The HTML adapter's labels/counts are
gallery-only specimen defaults; they are intentionally rejected for a page so
demo data cannot leak into product navigation.

For Pattern B the renderer also owns the 64px title segments and pane scroll
bodies. Search binds explicitly to `secondary-list-title`; Runtime gives it
one `space/5` inline inset, full available width, and vertical centering. The
detail segment binds exactly one final `Titlebar/Default` to
`main-detail-title`; its business actions are nested in the Titlebar's
`main-detail-actions` component slot, followed by the component-owned window
controls. Separate page-level action buttons in the Pattern title slot are
invalid. Business groups render inside the scroll bodies with the Pattern's
insets. Do not add a second toolbar, search header, pane padding, or nested pane
scroll to compensate for the shell. Compose content at the supplied 360px list
width.

When `patternMode.navigation` is `"two-level"`, the navigation shell's
`global-title-layer` is intentionally stricter than a normal composition slot:
it is a flat array containing one direct `Titlebar/Default` for the
primary-navigation segment. A page `header`, brand wrapper, collapse button, or
any sibling component in that slot is invalid and is rejected before output.
The renderer owns the segment surface, so page CSS must not paint a second
background on the Titlebar. In the secondary-list title segment, Search is the
only allowed component; put scope/filter/list actions below it or inside their
declared component slot.
