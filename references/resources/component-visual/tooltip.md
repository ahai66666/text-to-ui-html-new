本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.7 Tooltip

Tooltip (Tips) is supporting text for an unfamiliar control, never the only place for essential information. It shares the Snackbar visual surface: white `--color-tooltip-bg` / `--color-surface`, primary `--color-tooltip-text` / `--color-text`, a 1px `--color-border` outline, and `--shadow-1`. The outline matches the List Selection dropdown menu. Keep `--radius-tooltip` (6px) and `--padding-tooltip` (8px), keep copy concise, and place it at least 4px from its trigger. Tooltip is one complete rounded rectangular floating surface and does not use a directional caret or arrow.

Show Tooltip on pointer hover and keyboard focus after a short delay. The trigger references the tooltip through `aria-describedby`. Hide it when pointer and focus leave, on `Escape`, or when the trigger is disabled. Tooltip itself is non-interactive and must not receive focus.

