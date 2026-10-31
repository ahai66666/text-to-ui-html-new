本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.3 Spacing

Current scope: HarmonyOS PC desktop application. Define spacing independently from component width and height.

### Spacing Foundation

```text
Base spacing unit: 2px
Scale type: compact hybrid scale
Minimum spacing increment: 2px
Default interface density: compact
Compact density required: yes
Negative spacing allowed: no
Arbitrary spacing values allowed: no
```

Rules:

- Use whole-pixel spacing values.
- Reserve `0.5px` for borders or dividers, not layout spacing.
- Pixso Auto Layout gaps and padding must use the same scale as CSS and Tailwind.
- Use primitive spacing tokens to build semantic spacing roles; components should prefer semantic roles.

### Primitive Spacing Scale

The token index is an ordered scale name, not a multiplier. Use the exact values below.

| Token | Value | Typical use |
|---|---:|---|
| `--space-0` | `0px` | No spacing |
| `--space-1` | `2px` | Minimum item separation and compact container inset |
| `--space-2` | `4px` | Icon-label gap and compact menu/card inset |
| `--space-3` | `8px` | Default control, field, and inline-content gap |
| `--space-4` | `12px` | Brand lockup gap and common control horizontal padding |
| `--space-5` | `16px` | Cross-group gap and standard component padding |
| `--space-6` | `24px` | Module gap and dialog padding |
| `--space-7` | `32px` | Major page-section gap |

CSS template:

```css
--space-0: 0px;
--space-1: 2px;
--space-2: 4px;
--space-3: 8px;
--space-4: 12px;
--space-5: 16px;
--space-6: 24px;
--space-7: 32px;
```

### Semantic Gap Tokens

Gap is owned by the parent Pixso Auto Layout, CSS Flex, or Grid container. Child components should not recreate the same relationship with margins.

| Token | Reference | Value | Usage |
|---|---|---:|---|
| `--gap-list-item` | `--space-1` | 2px | List 集合内相邻子项的纵向间距 |
| `--gap-selection-option` | `--space-1` | 2px | 单选块中相邻选项或按钮 |
| `--gap-tabs-list` | `--space-1` | 2px | Filled Tabs 相邻触发项 |
| `--gap-menu-item` | `--space-1` | 2px | 同一菜单中相邻菜单项 |
| `--gap-nav-item` | `--space-1` | 2px | 导航菜单中相邻选项 |
| `--gap-button-icon-label` | `--space-3` | 8px | Button 与 Split Button 中图标和文字 |
| `--gap-button-group` | `--space-3` | 8px | 同组图标按钮或同组按钮 |
| `--gap-menu-item-content` | `--space-3` | 8px | 菜单项中的图标与文字 |
| `--gap-breadcrumb-item` | `--space-3` | 8px | Breadcrumb 相邻项 |
| `--gap-subtab-item` | `--space-3` | 8px | 子页签中的相邻页签项 |
| `--gap-alert-content` | `--space-3` | 8px | 公告或 Alert 中的图标与文字 |
| `--gap-field-label` | `--space-3` | 8px | 表单标题与输入内容框 |
| `--gap-form-field` | `--space-5` | 16px | 相邻表单字段，以及多列表单的行列间距 |
| `--gap-choice-label` | `--space-3` | 8px | Checkbox、Radio 与文字 |
| `--gap-titlebar-brand` | `--space-4` | 12px | Titlebar 中 App Icon 与应用名称 |
| `--gap-cross-group-control` | `--space-5` | 16px | 非同组控件，例如输入框与操作按钮 |
| `--gap-menu-section` | `--space-6` | 24px | 导航或菜单中的不同功能模块 |
| `--gap-page-section` | `--space-7` | 32px | 页面主要内容区块 |

```css
--gap-list-item: var(--space-1);
--gap-selection-option: var(--space-1);
--gap-tabs-list: var(--space-1);
--gap-menu-item: var(--space-1);
--gap-nav-item: var(--space-1);
--gap-button-icon-label: var(--space-3);
--gap-button-group: var(--space-3);
--gap-menu-item-content: var(--space-3);
--gap-breadcrumb-item: var(--space-3);
--gap-subtab-item: var(--space-3);
--gap-alert-content: var(--space-3);
--gap-field-label: var(--space-3);
--gap-form-field: var(--space-5);
--gap-choice-label: var(--space-3);
--gap-titlebar-brand: var(--space-4);
--gap-cross-group-control: var(--space-5);
--gap-menu-section: var(--space-6);
--gap-page-section: var(--space-7);
```

### Semantic Padding Tokens

Container tokens apply on all sides. Tokens ending in `-x` are horizontal padding for fixed-height controls; their vertical alignment is controlled by component height.

| Token | Reference | Value | Usage |
|---|---|---:|---|
| `--padding-segmented-control` | `--space-1` | 2px | 分段按钮容器与内部按钮项 |
| `--padding-popup-menu` | `--space-2` | 4px | 悬浮菜单、下拉菜单容器 |
| `--padding-list-card` | `--space-2` | 4px | List Card 与内部菜单项 |
| `--padding-tooltip` | `--space-3` | 8px | 气泡提示 |
| `--padding-alert` | `--space-3` | 8px | 公告提示旧版兼容值；新实现使用左右独立 Token |
| `--padding-alert-left` | `--space-3` | 8px | 40px 公告提示左内边距 |
| `--padding-alert-right` | `--space-2` | 4px | 40px 公告提示右内边距 |
| `--padding-selection-option` | `--space-3` | 8px | 单选块中的单选项 |
| `--padding-tab-x` | `--space-4` | 12px | Tabs Trigger 水平内边距 |
| `--padding-tab-panel` | `--space-5` | 16px | Tabs Panel 内容内边距 |
| `--padding-titlebar-leading` | `--space-6` | 24px | PC Titlebar S / M / L / XL 统一左侧内边距 |
| `--padding-titlebar-trailing-s` | `--space-0` | 0px | S Titlebar 右侧内边距 |
| `--padding-titlebar-trailing-m` | `--space-3` | 8px | M Titlebar 右侧内边距 |
| `--padding-titlebar-trailing-l` | `--space-4` | 12px | L Titlebar 右侧内边距；一级页面默认规格 |
| `--padding-titlebar-trailing-xl` | `--space-5` | 16px | XL Titlebar 右侧内边距 |
| `--padding-button-sm-x` | `--space-3` | 8px | Small Button 水平内边距 |
| `--padding-split-button-main-x` | `--space-3` | 8px | Split Dropdown 左侧快捷按钮水平内边距 |
| `--padding-split-button-trigger` | `--space-0` | 0px | Split Dropdown 右侧下拉按钮内边距 |
| `--padding-list` | `--space-3` | 8px | List 容器 |
| `--padding-tag-x` | `--space-4` | 12px | 标签水平内边距 |
| `--padding-select-x` | `--space-4` | 12px | 下拉框水平内边距 |
| `--padding-textarea-x` | `--space-4` | 12px | Textarea 水平内边距 |
| `--padding-textarea-y` | `--space-3` | 8px | Textarea 垂直内边距 |
| `--padding-search-x` | `--space-4` | 12px | 搜索框水平内边距 |
| `--padding-menu-item-x` | `--space-4` | 12px | 菜单项水平内边距 |
| `--padding-button-x` | `--space-5` | 16px | 标准 40px Button 水平内边距；图标 + 文本按钮使用 `--padding-button-sm-x` |
| `--padding-card` | `--space-6` | 24px | 卡片容器 |
| `--padding-table` | `--space-6` | 24px | Table 外层容器的四边内边距 |
| `--padding-dialog` | `--space-6` | 24px | 弹窗容器 |
| `--padding-dialog-content` | `--space-6` | 24px | Dialog 内容区 |
| `--padding-modal-content-x` | `--space-6` | 24px | 半模态内容区左右内边距 |
| `--padding-modal-content-y` | `--space-0` | 0px | 半模态内容区上下内边距 |
| `--padding-modal-header-top` | `--space-3` | 8px | 半模态标题区顶部内边距 |
| `--padding-modal-header-x` | `--space-6` | 24px | 半模态标题区左右内边距 |
| `--padding-modal-footer-x` | `--space-6` | 24px | 半模态操作区左右内边距 |

```css
--padding-segmented-control: var(--space-1);
--padding-popup-menu: var(--space-2);
--padding-list-card: var(--space-2);
--padding-tooltip: var(--space-3);
--padding-alert: var(--space-3);
--padding-alert-left: var(--space-3);
--padding-alert-right: var(--space-2);
--padding-selection-option: var(--space-3);
--padding-tab-x: var(--space-4);
--padding-tab-panel: var(--space-5);
--padding-titlebar-leading: var(--space-6);
--padding-titlebar-trailing-s: var(--space-0);
--padding-titlebar-trailing-m: var(--space-3);
--padding-titlebar-trailing-l: var(--space-4);
--padding-titlebar-trailing-xl: var(--space-5);
--padding-button-sm-x: var(--space-3);
--padding-split-button-main-x: var(--space-3);
--padding-split-button-trigger: var(--space-0);
--padding-list: var(--space-3);
--padding-tag-x: var(--space-4);
--padding-select-x: var(--space-4);
--padding-textarea-x: var(--space-4);
--padding-textarea-y: var(--space-3);
--padding-search-x: var(--space-4);
--padding-menu-item-x: var(--space-4);
--padding-button-x: var(--space-5);
--padding-card: var(--space-6);
--padding-table: var(--space-6);
--padding-dialog: var(--space-6);
```

### Layout Spacing

```css
--layout-main-content-padding-x: var(--space-6);
--layout-main-content-padding-top: var(--space-5);
--layout-main-content-padding-bottom: var(--space-0);
--layout-grid-gutter: var(--space-6);
--layout-content-max-width: none;
--layout-header-padding-x: var(--space-6);
--layout-main-title-leading-padding: var(--space-6);
--layout-main-detail-action-leading-padding: var(--space-5);
--layout-sidebar-padding-x: var(--space-5);
--layout-sidebar-padding-y: var(--space-5);
--layout-primary-action-slot-gap-top: var(--space-3);
--layout-primary-action-slot-gap-bottom: var(--space-4);
--layout-secondary-list-card-inset-x: var(--space-5);
--layout-secondary-list-card-padding-x: var(--space-3);
--layout-secondary-content-axis-x: var(--space-6);
--layout-secondary-pane-padding-x: var(--layout-secondary-list-card-inset-x);
--layout-secondary-pane-padding-y: var(--space-3);
--layout-main-detail-padding-x: var(--space-6);
--layout-main-detail-padding-top: var(--space-5);
--layout-main-detail-padding-bottom: var(--space-0);
```

Multi-pane inset rules are fixed, not discretionary:

| Pane content wrapper | Left / Right | Top / Bottom | Rule |
|---|---:|---:|---|
| Primary Navigation | 16px | 16px | Navigation owns the inset once. |
| Secondary List Search / Card state envelope | 16px | 16px | Standalone Search frame and Selected/Hover/Pressed background edge. |
| Secondary List aligned content | 24px | — | Title, toolbar/meta copy, states, and row content share this x-axis. |
| Two-pane Main Content | 24px | 16px top / 0px bottom | Default page-content scroll wrapper. |
| Three-pane Main Detail | 24px | 16px top / 0px bottom | Default detail scroll wrapper; left and right remain symmetric. |

- Measure from the pane's inner edge after the 0.5px divider. The divider does not count toward padding.
- The direct scroll wrapper owns pane padding. Children use gaps for sibling relationships and never recreate pane padding with margins.
- Secondary List Pane uses a 16px surface axis and a nested 24px content axis. Keep the standalone Search frame and row state background at 16px from the pane edge. In Pattern B, Search occupies the Secondary Pane Titlebar row, while filter/sort/view actions share the 40px in-pane title row on its right. Use `--layout-secondary-list-card-padding-x` inside each row so its content lands at 24px, and align title, action group, meta copy, and list states to `--layout-secondary-content-axis-x`. State changes never move content or resize the envelope.
- Main Content and Main Detail use 24px left/right, 16px top, and 0px bottom. Their direct content wrapper owns vertical scrolling; do not add a viewport-bottom inset. Main Detail uses `default-content` unless the requirement contract explicitly names `edge-aligned`. In `edge-aligned`, only editor canvases, data grids, media, maps, or file workspaces reach the pane edge; toolbars, headers, forms, empty states, and readable copy still use the directional safe-area inset.
- Cards retain `--padding-card` internally. This internal padding is separate from the surrounding 24px pane inset and must not be applied to the page wrapper a second time.

### Desktop Grid

```text
Default design frame: 1728px × 1152px
Primary design width: 1728px
Primary design height: 1152px
Minimum supported desktop size: 1100px × 720px
Maximum content width: none
Grid columns: 12
Grid gutter: 24px
Outer margin:
Sidebar-to-content gap:
Fixed or fluid content width: fluid; right Main/Detail pane fills remaining width
```

### Density Rules

```text
Default density: compact
Compact density supported: yes, this is the default mode
Components affected by compact density: menus, navigation, segmented controls, lists, buttons, form controls
Values that change in compact density: component height and vertical padding may vary by component size
Values that must remain unchanged: primitive space scale and semantic horizontal relationships
```

### Spacing Usage Rules

```text
Page to section relationship: use --gap-page-section
Section title to content relationship: define when section-title patterns are specified
Parent padding vs child gap rule: parent owns padding and gap; children do not duplicate the same spacing with margin
Form Field / 表单字段: title and control stack vertically. The title uses the complete body-m style and --color-text; title-to-control uses --gap-field-label (8px). Adjacent fields use --gap-form-field (16px). Selection-control labels (Checkbox, Radio, Switch) use body-m. The standalone Label uses body-m, exact --height-tag (28px), --padding-tag-x (12px) on both horizontal sides, flex alignment so its text is vertically centered, --radius-tag (8px), and --color-neutral-dark-05 (neutral-dark.5) as its background.

Native Select / 原生选择器: use a real HTML `select` whose interactive box covers the complete visible control. Clicking the value, internal empty space, or trailing chevron region opens the browser or operating-system native option menu. The chevron is visual-only with `pointer-events: none`; do not replace Native Select with a custom menu, button, or partial-width hit target.
Card internal rhythm: outer inset uses --padding-card; internal content gaps remain component-specific
List and table row rhythm: standalone List containers use --padding-list. In Secondary List Pane, the scroll wrapper owns the 16px surface inset, the standalone Search frame and List Card state background fill that width, and each row uses the approved 8px horizontal padding. The resulting 24px content axis aligns title, toolbar/meta copy, states, and row content. Row height and vertical padding remain component-specific.

Pattern B Secondary List Pane anatomy: compose the second column as `standalone Search in the transparent Titlebar segment -> one scrolling inset owner -> List title + action row -> optional meta row -> List collection`. Search fills the Secondary Pane Titlebar row at the 16px surface axis without a title or adjacent action. The Renderer-owned scrolling inset owner applies 16px horizontally, `space/3` on the top, and `space/0` on the bottom. The first content row is 40px high through `--height-list-heading`; its title uses the complete `title-s` style and its Ghost actions sit on the right in the same row. The title, actions, optional meta row, and list states add the tokenized 8px nested inset and therefore align to the 24px content axis. Rows fill the 16px surface width and apply 8px horizontal padding. Selection updates Main Detail in place and does not replace the three-pane shell.

Secondary Page has two approved forms. **Continuation form:** keeps the current application shell, pane boundaries, and parent navigation selection stable while replacing only the owning Main pane. Its final-pane leading group uses a 40px Ghost Back Icon Button to the left of the `title-s` page title at the normal 24px Main Content axis. The body reuses the existing Main Content/Main Detail scroll wrapper and insets; never add a second page-padding wrapper. Back restores parent state and focus to the opening control. **New-page form:** opens an independent secondary page with a vertical layout: `Titlebar S` (40px) at the top, then content designed for the task below. Its standalone title uses `Subtitle_M` (16px / 20px / 500), not the larger `Title_S`; the component owns this size-specific typography. It does not inherit the original page's sidebar or pane layout. Hide a parent-specific Global Primary action at child depth, but retain a genuinely application-global action when valid. Do not use Dialog or Semi-modal for ordinary full-page hierarchy.

Vertical-axis alignment principle: classify edges before aligning them. Comparable control/state surfaces share a surface axis, while readable content shares a nested content axis. In Secondary List Pane, Search and List Card state backgrounds use 16px; title, toolbar/meta copy, states, and row content use 24px. Never align a full-width Search frame to the nested card-content axis or repair alignment with per-child margins and literal pixel offsets.
Dialog internal rhythm: outer inset uses --padding-dialog; header/body/footer gaps remain component-specific
Empty-state spacing: pending
Margin rule: do not create a parallel margin scale; use margin only for exceptional external placement
```

### Spacing QA

- Check every implemented spacing value resolves to a primitive or semantic token.
- Check repeated component instances use identical padding and gaps.
- Check nested layouts do not accidentally double page, section, or card padding.
- Check compact controls remain readable and clickable on desktop.
- Check Pixso Auto Layout values match CSS and Tailwind mappings exactly.
- Flag arbitrary spacing values before delivery.

