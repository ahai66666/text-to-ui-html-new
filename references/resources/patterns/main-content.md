### Main Content

- Fills all remaining width.
- Uses 24px left/right, 16px top, and 0px bottom in the default content mode. Left and right are symmetric and measured from the inner divider/pane edge. The 0px bottom inset reflects that Main Content and Main Detail commonly extend beyond one viewport and scroll vertically.
- Edge-aligned mode is an explicit exception for editor canvases, data grids, media, maps, or file workspaces. Only the canvas/data surface reaches the pane edge; toolbars, form headers, empty states, and readable text remain inside a safe-area wrapper using 24px left/right, 16px top, and 0px bottom. Record this mode explicitly rather than choosing it during rendering.
- Scrolling belongs to the content region whenever the title layer and navigation must remain stable.

