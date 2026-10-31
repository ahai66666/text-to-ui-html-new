## 1. Shared Window Anatomy

Most full desktop applications follow this structure:

```text
Application Window
├── Global Title Layer
│   ├── Brand Anchor: app icon + app name
│   ├── Context Area: page title, tabs, search, or page actions
│   └── Window Area: application actions + window controls
└── Workspace
    ├── Primary Navigation Shell
    │   ├── Global Primary Action Slot
    │   └── Sidebar Navigation
    ├── Secondary Pane (optional)
    ├── Main Content / Detail / Canvas
    └── Inspector Pane (optional)
```

The Global Title Layer is transparent and structural, never one separate solid bar. The Titlebar component adds no fill or bottom divider by default. Each shell segment supplies the same surface as the pane directly below it: the Brand segment matches Primary Navigation, the list segment matches Secondary Pane, and the final segment matches Main Content or Main Detail. In a two-column shell no segment has a bottom divider. In a three-column shell only the final Main Detail segment has a bottom divider; Primary Navigation and Secondary Pane remain divider-free. Keep vertical pane dividers continuous through both title and workspace rows.

