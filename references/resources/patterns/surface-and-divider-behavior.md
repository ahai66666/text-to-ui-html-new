## 5. Surface And Divider Behavior

- Navigation commonly uses a light gray, translucent, blurred, or image-derived surface.
- Main Content may use light gray for card-based settings, white for productivity canvases, or immersive imagery for media/weather experiences.
- Pane boundaries are quiet and structural; use subtle dividers rather than decorative card containers.
- A draggable pane boundary, if the selected Pattern supports one, has the same single `--layout-navigation-divider-width` (0.5px) stroke and `--color-border` as a fixed divider. Enlarge only its transparent hit area; do not enlarge or duplicate the visible stroke.
- Keep the Titlebar component transparent. Let each title segment inherit or be hosted by the same surface token as its pane below.
- Do not add a horizontal divider below the Primary Navigation or Secondary Pane title segment. Add a Main Detail header divider only when an internal Toolbar, Tabs, or data-header component owns that divider.
- Large content groups may use cards, but application shell regions are not cards.
- Rounded rectangles are concentrated inside content and controls, not around the whole page shell.

