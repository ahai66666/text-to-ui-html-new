本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.4 Radius

### Primitive Radius Scale

```css
--radius-0: 0px;
--radius-1: 4px;
--radius-2: 6px;
--radius-3: 8px;
--radius-4: 12px;
--radius-5: 16px;
--radius-full: 999px;
```

`--radius-4` is the standard container radius for Cards and Tables.

### Semantic Radius Tokens

| Token | Reference | Value | Usage |
|---|---|---:|---|
| `--radius-popup-menu-item` | `--radius-1` | 4px | 悬浮菜单中的菜单项 |
| `--radius-checkbox` | `--radius-1` | 4px | Checkbox |
| `--radius-subtab` | `--radius-3` | 8px | 子页签 |
| `--radius-sidebar-nav-item` | `--radius-3` | 8px | 左侧导航菜单项 |
| `--radius-button` | `--radius-3` | 8px | 标准 Button |
| `--radius-icon-text-button` | `--radius-3` | 8px | 图标文本按钮 |
| `--radius-icon-button` | `--radius-3` | 8px | Icon Button |
| `--radius-status-button` | `--radius-3` | 8px | 状态按钮 |
| `--radius-dropdown-button` | `--radius-3` | 8px | 下拉按钮 |
| `--radius-alert` | `--radius-3` | 8px | 公告提示和 Alert |
| `--radius-select` | `--radius-3` | 8px | 下拉框 |
| `--radius-input` | `--radius-3` | 8px | 文本输入框 |
| `--radius-textarea` | `--radius-3` | 8px | 多行文本框 |
| `--radius-tooltip` | `--radius-2` | 6px | Tooltip |
| `--radius-search` | `--radius-3` | 8px | 搜索框 |
| `--radius-number-input` | `--radius-3` | 8px | 数字选择器 |
| `--radius-tag` | `--radius-3` | 8px | 标签 |
| `--radius-selection-block` | `--radius-3` | 8px | 单选块 |
| `--radius-selection-option` | `--radius-2` | 6px | 单选块中的单选项 |
| `--radius-tab` | `--radius-3` | 8px | Tab |
| `--radius-list` | `--radius-4` | 12px | List 集合容器 |
| `--radius-list-item` | `--radius-3` | 8px | List 子项 |
| `--radius-badge` | `--radius-full` | 999px | Badge |
| `--radius-progress` | `--radius-full` | 999px | Progress 轨道与指示条 |
| `--radius-avatar` | `--radius-full` | 999px | Avatar |
| `--radius-card` | `--radius-4` | 12px | Card 与 Metric Card |
| `--radius-table` | `--radius-4` | 12px | Table 外框 |
| `--radius-pagination-item` | `--radius-3` | 8px | Pagination 项 |
| `--radius-dialog` | `--radius-5` | 16px | 弹窗 |
| `--radius-modal` | `--radius-5` | 16px | 模态弹窗 |

```css
--radius-popup-menu-item: var(--radius-1);
--radius-checkbox: var(--radius-1);
--radius-subtab: var(--radius-3);
--radius-sidebar-nav-item: var(--radius-3);
--radius-button: var(--radius-3);
--radius-icon-text-button: var(--radius-3);
--radius-icon-button: var(--radius-3);
--radius-status-button: var(--radius-3);
--radius-dropdown-button: var(--radius-3);
--radius-alert: var(--radius-3);
--radius-select: var(--radius-3);
--radius-input: var(--radius-3);
--radius-textarea: var(--radius-3);
--radius-tooltip: var(--radius-2);
--radius-search: var(--radius-3);
--radius-number-input: var(--radius-3);
--radius-tag: var(--radius-3);
--radius-selection-block: var(--radius-3);
--radius-selection-option: var(--radius-2);
--radius-tab: var(--radius-3);
--radius-list: var(--radius-4);
--radius-list-item: var(--radius-3);
--radius-badge: var(--radius-full);
--radius-progress: var(--radius-full);
--radius-avatar: var(--radius-full);
--radius-card: var(--radius-4);
--radius-table: var(--radius-4);
--radius-pagination-item: var(--radius-3);
--radius-dialog: var(--radius-5);
--radius-modal: var(--radius-5);
```

Pending semantic role: popup menu container. No circular Button component or circular-button size token is defined; do not invent one.

