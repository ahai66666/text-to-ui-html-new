本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.6 Modals / Toasts

### Classes

```text
.modal
.toast
.overlay
```

### Rules

Dialog and Semi-modal are separate component families.

- **Dialog / 对话弹窗:** use fixed `--width-dialog` (400px) for deletion confirmation, update guidance, download progress, warnings, and other short focused flows. Use `--height-dialog-header` (56px) with a centered `title-s` title, `--padding-modal-header-top` (8px) from the top edge to match Semi-modal, and no top-right close control. The content area uses `--padding-dialog-content` (24px). A single 40px action fills the available width; two actions form equal-width columns using `--gap-button-group`, with Secondary on the left and Primary or Danger on the right. Do not dismiss destructive or incomplete work through outside click.
- **Semi-modal / 半模态弹窗:** has three independent dimensions. **Size** is exactly S `--width-modal-sm` (480px), M `--width-modal-md` (640px), or L `--width-modal-lg` (800px). **Surface** is either White `--color-modal-bg-white` or Gray `--color-modal-bg-gray`; every size supports both surfaces. On a White surface, input, search, select, and textarea components use the gray `--color-input-bg-on-default` surface. On a Gray surface, those components use the white `--color-input-bg-on-subtle` surface. **Behavior** defaults to `non-modal`. The 56px header uses `title-s`, 8px top padding, 24px horizontal padding, left-aligned title, and a right Ghost Icon Button close control. The content area uses `--padding-modal-content-x` (24px) horizontally and `--padding-modal-content-y` (0px) vertically. A two-column form grid owns row and column gaps, so fields on the same row align their title and control start edges without inherited vertical sibling margins. The 80px footer vertically centers 40px content-width actions and aligns the group right; Secondary precedes Primary.
- **Composition rule:** Dialog and Semi-modal own only the container, header, body layout, and footer. Every child control must be a component-library instance: Button, Icon Button, Input, Search, Select, Textarea, and their established states. Do not create modal-only field, search, button, or icon styles. Surface switching must use the existing component context (`on-white` or `on-gray`) so all child states remain identical to the component gallery.
- **Behavior variants are not Tokens:** `non-modal` has no overlay, does not lock background interaction, and uses `aria-modal="false"`; `modal` uses `--color-overlay`, makes the background inert, constrains focus, locks background scrolling, and uses `aria-modal="true"`. Both variants share the same size and surface tokens. Escape closes only when the task permits dismissal and always restores focus to the trigger.

- **Snackbar:** use `--height-snackbar` (48px), a white `--color-surface` background, primary text color `--color-text`, and `--shadow-1`. It is short-lived, non-blocking feedback. A separate Toast component has no shadow.

Dialog and Alert Dialog use `--radius-dialog` and `--shadow-4`; Semi-modal uses `--radius-modal` and `--shadow-5`. Constrain width to the available viewport inset without inventing another width.

### Alert / 公告提示

Alert is a single-line, fixed-height announcement bar. Its anatomy is `Status Icon + Detail + Text Action + Close` and its complete height uses `--height-alert` (`--size-11`, 40px). The left group contains the status icon and detail; the right group contains the text action and close button. Both groups are vertically centered, the detail expands and truncates before the action group, and the right controls never wrap.

- The container uses `--padding-alert-left` (`--space-3`, 8px) and `--padding-alert-right` (`--space-2`, 4px). The status icon and detail use `--gap-alert-content` (`--space-3`, 8px).

- The status icon is 20px (`--icon-size-md`) and uses a circle plus a centered semantic mark: information, check, exclamation, cross, or neutral minus. Bind the reusable aliases `status/info`, `status/success`, `status/warning`, `status/danger`, and `status/neutral`; do not use text characters as icons.
- Detail text uses the complete `subtitle-s` style (14px / 20px / Medium 500) and always uses the primary text color `--color-text`. The 20px status icon alone uses the current semantic status color. The text action reuses the approved Small Ghost Button component (`.btn.btn-ghost.btn-sm`) including its typography, foreground, Hover, Pressed, Focus, and Disabled behavior; do not recolor it with the Alert status. The close control uses the primary icon color `--color-icon` with a 20px close glyph inside a 32px hit area.
- Approved variants are Info, Success, Warning, Danger, and Neutral gray. Info uses `brand/100` with `brand/10`; Success, Warning, and Danger use their `function/*/100` foreground with the matching `function/*/10` background. The semantic `*-subtle` aliases must resolve to these 10% surfaces. Neutral uses `--color-alert-neutral` with `--color-alert-neutral-subtle`.
- The text action and close button form one vertically centered trailing group. Text action comes before close. The Ghost Button owns the text-action states; close Hover and Pressed change only its background feedback while preserving `--color-icon`.
- The text action is optional only when no recovery, details, or undo path exists. The close button is optional only for a persistent non-dismissible system condition. When present, both are keyboard reachable and have accessible names; closing removes the announcement without changing unrelated state.

