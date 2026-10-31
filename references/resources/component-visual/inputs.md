本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 5.2 Inputs

### Classes

```text
.field
.form-field
.form-field-title
.field-label
.input
.search-shell
.search-icon
.search-clear
.textarea
.select
.select-trigger
.select-listbox
.select-option
.input-error
.field-hint
.field-error
```

### Rules

Input, Search, Textarea, field Select/Combobox, Date Picker, Time Picker, and Input OTP use the complete `body-l` text style (16px / 22px / Regular 400) for their displayed or entered value. Input and Search use `--height-input` (40px). Search uses a leading search icon sized with `--icon-size-sm` (16px), never a text glyph or the 20px medium icon token. When Search contains text, show a trailing quick-clear button whose icon also uses `--icon-size-sm`; clearing empties the value, hides the button, and returns focus to Search. Reserve the trailing button space so text does not shift when the button appears. Textarea uses `--min-height-textarea` (80px), `--padding-textarea-x` (12px), and `--padding-textarea-y` (8px), with vertical resize enabled by default.

Search matches the current Pixso component set's nine states on both surfaces (18 combinations total): `default`, `focus`, `typing`, `filled`, `hover-left`, `hover-right`, `pressed-left`, `pressed-right`, and `disabled`. There is no Error state: never render a Search Error variant, error border, or `aria-invalid`. With default state behavior, focus on an empty field resolves to Focus; entering text while focused resolves to Typing; a non-empty field after blur resolves to Filled; Disabled overrides the other states. Hover and Pressed are transient and region-specific: left means the complete scope selector; right means the input region, including search icon, value, clear action, and optional Advanced action. Never use generic Search `hover` or `pressed` states.

Input / Tag Entry is one structural Input variant (`variant="tag-entry"`), not separate white- and gray-surface components. Set its existing `surface` prop from the containing content surface: `white` uses the default gray input fill; `gray` uses the subtle white input fill. The single row places a left label and a flexible, bottom-underlined editor slot on the right. The label uses Body_L (16px / 22px / Regular 400) and `--color-text-muted` (secondary text); the empty-slot hint uses Body_L and `--color-text-subtle` (tertiary text); entered text uses Body_L and `--color-text` (primary text). The outer Input surface, label, and selected Chips have no hover treatment or enlarged hover hit area. Hover feedback is limited to the right editor slot's underline, which changes from `--color-border` to `--color-icon` (primary icon color); do not add an outer fill, border, or layout shift. Selected values reuse the existing removable Chips component. Free text remains ordinary editable input text unless the user chooses a suggestion. Enter opens a filtered suggestion listbox; Arrow Up/Down changes the active option; Enter or pointer selection converts that option into a removable tag and clears the query; Escape closes without committing. Omit already-selected suggestions, preserve focus on the input after selection/removal, and expose the combobox/listbox relationship with `aria-expanded`, `aria-controls`, and `aria-activedescendant`. The listbox reuses the Dropdown Menu panel and item visual styles, including the `shadow-2` panel; keep its combobox/listbox and option semantics rather than changing it to a command menu. Keep one Tag Entry catalog entry and reuse it across both surfaces; do not define surface-specific component variants.

Search is one reusable component across content surfaces: white content uses the gray Search fill (`neutral-dark/05`); gray content uses the white Search fill (`neutral-light/100`). Its 324×40 root has an 8px radius, zero outer padding, and zero root gap. The left scope selector is 73×40 with a 12px leading inset, 4px internal spacing, and a 1×16 divider; the right input region fills the remaining width with 8px leading and 4px trailing inset and 8px spacing between slots. The scope label uses `Typography/Body_L` and primary text (`neutral-dark/90`); its 20px chevron also uses primary icon color. The leading search icon is 16px and secondary (`neutral-dark/60`); the placeholder uses Body_L and secondary text, while entered text uses Body_L and primary text. The clear icon is 16px and primary (`neutral-dark/90`). The optional Advanced action remains a small Ghost text action with secondary text and a stable 4px trailing inset.

Keep the two sibling hit regions independent: scope selector on the left; search icon, value, clear action, and optional Advanced action on the right. Hover and Pressed affect only their named region and never change the 324×40 geometry or resize the root. On the gray Search fill, the left scope selector and right input region Hover both use `neutral-dark/05`; Pressed uses `neutral-dark/15`. On the white Search fill, Hover uses a `neutral-dark/05` layer and Pressed uses `neutral-dark/10`, each with a 2px white outline. Do not recolor the opposite region. Keyboard focus remains visible on the Dropdown Menu trigger; the Advanced action keeps the same trailing inset in resting, hover, and focus-within states. Keep that inset on the right input region; do not add root padding or change its flex geometry on Hover.

Form Field / 表单字段 stacks its title above its control. The title uses `body-m` (14px / 20px / Regular 400), `--color-text`, and a tokenized `--gap-field-label` (8px) before the control. Adjacent fields use `--gap-form-field` (16px). In a multi-column form grid, the grid owns both axes with that same 16px row and column gap: all same-row fields start on the same horizontal baseline, and sibling vertical margins are reset to zero. Textarea and form Select inherit the same white/default and gray/subtle surface state mappings as Input. Default and Hover have no visible border on white surfaces. Focus retains the approved background with no focus border. Error uses a 1px `--color-input-error-border`; Disabled applies `--state-disabled-opacity` (40%) once to the complete control.

Whenever white/default and gray/subtle surface examples are presented together, keep their component matrix semantically identical: the same Input, Search, Textarea, form Select, Input/Field Error, and Disabled examples in the same order. Only the surface-specific fill and hover treatment may differ. Both contexts must include an operable form Select, visible Error examples attached to Input/Field controls only, and Disabled Input, Search, and Select examples. Search never has an Error state. At supported desktop widths, present the two surface contexts as equal left/right columns; do not collapse them merely because an embedded HTML component preview is narrower than the page canvas. A one-column fallback is reserved for genuinely narrow widths below the two-column minimum.

Form Select presents a field value, uses `role="combobox"`, controls a `role="listbox"`, and exposes `aria-expanded`, `aria-controls`, and `aria-activedescendant` when open. Pointer click, `Enter`, or `Space` opens it; Arrow keys, Home, and End move the active option; `Enter` or `Space` commits the active option; `Escape` closes without changing the value and restores focus to the trigger. A pointer or focus move outside the Select closes the listbox without committing a draft value.

