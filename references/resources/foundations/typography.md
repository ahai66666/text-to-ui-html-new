本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.2 Typography

Current scope: Chinese-only HarmonyOS PC desktop applications using locally installed system fonts. Mobile typography, number formatting, currency, dates, and truncation rules are deferred. Fill the primitive values first, then define semantic type roles. Pixso text styles, CSS, and Tailwind must use the same role combinations.

### Font Sources

```text
Primary UI font: system font stack
Chinese font order: HarmonyOS Sans, HarmonyOS Sans SC, PingFang SC, Microsoft YaHei
Latin font: not defined separately in the current Chinese-only scope
Display font: use the primary UI font
Monospace font: not defined in the current scope
Font source or file path: locally installed system fonts; no bundled font files
Allowed font weights: 400, 500, 700
Variable font: depends on the locally installed font; do not require variable-font features
External font loading allowed: no
License notes: rely on fonts installed on the user's operating system
```

### Font Family Tokens

Use the font stack in this exact order. `HarmonyOS Sans` is the first-priority HarmonyOS Sans family name; `HarmonyOS Sans SC` follows for installations that expose the Simplified Chinese family separately. If neither is available, macOS falls back to PingFang SC and Windows falls back to Microsoft YaHei.

```css
--font-sans: "HarmonyOS Sans", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
--font-display: var(--font-sans);
```

Do not use `@font-face` or remote font services in the current project scope.

### Font Size Tokens

```css
--font-size-10: 10px;
--font-size-12: 12px;
--font-size-14: 14px;
--font-size-16: 16px;
--font-size-18: 18px;
--font-size-20: 20px;
--font-size-24: 24px;
--font-size-30: 30px;
--font-size-38: 38px;
--font-size-48: 48px;
--font-size-56: 56px;
```

### Line Height Tokens

Use exact pixel values for Pixso parity.

```css
--line-height-12: 12px;
--line-height-14: 14px;
--line-height-16: 16px;
--line-height-20: 20px;
--line-height-22: 22px;
--line-height-24: 24px;
--line-height-28: 28px;
--line-height-36: 36px;
--line-height-44: 44px;
--line-height-58: 58px;
--line-height-66: 66px;
```

### Font Weight Tokens

Numeric values are authoritative. Use Regular=`400`, Medium=`500`, and Bold=`700` consistently across Pixso, CSS, and generated code.

```css
--font-weight-400: 400;
--font-weight-500: 500;
--font-weight-700: 700;
```

Microsoft YaHei may synthesize `500` or `700`; visually verify these weights on Windows before release.

### Letter Spacing Tokens

```css
--letter-spacing-normal: 0;
```

### Semantic Type Styles

All styles use `--font-sans` and `--letter-spacing-normal`. Source names such as `Display_L` are normalized to kebab-case in code.

| Token | Size | Line height | Weight | Description | Usage |
|---|---:|---:|---:|---|---|
| `display-l` | 56px | 66px | 400 | 展示类标题 | 大号展示标题 |
| `display-m` | 48px | 58px | 400 | 展示类标题 | 中号展示标题 |
| `display-s` | 38px | 44px | 400 | 展示类标题 | 小号展示标题 |
| `title-l` | 30px | 36px | 700 | 主标题 | 页面主标题 |
| `title-m` | 24px | 28px | 700 | 主标题 | 标题栏文本 |
| `title-s` | 20px | 24px | 700 | 主标题 | 卡片标题、半模态弹窗标题、弹窗标题 |
| `subtitle-l` | 18px | 22px | 500 | 次标题 | 普通内容子标题、菜单标题 |
| `subtitle-m` | 16px | 20px | 500 | 次标题 | 标题辅助文本、列表文本、气泡提示主标题 |
| `subtitle-s` | 14px | 16px | 500 | 次标题 | 列表子标题、普通副标题 |
| `body-l` | 16px | 20px | 400 | 主文本 | 客户端默认正文、Sidebar、表格单元格、列表主文本、40px 菜单与操作控件 |
| `body-m` | 14px | 16px | 400 | 副文本 | 列表摘要与时间、普通描述、Toast、Label、表格表头、Checkbox / Radio / Switch 标签、Tabs 与 28px Small Button |
| `body-s` | 12px | 14px | 400 | 小号正文 | 辅助文本、次要说明、字段帮助与错误、状态标签 |
| `caption-m` | 10px | 12px | 400 | 小号说明 | 极小字号的辅助说明 |

Use each semantic style as a complete combination. Machine-readable mappings are stored in `tokens.typography.css` and `tokens.typography.json`.

### HTML ↔ Pixso Typography Mapping

Use `typography-style-map.json` as the single mapping table. New visible UI is limited to its 13 `formalStyles`: each HTML semantic role maps one-to-one to the identically sized Pixso shared Text Style under `Typography/*`.

- HTML always uses `--font-sans`, which is a browser fallback stack.
- Pixso uses only `font/family/sans = HarmonyOS Sans` and the 13 formal Text Styles. A fallback family never becomes a separate Pixso Text Style.
- `body-s` and `caption-m` are formal Pixso Text Style counterparts. The old `caption-l` token is deprecated: migrate 12px supporting text to `body-s` and 10px supporting text to `caption-m`; do not create `Typography/Caption_L`.
- `Typography/Component/*` are imported native-component dependencies, not public Text to UI styles. Do not select them for new page content; audit component references before any deletion. The unused legacy `Body_YaHei14` and `Body_YaHei16` styles were removed from Pixso.

### HTML ↔ Pixso Effect Mapping

Use `effect-style-map.json` as the single mapping table. Pixso exposes six physical styles `Effect/Foundation/shadow-1` through `shadow-6`; shared shadow Token roles are registered for Snackbar, Tooltip, Popover, Hover Card, Dialog, Alert Dialog, Semi-modal, Dropdown Menu, and Context Menu. HTML semantic names resolve to those standard component contexts. `shadow-6` is retained but has no standard role. Imported `Effect/Component/*` effects are native-component implementation dependencies, never public Text to UI effects.

### Platform Scope

```text
Platform: HarmonyOS PC desktop application
Default design frame: 1728px × 1152px
Primary design width: 1728px
Primary design height: 1152px
Supported desktop width range:
Minimum supported viewport width:
Mobile output: not in current scope
Responsive type scaling: not in current scope; support approved desktop window widths only
```

Do not scale font size continuously with viewport width. Keep semantic type roles stable across supported desktop widths.

### Deferred Rules

```text
Language scope: Simplified Chinese
Mobile typography: deferred
Number typography and formatting: deferred
Currency formatting: deferred
Date formatting: deferred
Text truncation and line-clamp rules: deferred
```

### Typography QA

- Confirm every selected font weight is available in each system-font fallback or that synthesized rendering is acceptable.
- Compare HarmonyOS Sans, HarmonyOS Sans SC, PingFang SC, and Microsoft YaHei at the same size and line height.
- Check common and long Simplified Chinese labels at supported desktop widths.
- Check text does not clip when browser zoom or system font scaling increases.
- Verify the interface remains usable when both HarmonyOS Sans family names are unavailable and the browser falls back to the next font.

