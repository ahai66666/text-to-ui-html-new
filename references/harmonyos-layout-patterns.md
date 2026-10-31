# HarmonyOS Native Desktop Layout Patterns

Machine-readable authority: `assets/design-system/pattern-contracts.json`.
This document explains the visual and product rationale; when prose and a
renderer disagree, resolve the Pattern Contract and fix the renderer. Component
contracts own component internals only. They do not own pane geometry, surface,
divider, scroll, inset, resize, minimum-window, or page action-slot policy.

Use this reference when choosing the application shell. These patterns were distilled from user-supplied native HarmonyOS desktop screenshots of AppGallery, Music, Themes, Settings, File Manager, My Huawei, Weather, and Notepad.

## 1. Shared Window Anatomy

Most full desktop applications follow this structure:

```text
Application Window
├── Global Title Layer
│   ├── Brand Anchor: app icon + app name
│   ├── Context Area: page title, tabs, search, or page actions
│   └── Window Area: application actions + window controls
└── Workspace
    ├── Primary Navigation Shell
    │   ├── Global Primary Action Slot
    │   └── Sidebar Navigation
    ├── Secondary Pane (optional)
    ├── Main Content / Detail / Canvas
    └── Inspector Pane (optional)
```

The Global Title Layer is transparent and structural, never one separate solid bar. The Titlebar component adds no fill or bottom divider by default. Each shell segment supplies the same surface as the pane directly below it: the Brand segment matches Primary Navigation, the list segment matches Secondary Pane, and the final segment matches Main Content or Main Detail. In a two-column shell no segment has a bottom divider. In a three-column shell only the final Main Detail segment has a bottom divider; Primary Navigation and Secondary Pane remain divider-free. Keep vertical pane dividers continuous through both title and workspace rows.

## 2. Global Title Layer

### Left Brand Anchor

- Place application icon and application name at the top-left.
- Align the brand anchor with the Primary Navigation width and padding.
- Keep it visible when the navigation content scrolls.
- Product identity belongs here, not only inside page content.

### Primary Shell Global Primary Slot

- Place the page's only global Primary Button inside the Primary Navigation Shell, vertically between the Brand Anchor and Sidebar navigation. Every page-global action styled as Primary must use this slot.
- Use it for New Project, New Document, New Task, or the equivalent main CTA. Do not add a second page-global Primary Button elsewhere.
- Expanded mode uses a 40px-high icon + text Primary Button. The Primary Navigation owns a 16px horizontal inset and the action slot adds `--space-3` (8px) horizontal inner padding, placing the button on the same 24px content axis as the Brand Anchor / Logo. Its slot uses `--layout-primary-action-slot-gap-top` (8px) below the Brand Anchor / Titlebar and `--layout-primary-action-slot-gap-bottom` (12px) before the first Sidebar navigation component. Scope these values to the action slot only; they must not become whole-navigation padding or a generic menu/component gap. Collapsed 64px mode uses a 40px icon-only Primary Button with an accessible name and Tooltip, with a dedicated slot compensation that keeps the icon centered in the 64px rail.
- Secondary, Ghost, Icon, and other button variants may appear in Secondary Pane, Main Detail, Titlebar, or local toolbars according to their action scope. Do not move the page-global Primary CTA into those regions. Do not add horizontal dividers around the slot.

### Context Area

Depending on the application, the center area may contain:

- Current page title.
- Search field.
- Document or folder tabs.
- Navigation controls and address bar.
- View-level actions.

Do not require every titlebar to contain every element. Choose the composition from the current workflow.

### Right Action And Window Area

- Keep application-level actions before the window controls.
- Keep window controls pinned to the top-right.
- Preserve a draggable region between context/actions and window controls.
- Window controls are system chrome and must remain visually quieter than product actions.
- HTML demonstrations may simulate these controls, but must not claim to control the host browser window unless implemented.
- Use Ghost Button or Ghost Icon Button for ordinary Titlebar product operations. Keep the resting background transparent and reveal only the approved Hover, Pressed, or Focus state layer. Do not give these actions a persistent Secondary or filled background. Window controls are a separate system-control group.

### Final Pane Leading Slot

The last Workspace pane owns a leading slot in the Global Title Layer, aligned to the pane's left boundary:

- Pattern A / two-pane shell: use the slot for the Main Content title.
- Pattern B / three-pane shell: `main-detail-actions` is the default Titlebar slot for every action scoped to the complete Main Detail/Editor. It accepts 0..n `ghost` Buttons using only the `icon` and `icon-text-ghost` modes, such as save, share, expand, open separately, layout, and mode; do not put page-global creation there and do not repeat the list title.
- In Pattern A, the Main Content title begins 24px (`--layout-main-title-leading-padding` / `--space-6`) after its divider. In Pattern B, the first Main Detail operation begins 16px (`--layout-main-detail-action-leading-padding` / `--space-5`) after the Main Detail divider.
- Keep application-wide actions not owned by Main Detail and window controls at the far right. The leading slot is the required home for Main Detail pane-global actions, not a replacement for the application action/window area.

Terminology: the HTML implementation is the web runtime adapter. Reserve “native component” for an HTML built-in element or a verified Pixso Component/Instance.
The HTML `Titlebar` runtime adapter exposes this contract through two required structural properties: `layout="standalone|two-column|three-column"` and `segmentRole="global|primary-navigation|secondary-list|main-content|main-detail"`. Use `paneTitle` only for `two-column + final-pane`; use `mainDetailActions` only for `three-column + final-pane`. `mainDetailActions` accepts 0..n ordered action descriptors and may render only `icon` or `icon-text-ghost` Buttons, both using the `ghost` variant. Standalone/global Titlebar and every two-column segment have no bottom divider. In a three-column shell, only `final-pane` renders the Tokenized bottom divider; the branded Primary Navigation segment and Secondary Pane segment do not. The layout remains responsible for continuous vertical pane dividers.

## 3. Approved Shell Patterns

### Reusable Pattern: Primary Navigation Shell

`Primary Navigation Shell Pattern · 主导航壳模式` is a Pattern-layer composition, not a base component and not part of the component count. It combines the Global Title Layer's left Brand Anchor with the Primary Navigation below it.

- Brand Anchor, Global Primary Action Slot, and Primary Navigation share the same width, surface, and continuous vertical divider so they read as one navigation shell. The divider uses `--layout-navigation-divider-width` (0.5px) with `--color-border`; Primary Navigation uses `--space-4` (12px) bottom margin. Do not add horizontal dividers between these regions.
- Brand Anchor and Primary Navigation always use the gray `--color-sidebar-bg` surface and occupy the secondary visual hierarchy. Persistent navigation must not compete with the user's core content.
- Main Content provides two approved Surface variants: White (`--color-surface`) and Gray (`--color-bg-subtle`). White is the default; Gray is optional. Main Content remains the primary information layer in both variants.
- Brand Anchor contains the application icon and application name and remains fixed above independently scrolling navigation content.
- The Global Primary Action Slot sits directly below Brand Anchor and above Sidebar navigation. It exclusively owns the page-global Primary CTA and uses `--space-3` (8px) horizontal inner padding. Expanded and collapsed button behavior follows the Primary Shell Global Primary Slot rules above.
- Expanded Primary Navigation is 240px wide and places a 40px collapse button at the Brand Anchor's right edge. Collapsing changes the navigation column to `--layout-sidebar-width-collapsed` (64px), hides the Logo, application name, and route labels, and preserves selection. The collapsed Brand Anchor shows a 40px expand button at the former Logo position.
- In the two-level variant, second-level navigation contains one or more independent collapsible menu groups. Each group heading toggles its own route list, preserves selection while collapsed, exposes `aria-expanded` and `aria-controls`, and uses `subtitle-s` (14px / 20px / Medium 500) with `--color-text-muted`. The heading-to-route-list gap uses `--space-1` (2px); adjacent independent groups use the parent-owned `--space-5` (16px) gap. Reuse one 16px Chevron for both states and animate it through a 180-degree rotation rather than swapping assets.
- Primary Navigation contains navigation groups/items and an optional footer region.
- Single-level navigation uses the Sidebar component directly for the only route hierarchy.
- Two-level navigation places the first-level, high-level functional-space entries as icon-only controls at the bottom-left of the navigation region. Bottom alignment is mandatory in every state: the complete first-level group is anchored to the navigation region's bottom edge and must never follow the second-level menu at the top or middle. This is the only approved first-level menu in the client system. Its icons use the same pinned Lucide Regular semantic-alias rule as ordinary navigation and component actions; HarmonyOS Filled icons are prohibited. Unselected icons use the tertiary icon color through `--color-primary-level-unselected` → `--color-icon-subtle` (`--color-neutral-dark-40`); Selected uses the brand foreground on a transparent background. Hover may add the Sidebar accent background but must not change the current icon color. In expanded mode, the bottom-anchored icon group fills the Sidebar content width, uses `--size-11` (40px) height, and distributes all controls evenly on the horizontal axis. When the entire navigation is collapsed to 64px, keep every first-level entry visible and stack the 40×40 icon-only controls vertically from the bottom upward; do not hide unselected entries. The second-level routes continue to use the Sidebar component above them.
- First-level icon selection changes the high-level functional space and therefore the available second-level Sidebar context. First-level and second-level selections remain visually independent.
- Default width is `--layout-sidebar-width` (240px); wide mode uses `--layout-sidebar-width-wide` (360px).
- Brand Anchor uses `--padding-titlebar-leading` (24px). Expanded Navigation content uses `--layout-sidebar-padding-x` and `--layout-sidebar-padding-y`, both referencing `--space-5` (16px). The 64px collapsed state keeps 16px vertical padding and uses `--space-4` (12px) horizontal padding so a 40px icon control fits exactly.
- Compose this Pattern into Pattern A, B, or C. Do not recreate its Brand Anchor and navigation relationship separately on each page.
- In the component-gallery documentation preview, keep the Brand Anchor, Global Primary Action Slot, navigation levels, selection, and collapse behavior as real UI because they are the subject of this Pattern. Render the adjacent Main Content title and body as neutral, static skeleton context without product copy, values, avatars, badges, or other business details. Keep window controls visible as shell structure. This presentation rule belongs to the Pattern preview; it does not require generated product pages to replace Main Content with loading skeletons.

### Pattern A: Two-Pane Navigation + Content

Observed in AppGallery, Music, Themes, Settings, My Huawei, and Weather.

```text
┌──────────────┬──────────────────────────────────────┐
│ Brand        │ Main title ........ actions / win   │
│ New          │                                      │
│ Primary Nav  │ Main Content                         │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

Use for browsing, dashboards, settings categories, stores, media applications, and content hubs.

### Reusable Pattern: Secondary Page Hierarchy

`Secondary Page Pattern · 二级页面模式` has two approved forms. It is a Pattern-layer composition and is not part of the component count.

#### Form A: Continue the primary-page layout

- Keep the application window, Global Title Layer boundaries, Primary Navigation Shell, current high-level navigation selection, and pane dimensions stable. Replace only the owning right/Main pane content.
- Use it when a parent page opens a full-page detail, settings branch, member/project detail, or focused subtask that belongs to the same application context.
- The final-pane leading slot changes to `40px Ghost Back Icon Button + Title_S`. The Back button sits immediately to the left of the secondary-page title (for example, `项目设置`), and the group begins at the normal 24px Main Content axis. Use the approved `arrow_left` semantic icon and an accessible label naming the destination.
- The parent route remains selected in Primary Navigation. Do not add the temporary secondary-page title as another Sidebar route and do not flatten page depth into breadcrumbs unless the depth exceeds one level or the product already requires breadcrumbs.
- Keep Main Content body insets at 24px left/right, 16px top, and 0px bottom. A secondary page does not introduce a second nested page-padding wrapper.
- Back restores the parent page state, selection, filters, scroll position, and focus to the control that opened the secondary page. Back, browser/history navigation, or an equivalent platform command must not silently discard unsaved work.
- In the component gallery, show Form A at the secondary-page depth by default so the Back button and its title-left placement are directly inspectable; keep the return-to-parent interaction available for verification.

#### Form B: Open a new page

- Use when the secondary task should open as its own page rather than inherit the parent shell.
- A button or other page action may pop up this form. “Pop-up” describes how the user opens the page; it does not turn the page into a Dialog. Mount `Secondary Page Runtime` with `layout: "new-page"` in a viewport-level page host, keeping the parent page mounted underneath so Back/close can restore its exact state.
- Compose vertically: `Titlebar S` (`--height-titlebar-sm`, 40px) is the topmost region; content begins below it and is designed according to the task. Do not retain the original page's Primary Navigation or multi-pane geometry.
- The new page uses the standard content safe area: 24px left/right, 16px top, and 0px bottom. Its Titlebar is transparent and matches the white page surface below.
- Local save, confirm, or editing actions belong in the content heading or local action area. Window controls remain at the Titlebar's trailing edge.

- Hide a parent-specific Global Primary action while either secondary-page form is active. Keep it only when the action is genuinely application-global and remains valid at both depths.
- Do not model a Secondary Page opened by a button as Dialog or Semi-modal merely because it appears on top of the parent. Use Dialog/Semi-modal only when the background context must remain visible or the task is transient.
- In the component-gallery preview, keep Primary Navigation as quiet skeleton context for Form A and make the parent-to-secondary transition interactive. The preview must verify Back, `Escape` recovery, focus restoration, stable shell geometry, and the independently selectable Form B.

### Pattern B: Three-Pane Navigation + List + Detail

Observed in Notepad and applicable to mail, contacts, tasks, file lists, and management tools.

```text
┌──────────────┬─────────────────┬────────────────────┐
│ Brand        │ Search          │ Detail ops .... win │
│ New          │                 │                     │
│ Primary Nav  │ List context    │ Detail / Editor    │
│              │ Secondary List  │                    │
│              │                 │                    │
└──────────────┴─────────────────┴────────────────────┘
```

- Primary Navigation defines the high-level information space.
- Secondary Pane shows items, records, folders, conversations, or documents. Its scrolling content wrapper places both the standalone Search frame and the List Card state envelope 16px from each pane edge through `--layout-secondary-list-card-inset-x`. The title, toolbar/meta copy, list states, and List Card content align to the nested 24px `--layout-secondary-content-axis-x`.
- Main Detail remains the largest flexible region. Its default scrolling content wrapper owns 24px left/right, 16px top, and 0px bottom through the directional Main Detail padding tokens.
- Selection in the Secondary Pane updates Main Detail without replacing the entire shell.
- Compose the Secondary List Pane in this order: standalone Search in the transparent Titlebar segment, one scrolling inset owner, List title + action row, optional meta row, then the List collection. Search occupies the complete Secondary Pane Titlebar row at the 16px surface axis; never place the title or an adjacent action button in that row. The first content row is 40px high through `--height-list-heading`, uses `title-s` on the left, and places the related Ghost operation group on the right. Count or auxiliary context moves to the optional meta row rather than taking the title action position. Empty, loading, and error states replace the collection but remain inside the same scrolling inset owner.
- The Renderer-owned scrolling inset owner applies 16px horizontally, 8px at the top, and 0px at the bottom. Each List Card state background fills the available width inside that 16px surface inset. Each row then applies `--layout-secondary-list-card-padding-x` (8px), so row content lands at 24px. The title/action row, meta row, and list states use the same nested 8px alignment inset; Search in the Titlebar uses the 16px surface axis.
- The List collection is page-owned content inside the Renderer body, not a new Pattern or an automatic `List Item` mapping. Give every card a stable content-slot ID and explicit sub-slots such as `leading`, `content`, `title`, and `description`; card types may vary by business object while preserving the same pane envelope and row axes.
- Apply the vertical-axis alignment principle by edge type: standalone Search and List Card state backgrounds share the 16px surface axis; title, toolbar/meta copy, empty/loading/error content, and List Card content share the 24px content axis. Selected, Hover, and Pressed must not resize either axis.
- The top-left of Main Detail is its pane-global operation slot aligned with the Main Detail boundary. Put operations affecting the complete current detail/editor workspace there, but keep page-global creation in the Primary Navigation Shell. Keep card-, field-, section-, selection-, and inline-scoped actions next to their targets. Do not repeat the list or page title there.
- In the component-gallery documentation preview for this List-focused Pattern, keep the Secondary List Pane realistic and interactive while rendering Primary Navigation and Main Detail as quiet neutral skeleton context. Preserve their true widths, surfaces, insets, and dividers. This focus treatment is documentation-only; generated product screens render real content in every required pane.

### Pattern C: Navigation + Tool Workspace

Observed in File Manager.

```text
┌──────────────┬──────────────────────────────────────┐
│ Brand        │ Tabs / window controls               │
├──────────────┼──────────────────────────────────────┤
│ Primary Nav  │ Address / search                     │
│              ├──────────────────────────────────────┤
│              │ Toolbar                              │
│              ├──────────────────────────────────────┤
│              │ Data view / canvas                   │
└──────────────┴──────────────────────────────────────┘
```

Use for file management, editors, IDE-like tools, asset management, and applications with frequent commands.

### Pattern D: Optional Inspector

For more complex creation and management workflows, add a right-side Inspector to Pattern B or C.

```text
Primary Nav | Secondary Pane | Main Canvas | Inspector
```

- Inspector is contextual, not permanent empty space.
- It may collapse when not needed.
- Main Canvas remains the primary flexible region.
- Do not introduce an Inspector for simple browsing pages.

## 4. Pane Behavior

### Primary Navigation

- Default for full applications unless the workflow clearly does not need persistent navigation.
- Uses a distinct, quiet surface separated by a subtle divider or material boundary.
- Supports grouped navigation and scrolling while keeping the Brand Anchor stable.
- Selected item uses the approved sidebar selected tokens.
- Place an optional page-global create action between Brand Anchor and Sidebar navigation. Keep it outside the scrolling route list when navigation scrolls.

### Secondary Pane

- Appears only when users repeatedly select an item before viewing or editing detail.
- Usually fixed or bounded width.
- Has its own title, search, filter, sort, and view controls when needed. Page-global creation does not belong here.
- Uses a divider between itself and Main Detail.
- In Pattern B, applies 16px left/right, 8px top, and 0px bottom padding exactly once on its direct scrolling wrapper. Do not add `--padding-list` around a List already hosted inside this inset; rows fill the available inset width and keep only their component-owned internal padding.

### Main Content

- Fills all remaining width.
- Uses 24px left/right, 16px top, and 0px bottom in the default content mode. Left and right are symmetric and measured from the inner divider/pane edge. The 0px bottom inset reflects that Main Content and Main Detail commonly extend beyond one viewport and scroll vertically.
- Edge-aligned mode is an explicit exception for editor canvases, data grids, media, maps, or file workspaces. Only the canvas/data surface reaches the pane edge; toolbars, form headers, empty states, and readable text remain inside a safe-area wrapper using 24px left/right, 16px top, and 0px bottom. Record this mode explicitly rather than choosing it during rendering.
- Scrolling belongs to the content region whenever the title layer and navigation must remain stable.

### Inspector

- Fixed or bounded width.
- Context follows the current selection.
- Collapsible when Main Content needs more room.

## 5. Surface And Divider Behavior

- Navigation commonly uses a light gray, translucent, blurred, or image-derived surface.
- Main Content may use light gray for card-based settings, white for productivity canvases, or immersive imagery for media/weather experiences.
- Pane boundaries are quiet and structural; use subtle dividers rather than decorative card containers.
- A draggable pane boundary, if the selected Pattern supports one, has the same single `--layout-navigation-divider-width` (0.5px) stroke and `--color-border` as a fixed divider. Enlarge only its transparent hit area; do not enlarge or duplicate the visible stroke.
- Keep the Titlebar component transparent. Let each title segment inherit or be hosted by the same surface token as its pane below.
- Do not add a horizontal divider below the Primary Navigation or Secondary Pane title segment. Add a Main Detail header divider only when an internal Toolbar, Tabs, or data-header component owns that divider.
- Large content groups may use cards, but application shell regions are not cards.
- Rounded rectangles are concentrated inside content and controls, not around the whole page shell.

## 6. Scrolling

- Primary Navigation, Secondary Pane, Main Content, and Inspector may scroll independently.
- Global Title Layer and window controls remain fixed.
- Avoid one document-level scrollbar when it would move app chrome out of view.
- Hide or quiet inactive scrollbars where platform behavior supports it, while preserving discoverability.

## 7. System UI Boundary

The bottom taskbar/dock, system tray, clock, launcher, and desktop search belong to HarmonyOS itself. They are outside the application window and must not be reproduced inside generated application HTML unless the user explicitly requests a full desktop/system mockup.

## 8. Shell Selection Rule

```text
Simple browsing/settings/content hub -> Pattern A
Repeated list-to-detail workflow -> Pattern B
Command-heavy file/editor workspace -> Pattern C
Contextual properties needed -> add Pattern D Inspector
```

Choose the simplest shell that supports the primary workflow. Do not add panes merely to make the application look complex.
