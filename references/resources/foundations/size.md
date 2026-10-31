本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.5 Size and Dimensions

The token index is an ordered scale name, not a multiplier. Use exact pixel values in Pixso and CSS.

### Primitive Size Scale

```css
--size-1: 4px;
--size-2: 6px;
--size-3: 8px;
--size-4: 12px;
--size-5: 16px;
--size-6: 20px;
--size-7: 24px;
--size-8: 28px;
--size-9: 32px;
--size-10: 36px;
--size-11: 40px;
--size-12: 44px;
--size-13: 48px;
--size-14: 56px;
--size-15: 64px;
--size-16: 72px;
--size-17: 80px;
```

### Icon Size Tokens

All rendered sizes scale from the canonical SVG 24 × 24 source artboard. The
24 × 24 coordinate system is not the default display size. Every icon request
declares a semantic size Token and resolves to 16px, 20px, or an explicitly
approved 24px. Preserve the original viewBox while scaling the SVG root and its
internal vector geometry together. In Pixso, shrinking only the outer container
around unchanged 24px geometry is invalid. Official SVG paths use Regular
weight and `currentColor`; do not apply a page-level stroke width.

For outline icons, the source stroke is 1.5px on the 24 × 24 artboard. Scale
the root and internal vectors uniformly so the effective display stroke is
1.5px at 24px, 1.25px at 20px, and 1px at 16px. Filled HarmonyOS glyphs keep
their official filled geometry and receive no stroke.

| Token | Reference | Value |
|---|---|---:|
| `--icon-size-xs` | `--size-4` | 12px |
| `--icon-size-sm` | `--size-5` | 16px |
| `--icon-size-md` | `--size-6` | 20px |
| `--icon-size-lg` | `--size-7` | 24px |

```css
--icon-source-size: 24px;
--icon-weight-regular: 400;
--icon-outline-source-stroke-width: 1.5;
--icon-outline-stroke-width-16: 1;
--icon-outline-stroke-width-20: 1.25;
--icon-outline-stroke-width-24: 1.5;
--icon-manual-fallback-stroke-width: 1.5;
--icon-size-xs: var(--size-4);
--icon-size-sm: var(--size-5);
--icon-size-md: var(--size-6);
--icon-size-lg: var(--size-7);
```

### Indicator and Selection Sizes

| Token | Reference | Value | Usage |
|---|---|---:|---|
| `--notification-dot-sm` | `--size-2` | 6px | 新事件提示小红点 |
| `--notification-badge-size` | `--size-5` | 16px | 带数字的新事件提示 |
| `--checkbox-size` | `--size-6` | 20px | Checkbox |
| `--radio-size` | `--size-6` | 20px | Radio |
| `--switch-height` | `--size-6` | 20px | Switch 高度 |
| `--switch-width` | `--size-11` | 40px | Switch 宽度 |
| `--height-badge` | `--size-7` | 24px | Badge 高度 |
| `--height-progress` | `--size-3` | 8px | Progress 轨道高度 |
| `--size-avatar-sm` | `--size-9` | 32px | Small Avatar |
| `--size-avatar-md` | `--size-11` | 40px | Medium Avatar |

### Component Heights

Standard desktop controls are 40px high. Small 28px variants remain available where already approved. No Large control variant is defined; do not scale a standard control above 40px without a new explicit specification.

| Token | Reference | Value | Usage |
|---|---|---:|---|
| `--height-button-sm` | `--size-8` | 28px | Small Button |
| `--height-input-sm` | `--size-8` | 28px | Small 文本框 |
| `--height-select-sm` | `--size-8` | 28px | Small 下拉框 |
| `--height-search-sm` | `--size-8` | 28px | Small 搜索框 |
| `--height-tag` | `--size-8` | 28px | 标签 |
| `--height-selection-option` | `--size-8` | 28px | 单选块子项 |
| `--height-selection-block` | `--size-9` | 32px | 单选块 |
| `--height-chips-tab` | `--size-10` | 36px | Chips Tab |
| `--height-tab-line` | `--size-11` | 40px | Line Tab Trigger |
| `--height-tab-vertical` | `--size-11` | 40px | Vertical Tab Trigger |
| `--height-menu-item` | `--size-11` | 40px | 菜单项 |
| `--height-list-item` | `--size-11` | 40px | List 子项 |
| `--height-list-heading` | `--size-11` | 40px | Secondary List 标题与操作行 |
| `--height-tree-item` | `--size-11` | 40px | Tree 子项 |
| `--height-button` | `--size-11` | 40px | 标准 Button |
| `--size-icon-button` | `--size-11` | 40px | Icon Button 外框尺寸 |
| `--height-icon-text-button` | `--size-11` | 40px | 图标文本按钮 |
| `--height-dropdown-control` | `--size-11` | 40px | 下拉菜单触发控件 |
| `--width-split-button-trigger` | `--size-5` | 16px | Split Dropdown 右侧下拉按钮固定宽度 |
| `--height-select` | `--size-11` | 40px | 标准下拉控件 |
| `--height-search` | `--size-11` | 40px | 标准搜索框 |
| `--height-input` | `--size-11` | 40px | 标准文本框 |
| `--min-height-textarea` | `--size-17` | 80px | Textarea 默认最小高度 |
| `--height-alert` | `--size-11` | 40px | 单行公告提示和 Alert 固定高度 |
| `--height-snackbar` | `--size-13` | 48px | Snackbar |
| `--height-pagination-item` | `--size-9` | 32px | Pagination 项 |
| `--height-table-header` | `--size-11` | 40px | Table 表头行 |
| `--height-table-row` | `--size-13` | 48px | Table 数据行 |
| `--height-titlebar-sm` | `--size-11` | 40px | Small Titlebar |
| `--height-titlebar-md` | `--size-14` | 56px | Medium Titlebar |
| `--height-titlebar-lg` | `--size-15` | 64px | Large Titlebar |
| `--height-titlebar-xl` | `--size-16` | 72px | Extra Large Titlebar |

```css
--notification-dot-sm: var(--size-2);
--notification-badge-size: var(--size-5);
--checkbox-size: var(--size-6);
--radio-size: var(--size-6);
--switch-height: var(--size-6);
--switch-width: var(--size-11);
--height-badge: var(--size-7);
--height-progress: var(--size-3);
--size-avatar-sm: var(--size-9);
--size-avatar-md: var(--size-11);
--height-button-sm: var(--size-8);
--height-input-sm: var(--size-8);
--height-select-sm: var(--size-8);
--height-search-sm: var(--size-8);
--height-tag: var(--size-8);
--height-selection-option: var(--size-8);
--height-selection-block: var(--size-9);
--height-chips-tab: var(--size-10);
--height-tab-line: var(--size-11);
--height-tab-vertical: var(--size-11);
--height-menu-item: var(--size-11);
--height-list-item: var(--size-11);
--height-tree-item: var(--size-11);
--height-button: var(--size-11);
--size-icon-button: var(--size-11);
--height-icon-text-button: var(--size-11);
--height-dropdown-control: var(--size-11);
--width-split-button-trigger: var(--size-5);
--height-select: var(--size-11);
--height-search: var(--size-11);
--height-input: var(--size-11);
--min-height-textarea: var(--size-17);
--height-alert: var(--size-11);
--min-height-alert: var(--height-alert); /* compatibility alias */
--height-snackbar: var(--size-13);
--height-pagination-item: var(--size-9);
--height-table-header: var(--size-11);
--height-table-row: var(--size-13);
--height-titlebar-sm: var(--size-11);
--height-titlebar-md: var(--size-14);
--height-titlebar-lg: var(--size-15);
--height-titlebar-xl: var(--size-16);
--height-dialog-header: var(--size-14);
--height-modal-header: var(--size-14);
--height-modal-footer: var(--size-17);
```

### Modal Widths

| Token | Value | Usage |
|---|---:|---|
| `--width-modal-sm` | 480px | Small semi-modal |
| `--width-modal-md` | 640px | Medium modal or denser form |
| `--width-modal-lg` | 800px | Large modal with structured content |
| `--width-dialog` | 400px | Dialog and Alert Dialog fixed width |

```css
--width-modal-sm: 480px;
--width-modal-md: 640px;
--width-modal-lg: 800px;
--width-dialog: 400px;
```

Dialog and Alert Dialog always use the fixed 400px `--width-dialog`. Semi-modal width is selected from exactly 480px, 640px, or 800px. At constrained window widths, preserve the selected token as the maximum width and subtract the approved page inset to prevent viewport overflow.

Shell dimensions are owned by Layout tokens: the expanded Sidebar is 240px, the collapsed Sidebar is 64px, the Secondary Pane is 360px, and the default first-level Titlebar is 64px. Component-specific Titlebar variants remain 40px, 56px, 64px, and 72px.

