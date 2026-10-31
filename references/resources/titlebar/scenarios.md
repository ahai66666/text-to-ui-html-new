## Scenarios

<!-- tui-scope {"patterns":["pattern-a-two-pane"]} -->
- Two panes: brand segment → content-title + window-control segment.
<!-- /tui-scope -->
<!-- tui-scope {"contexts":["global-titlebar","secondary-list-search"],"patterns":["pattern-b-three-pane"]} -->
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
<!-- /tui-scope -->
<!-- tui-scope {"contexts":["global-titlebar"],"patterns":["standalone"]} -->
- `Titlebar_S` (`size: "small"`, 40px) is standalone-only. It may be used as
  one complete titlebar (including a standalone final-pane title), but it must
  not be split into two-column or three-column Pattern segments. Use M/L/XL for
  pane-aligned title segments.
<!-- /tui-scope -->
- `segmentRole` uses `primary-navigation`, `secondary-list`, `main-content`,
  or `main-detail`. paneRole is removed and rejected.
- Other Pattern segment sequences may use `createTitlebarSegments` with the
  resolved `pattern.titleLayer.segments`; it returns configurations only and
  does not render a competing layout.

