<!-- tui-scope {"contexts":["global-titlebar","main-detail-titlebar","titlebar-main-detail-actions"]} -->
### Right Action And Window Area

- Keep application-level actions before the window controls.
- Keep window controls pinned to the top-right.
- Preserve a draggable region between context/actions and window controls.
- Window controls are system chrome and must remain visually quieter than product actions.
- HTML demonstrations may simulate these controls, but must not claim to control the host browser window unless implemented.
- Use Ghost Button or Ghost Icon Button for ordinary Titlebar product operations. Keep the resting background transparent and reveal only the approved Hover, Pressed, or Focus state layer. Do not give these actions a persistent Secondary or filled background. Window controls are a separate system-control group.

<!-- /tui-scope -->
