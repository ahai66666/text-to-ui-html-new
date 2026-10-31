本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.3 Cards

### Classes

```text
.card
.card-header
.card-title
.card-body
.card-footer
.metric-card
```

### Rules

Cards use `--color-surface` with a 1px `--color-border`, `--radius-card` (12px), and `--padding-card` (`--space-6`, 24px). Default cards remain flat; use elevation only for draggable, floating, or explicitly raised surfaces.

Card content follows Header → Body → Footer order. A Card title uses `title-s` (20px / 28px / Bold 700); header and footer actions align to the trailing edge, while the parent owns vertical gaps. Interactive cards use a native `button` or `a`, apply `--state-layer-hover` and `--state-layer-pressed`, expose a visible focus ring, and never hide the only action behind a whole-card click.

Metric Cards use the same shell and show one `title-s` Card title, one primary value, and optional trend/context. Do not mix unrelated metrics in one card. Trends use semantic status color plus a text or icon affordance so meaning never depends on color alone.

