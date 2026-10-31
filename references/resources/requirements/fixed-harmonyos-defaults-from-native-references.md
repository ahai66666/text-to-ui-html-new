## 7. Fixed HarmonyOS Defaults From Native References

Unless the current workflow requires otherwise:

- Use a `1728 × 1152px` HarmonyOS PC desktop canvas for HTML reference viewports, screenshots, and final comparison. If another desktop size is approved, record it in the requirement contract and use it consistently across the HTML runtime and every QA checkpoint.
- Start with a persistent left navigation and a flexible Main region for a full application.
- Use the two-pane shell for browsing, dashboards, settings, stores, media, and content hubs.
- Add a fixed `360px` Secondary Pane for repeated list-to-detail workflows.
- Apply 16px on all four sides of the Secondary Pane scrolling content wrapper; do not add a second outer List inset.
- Let the right Main/Detail/Editor region fill all remaining width.
- Default Main Content and Main Detail to 24px left/right, 16px top, and 0px bottom on their direct scrolling wrapper. Use `edge-aligned` only when the requirement contract explicitly names a canvas, grid, media, map, or file surface that must reach the pane boundary; keep readable content inside the same directional safe area.
- Use the tool-workspace shell when tabs, address/search, command toolbar, and canvas/data view are central to the task.
- Add a separate Inspector only when contextual properties are necessary; do not add it as decoration.
- Use a `64px` non-dialog Global Title Layer.
- Keep the Titlebar component transparent and match each shell segment to the surface of the pane below it. Do not add a horizontal divider below the Primary Navigation or Secondary Pane title segment.
- Put app icon and product name in the top-left Brand Anchor.
- Put every page-global Primary action in the Primary Navigation Shell between Brand Anchor and Sidebar navigation. Use one 40px-high icon + text Primary Button. The Primary Navigation owns a 16px horizontal inset and the action slot adds `--space-3` (8px) horizontal inner padding, aligning the button with the Brand Anchor / Logo's 24px content axis. Keep 8px from Brand Anchor / Titlebar to the button and 12px from the button to the first Sidebar navigation component, using the dedicated action-slot tokens rather than changing whole-navigation or menu gaps. Do not add another page-global Primary elsewhere. In collapsed navigation, keep it as a 40px icon-only Primary Button with an accessible name and Tooltip, and preserve the dedicated compensation that centers it in the 64px rail. Place Secondary, Ghost, Icon, and local buttons elsewhere according to scope.
- Put page title, search, tabs, or view actions in the title context area as the workflow requires.
- Pin application actions and window controls to the top-right, preserving a draggable region.
- Allow Primary Navigation, Secondary Pane, Main Content, and Inspector to scroll independently when needed.
- Keep the system taskbar, launcher, tray, clock, and desktop search outside the application output.
- Treat immersive image, weather, media, and promotional backgrounds as product-specific visual directions, not universal shell defaults.

These defaults come from the bundled native screenshot references. Use `harmonyos-layout-patterns.md` for pattern selection and inspect relevant screenshots only when additional evidence is needed.

