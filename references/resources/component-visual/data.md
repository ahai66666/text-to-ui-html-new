本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.5 Data Display

### Classes

```text
.table
.table-row
.table-cell
.badge
.status
.chart-card
.empty-state
.progress
.pagination
.pagination-item
.avatar
```

### Rules

Table uses `--color-surface`, `--radius-table` (12px), and a 1px `--color-border` outer stroke. The outer Table container owns `--padding-table` (`--space-6`, 24px) on all four sides, so its toolbar, row backgrounds, dividers, and pagination never touch the outer stroke. Header rows are 40px and data rows are 48px; the first header cell and every first-column body cell add `--space-5` (16px) from the inner Table edge. Internal columns may retain `--space-5` spacing. When the first-column name includes a leading Avatar, icon, thumbnail, or file-type visual, the gap between that visual and the name also uses `--space-5` (16px). Headers use muted `body-m` (14px / 16px / Regular 400); cells use `body-l` (16px / 20px / Regular 400); numeric values align right, and the first column owns the row label. Hover applies `--state-layer-hover`; selected rows use `--color-sidebar-selected`. Sortable headers are buttons with `aria-sort`, not clickable text containers.

Badge is 24px high, uses `--radius-badge`, `body-s`, and 8px horizontal padding. Approved variants are neutral (gray), info (blue), success (green), warning (orange), and danger (red). Each uses a readable foreground color with a background from the same core family at 10% opacity. Badge/status labels and Alert backgrounds both use the approved 10% family surface; their component anatomy, height, typography, and actions provide the distinction. Every status label includes text; do not use a colored dot alone.

Progress uses an 8px neutral track with a brand indicator. Determinate progress exposes `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`; visible percentage text is required when precise completion matters.

Pagination items are 32px square. Current page uses `aria-current="page"`; previous/next buttons carry explicit accessible labels; unavailable controls are disabled. Keyboard order follows visual order and changing page preserves focus on the activated item.

Avatar sizes are 32px and 40px with `--radius-avatar` (`--radius-full`, 999px) so both sizes render as circles. Initials and fallback icons remain readable and use deterministic semantic surfaces. Adjacent text owns the person's full name; Avatar alone is not the only identity affordance.

Empty State centers one short explanation and one recovery action inside the data region. It must describe what is missing and the next useful step, not only display an illustration.

Charts use `--color-chart-1` through `--color-chart-5` in order and provide non-color legends or direct labels.

