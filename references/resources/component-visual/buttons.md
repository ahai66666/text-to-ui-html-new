本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.1 Buttons

### Classes

```text
.btn
.btn-primary
.btn-secondary
.btn-ghost
.btn-danger
.btn-icon
.btn-icon-text
.btn-icon-text-ghost
.icon-btn
.icon-btn-secondary
.icon-btn-ghost
.split-control
.split-main
.split-main-icon
.split-trigger
.dropdown-menu
.dropdown-menu-item
```

### Rules

| Rule | Standard | Small |
|---|---:|---:|
| Height | `--height-button` (40px) | `--height-button-sm` (28px) |
| Horizontal padding | `--padding-button-x` (16px) | `--padding-button-sm-x` (8px) |
| Radius | `--radius-button` (8px) | `--radius-button` (8px) |
| Typography | `body-l` (16px / 22px / Regular 400) | `body-m` (14px / 20px / Regular 400) |
| Variants | Primary, Secondary, Ghost, Danger | Primary, Secondary, Ghost, Danger |

Variant colors:

- Primary uses `--color-primary` with inverse text.
- Secondary uses `--color-button-secondary-bg` and `--color-button-secondary-text`.
- Ghost uses a transparent background and `--color-button-ghost-text` (`brand-100`).
- Danger uses the same background as Secondary and `--color-button-danger-text` (`function/danger/100`).
- Button typography uses Body roles instead of Subtitle roles. Standard and 40px action controls use `body-l`. Only 28px Small Buttons use `body-m`; menu items and Accordion triggers use `body-l`. Tabs remain the single compact-navigation exception and use `body-m`. State changes should rely on color, background, border, and indicators rather than increasing the label weight.

Icon + Text Button is a separate 40px-only component:

- Variants: Primary, Secondary, and Ghost. It has no 28px size and no Danger variant.
- Horizontal padding uses `--padding-button-sm-x` (8px), matching the current Pixso `icon-text` master.
- Icon and text use `--gap-button-icon-label` (`--space-3`, 8px). Apply this token to every Button and Split Button icon + text pair; do not use literal gaps.
- Primary and Secondary reuse the matching standard Button colors.
- Ghost uses `--color-icon-text-button-ghost-content` (`neutral-dark-90`) for both text and icon.
- Every icon defaults to `--icon-size-md` (20px).
- Disabled is supported by all three variants with whole-control opacity at 40% through `--state-disabled-opacity`.

Icon Button:

- Size is `--size-icon-button` (40px square); nested icons default to `--icon-size-md` (20px).
- Default variant is Ghost. A plain `.icon-btn` must render with a transparent resting background and `--color-icon` (`neutral-dark-90`) content; Hover and Pressed use `--state-layer-hover` and `--state-layer-pressed`.
- Secondary remains available only as an explicitly requested `.icon-btn-secondary` variant. Never give an unspecified Icon Button a persistent fill. `.icon-btn-ghost` is a compatibility alias for the default Ghost rendering, not a separate required declaration.
- Both variants support Disabled with whole-control opacity at 40% through `--state-disabled-opacity`.

Checkbox, Radio, and Switch are compact selection controls. Their visible labels use `body-m` (14px / 20px / Regular 400) with primary text color; label-to-control spacing uses `--gap-choice-label` (8px). This compact-label rule does not apply to the 40px Select or Combobox field controls.

Split Dropdown Button is a 40px Ghost action control with two independent hit targets:

- Content combinations: Icon + Text main action + Chevron trigger, or Icon main action + Chevron trigger.
- The left main button immediately performs the component's default shortcut action. It never opens the menu.
- The right Chevron button only opens lower-priority folded actions. It owns `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- Default background is transparent. Each hit target independently uses `--state-layer-hover` on Hover, matching the Ghost Icon + Text Button behavior.
- Content uses `--color-icon-text-button-ghost-content` (`neutral-dark-90`), not the brand-colored standard Ghost Button text.
- Left main actions use `--padding-split-button-main-x` (`--space-3`, 8px) and `body-l`. Icon-only main actions retain a stable 40px width while applying the same 8px horizontal inset.
- Right Chevron triggers use `--width-split-button-trigger` (`--size-5`, 16px) and `--padding-split-button-trigger` (`--space-0`, 0px). The 16px Chevron is horizontally and vertically centered inside the fixed-width trigger.
- Leading icons use `--icon-size-md` (20px). The disclosure chevron uses `--icon-size-sm` (16px).
- Disabled applies 40% opacity to the complete split control through `--state-disabled-opacity` and prevents both hit targets from activating.

Split Dropdown action menus:

- Menu items use the complete `body-l` style (16px / 22px / Regular 400).
- Split Dropdown action-menu items use Icon + Text. Icons use `--icon-size-md` (20px), text uses `body-l`, and their gap uses `--gap-menu-item-content` (`--space-3`, 8px). Use registered semantic icon aliases (default Lucide Regular); do not substitute character glyphs.
- Opening the trigger sets `aria-expanded="true"`. Selecting an item closes the menu; `Escape` closes it and returns focus to the trigger; clicking outside closes it.
- Do not hide the page's primary action inside the folded menu. Use Split Dropdown only when lower-priority actions do not fit or would add avoidable clutter.

### States

```text
Default:
Hover:
Active:
Focus:
Disabled: Every variant and both sizes support Disabled. Apply `--state-disabled-opacity` (40%) once to the whole button and prevent activation.
Loading:
```

