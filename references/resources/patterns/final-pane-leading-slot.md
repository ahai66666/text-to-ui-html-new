<!-- tui-scope {"contexts":["global-titlebar","main-detail-titlebar","titlebar-main-detail-actions"]} -->
### Final Pane Leading Slot

The last Workspace pane owns a leading slot in the Global Title Layer, aligned to the pane's left boundary:

- Pattern A / two-pane shell: use the slot for the Main Content title.
- Pattern B / three-pane shell: `main-detail-actions` is the default Titlebar slot for every action scoped to the complete Main Detail/Editor. It accepts 0..n `ghost` Buttons using only the `icon` and `icon-text-ghost` modes, such as save, share, expand, open separately, layout, and mode; do not put page-global creation there and do not repeat the list title.
- In Pattern A, the Main Content title begins 24px (`--layout-main-title-leading-padding` / `--space-6`) after its divider. In Pattern B, the first Main Detail operation begins 16px (`--layout-main-detail-action-leading-padding` / `--space-5`) after the Main Detail divider.
- Keep application-wide actions not owned by Main Detail and window controls at the far right. The leading slot is the required home for Main Detail pane-global actions, not a replacement for the application action/window area.

Terminology: the HTML implementation is the web runtime adapter. Reserve “native component” for an HTML built-in element or a verified Pixso Component/Instance.
The HTML `Titlebar` runtime adapter exposes this contract through two required structural properties: `layout="standalone|two-column|three-column"` and `segmentRole="global|primary-navigation|secondary-list|main-content|main-detail"`. Use `paneTitle` only for `two-column + final-pane`; use `mainDetailActions` only for `three-column + final-pane`. `mainDetailActions` accepts 0..n ordered action descriptors and may render only `icon` or `icon-text-ghost` Buttons, both using the `ghost` variant. Standalone/global Titlebar and every two-column segment have no bottom divider. In a three-column shell, only `final-pane` renders the Tokenized bottom divider; the branded Primary Navigation segment and Secondary Pane segment do not. The layout remains responsible for continuous vertical pane dividers.

<!-- /tui-scope -->
