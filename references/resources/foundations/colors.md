本文件用于共享规范的精确维护查询。当前 Token、组件契约和 Pattern 数据决定数值；示例不授权覆盖标准运行时。标题栏遵守当前 titlebar 主题与适配器。

## 4.1 Colors

Color source of truth: packages/tokens/src/tokens.colors.css and token-runtime-map.json. Use the bundled canonical CSS variables and their semantic aliases; do not introduce a second palette. Core families remain Brand, Neutral Dark, Neutral Light, Function and Multi. Opacity scales use the canonical 8-digit hex values. Shared mapping metadata is for independent consumers, not an HTML execution step.

### Core

```css
--color-bg: var(--color-neutral-light-100);
--color-bg-subtle: var(--color-neutral-dark-05);
--color-surface: var(--color-neutral-light-100);
--color-surface-raised: var(--color-neutral-light-100);
--color-surface-muted: var(--color-neutral-dark-05);
--color-titlebar-normal-bg: transparent;
--color-titlebar-unfocus-bg: transparent;
--color-overlay: var(--color-neutral-dark-40);
--color-dialog-bg: var(--color-surface-raised);
--color-modal-bg-white: var(--color-surface-raised);
--color-modal-bg-gray: var(--color-surface-muted);
--color-secondary: var(--color-neutral-dark-05);
--color-secondary-hover: var(--color-neutral-dark-10);
--color-accent: var(--color-brand-100);
--color-accent-hover: var(--color-accent);
--color-accent-hover-layer: var(--color-neutral-dark-05);
--color-sidebar-bg: var(--color-neutral-dark-05);
--color-sidebar-accent: var(--color-neutral-dark-05);
--color-sidebar-accent-text: var(--color-brand-100);
--color-sidebar-selected: var(--color-brand-10);
--color-sidebar-selected-text: var(--color-brand-100);
--color-tab-list-bg: var(--color-neutral-dark-05);
--color-tab-text: var(--color-neutral-dark-60);
--color-tab-hover-bg: var(--color-neutral-dark-10);
--color-tab-selected-bg: var(--color-white);
--color-tab-selected-text: var(--color-neutral-dark-90);
--color-tooltip-bg: var(--color-surface);
--color-tooltip-text: var(--color-text);

--color-input-border: transparent;

/* Fields on white/default page surfaces. */
--color-input-bg: var(--color-neutral-dark-05);
--color-input-bg-on-default: var(--color-neutral-dark-05);
--color-input-hover-bg: var(--color-neutral-dark-10);
--color-input-hover-bg-on-default: var(--color-neutral-dark-10);
--color-input-focus-bg: var(--color-neutral-dark-05);
--color-input-focus-bg-on-default: var(--color-neutral-dark-05);
--color-input-error-bg: var(--color-neutral-dark-05);
--color-input-error-bg-on-default: var(--color-neutral-dark-05);

/* Fields on gray/subtle page surfaces. */
--color-input-bg-on-subtle: var(--color-white);
--color-input-hover-bg-on-subtle: var(--color-white);
--color-input-hover-bg-on-subtle-layer: var(--color-neutral-dark-05);
--color-input-hover-border-on-subtle: var(--color-white);
--color-input-focus-bg-on-subtle: var(--color-white);
--color-input-error-bg-on-subtle: var(--color-white);

--color-input-error-border: var(--color-function-danger-100);
```

Input, search, textarea, and form Select controls use the same state system. Accent hover keeps `--color-accent-hover` as its base and applies `--color-accent-hover-layer` above it.

Input, search, textarea, and form Select Focus states have no border or outer focus outline. Preserve the approved focus background and text caret; Error keeps its danger border. Render remaining field outlines as inset strokes, or reserve their maximum width with a transparent border, so visual states never change component dimensions. On subtle surfaces, compose the hover background from the white base plus the `neutral-dark/05` layer.

Sidebar and its Titlebar Brand Anchor use the subtle
`--color-sidebar-bg` surface (`--color-neutral-dark-05`) over the white
application base. They form the secondary visual layer: persistent and
structurally clear, but quieter than the user's primary content.

### Text

```css
--color-text: var(--color-neutral-dark-90);
--color-text-muted: var(--color-neutral-dark-60);
--color-text-subtle: var(--color-neutral-dark-40);
--color-text-inverse: var(--color-neutral-light-100);
--color-text-brand: var(--color-brand-100);
--color-link: var(--color-neutral-dark-100);
```

Links must use an underline or another non-color affordance so they remain distinguishable from body text.

### Icon

```css
--color-icon: var(--color-neutral-dark-90);
--color-icon-muted: var(--color-neutral-dark-60);
--color-primary-level-unselected: var(--color-icon-subtle);
--color-icon-subtle: var(--color-neutral-dark-40);
--color-icon-inverse: var(--color-neutral-light-100);
```

### Border

```css
--color-border: var(--color-neutral-dark-10);
--color-divider: var(--color-neutral-dark-20);
--color-focus-ring: var(--color-brand-100);
--border-width-divider: 0.5px;
--border-width-input-default: 0px;
--border-width-input-hover: 0px;
--border-width-input-hover-on-subtle: 2px;
--border-width-input-error: 1px;
--opacity-input-disabled: 0.3;
```

### Brand

```css
--color-primary: var(--color-brand-100);
--color-primary-text: var(--color-neutral-light-100);
```

Primary hover and pressed states keep `--color-primary` as the base and apply the matching state layer above it. Do not flatten these layered states into unrelated palette values.

### State

```css
--color-success: var(--color-function-success-100);
--color-success-subtle: var(--color-function-success-10);
--color-warning: var(--color-function-warning-100);
--color-warning-subtle: var(--color-function-warning-10);
--color-danger: var(--color-function-danger-100);
--color-danger-subtle: var(--color-function-danger-10);
--color-info: var(--color-brand-100);
--color-info-subtle: var(--color-brand-10);
--color-alert-neutral: var(--color-text-muted);
--color-alert-neutral-subtle: var(--color-neutral-dark-05);
--color-badge-neutral-text: var(--color-text-muted);
--color-badge-neutral-bg: var(--color-neutral-dark-10);
--color-badge-info-text: var(--color-info);
--color-badge-info-bg: var(--color-brand-10);
--color-badge-success-text: var(--color-function-success-100);
--color-badge-success-bg: var(--color-function-success-10);
--color-badge-warning-text: var(--color-function-warning-100);
--color-badge-warning-bg: var(--color-function-warning-10);
```

### Data Visualization

```css
--color-chart-1: var(--color-multi-01);
--color-chart-2: var(--color-multi-02);
--color-chart-3: var(--color-multi-03);
--color-chart-4: var(--color-multi-04);
--color-chart-5: var(--color-multi-05);
```

### Interaction State Layers

```css
--state-layer-hover: var(--color-neutral-dark-05);
--state-layer-pressed: var(--color-neutral-dark-10);
--state-layer-selected: var(--color-neutral-dark-10);
--state-layer-focus: var(--color-brand-10);
--state-disabled-opacity: 0.4;
--state-window-unfocus-opacity: 0.4;
```

`click` is an event rather than a persistent visual state. Components should use `pressed`, `selected`, or `focus` as appropriate.

Disabled is a whole-component state. Apply `--state-disabled-opacity` (40%) once to the component root, including its background, border, text, icon, and indicators. Do not combine it with a separate disabled foreground or background color token, and do not apply opacity independently to nested children.

Window Unfocus is not Disabled. Keep the Titlebar component transparent so the owning shell segment continues to match its pane surface, then apply `--state-window-unfocus-opacity` (40%) only to the application-title group and window-control group.

Overlay uses `--color-overlay`, which directly references `--color-neutral-dark-40` (`#00000066`). Do not add another opacity layer to the overlay element.

