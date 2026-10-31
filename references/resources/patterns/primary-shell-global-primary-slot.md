<!-- tui-scope {"contexts":["global-titlebar","primary-navigation-titlebar"]} -->
### Primary Shell Global Primary Slot

- Place the page's only global Primary Button inside the Primary Navigation Shell, vertically between the Brand Anchor and Sidebar navigation. Every page-global action styled as Primary must use this slot.
- Use it for New Project, New Document, New Task, or the equivalent main CTA. Do not add a second page-global Primary Button elsewhere.
- Expanded mode uses a 40px-high icon + text Primary Button. The Primary Navigation owns a 16px horizontal inset and the action slot adds `--space-3` (8px) horizontal inner padding, placing the button on the same 24px content axis as the Brand Anchor / Logo. Its slot uses `--layout-primary-action-slot-gap-top` (8px) below the Brand Anchor / Titlebar and `--layout-primary-action-slot-gap-bottom` (12px) before the first Sidebar navigation component. Scope these values to the action slot only; they must not become whole-navigation padding or a generic menu/component gap. Collapsed 64px mode uses a 40px icon-only Primary Button with an accessible name and Tooltip, with a dedicated slot compensation that keeps the icon centered in the 64px rail.
- Secondary, Ghost, Icon, and other button variants may appear in Secondary Pane, Main Detail, Titlebar, or local toolbars according to their action scope. Do not move the page-global Primary CTA into those regions. Do not add horizontal dividers around the slot.

<!-- /tui-scope -->
