# Extended Component Specifications

Use this reference for components beyond the core Button, Field, Tabs, Card, Table, and Feedback rules in `assets/design-system/design.md`. Every component must reuse semantic Tokens and preserve native semantics where possible. Its individual contract belongs in `packages/component-contracts/src/components/<id>.json`; `components.json` is rebuilt from those files for compatibility. Verify its real adapter in `apps/component-gallery/index.html#runtime-view`.

## Universal Contract

- Minimum pointer target is 32px for compact inline controls and 40px for primary desktop controls.
- Every interactive component exposes Default, Hover, Focus, Pressed or Selected, and Disabled states when applicable.
- Composite controls use roving focus or native focus order and never trap focus unless they are modal.
- Overlays close with Escape when the task permits dismissal and restore focus to the trigger. Dialog does not dismiss on outside click. Only modal behavior variants use an overlay, make the background inert, lock background scrolling, and trap focus.
- Loading, Empty, Error, and Success are workflow states, not decorative variants.
- HTML uses semantic elements, canonical component identities and reusable classes.

## Navigation And Disclosure

| Component | Anatomy | Required behavior |
|---|---|---|
| Breadcrumb | Nav, link items, separators, current item | Current item uses `aria-current="page"`; collapse only middle ancestors. Ancestor links never use underlines in Default, Hover, Focus, or Visited states; hierarchy is expressed through text/icon color and the standard focus ring. |
| Sub Tabs | Tab list, tab triggers, active panel | Use for a second-level content context below a page title or primary Tabs. Each trigger uses a 36px `--size-10` height, 16px horizontal inner padding, 8px `--gap-subtab-item` spacing, and 8px `--radius-subtab` corners. The tab list has no bottom divider. Unselected triggers use `Body_L`; the selected trigger uses `Subtitle_M`. Default uses `neutral-dark.5` with secondary text; selected uses `brand.10` with `brand.100` text; selected Hover overlays `neutral-dark.5` on `brand.10`; triggers have no shadow. Triggers use `role="tab"`, roving `tabindex`, `aria-selected`, `aria-controls`, and a linked `tabpanel`; Left/Right moves focus and selection while skipping disabled tabs. Do not use Sub Tabs for application-level navigation. |
| Tree View | Tree, hierarchical items, disclosure affordance | Use `role="tree"` with `role="treeitem"`, `aria-level`, `aria-selected`, and `aria-expanded` only on expandable nodes. The item title uses `Body_L`; the leading icon-to-label gap is 8px. Each item is 40px high with 8px left inset at level 1, then +12px for each deeper level (level 2: 20px; level 3: 32px), 12px right inset, 8px corners, and 2px item spacing. An optional trailing slot is right-aligned, uses `Body_M`, and uses secondary text color. Arrow Up/Down moves among visible nodes; Right expands and Left collapses. Selection and disclosure remain separate actions in product flows even when the compact preview combines them. |
| Accordion | Item, header, trigger, panel | Enter/Space toggles; `aria-expanded` and `aria-controls`; single or multiple mode must be explicit. Trigger label and chevron use secondary text color `--color-text-muted`. When multiple Accordion instances are rendered together, place them in the parent-owned `tui-disclosure-group` wrapper so the gap between instances is `--space-5` (16px). |
| Collapsible | Trigger, content | Enter/Space toggles one local region; preserve content state while collapsed. Label and chevron use secondary text color `--color-text-muted`; the fixed icon is vertically centered and expanded state only rotates it 180 degrees. Independent navigation Collapsible groups use a parent-owned `--space-5` (16px) gap, while each heading-to-route-list gap remains `--space-1` (2px). |
| Navigation Menu | List of navigation links | Use links for destinations; selected destination remains visible and keyboard reachable. The single-select container uses content-driven `max-content` width and must not stretch or distribute items to fill the screen. Items remain intrinsic-width and non-shrinking; when the complete menu exceeds its parent, preserve labels and use horizontal overflow instead of equal-width resizing. |
| Menubar | Menubar, menu items, menus | Left/Right moves top-level focus; Down opens; Escape closes and restores focus. Each menu item exposes an optional `item-leading` icon slot, a required `item-label`, and an optional `item-trailing` slot. Leading icons use Lucide Regular at 24px; the icon-to-label gap is `--gap-menu-item-content` (8px). Render the `navigation/chevron-right` 24px trailing icon only when `hasSubmenu` is true, aligned to the trailing edge. |
| Separator | Horizontal or vertical separator | Decorative separators are hidden from assistive technology; semantic separators expose orientation. |
| Sidebar | Header, groups, items, footer, optional rail | It is application navigation, not Tabs; selected route persists across content changes and exposes `aria-current="page"`. Unselected Hover uses `--color-sidebar-accent` and unselected Pressed uses `--state-layer-pressed`; both states preserve the Default text and icon color. Selected uses `--color-sidebar-selected` with `--color-sidebar-selected-text` and remains visually stable during Hover and Pressed. |
| Item | Leading visual, title, description, trailing action | Default, interactive, selected, and disabled states; whole-row action must remain semantically clear. |

## Overlays And Commands

| Component | Anatomy | Required behavior |
|---|---|---|
| Popover | Trigger, positioned content | Only the positioned content surface uses `--shadow-2`. Short contextual task; Escape/outside click closes; focus enters only when content is interactive. |
| Hover Card | Trigger, non-blocking preview | Only the preview surface uses `--shadow-2`. Opens on hover and focus after a short delay; never contains the only essential action. |
| Dropdown Menu | Trigger, positioned menu, menu items | Only the expanded menu surface uses `--shadow-2`; the trigger and items have no shadow. Escape closes and returns focus. |
| Context Menu | Target, menu, menu items | Only the menu surface uses `--shadow-3`. Right-click or Shift+F10 opens at the target; arrows navigate; Escape restores target focus. |
| Dialog | 400px surface, centered 56px title region, content, one or two 40px actions | The outer surface uses `--shadow-4`. Use for short focused flows such as deletion confirmation, update guidance, download progress, or warnings. The Title_S heading keeps the same 8px top inset token as Semi-modal, and there is no top-right close control. Content padding is 24px. One action fills the content width; two actions form equal columns, with Secondary on the left and Primary or Danger on the right. Outside click does not dismiss. |
| Alert Dialog | Dialog surface, title, description, cancel, destructive action | The outer surface uses `--shadow-4`. It is the destructive Dialog variant. Focus begins on the safe action, outside click does not dismiss, and the affected object or scope is named. |
| Semi-modal | Independent S/M/L size, White/Gray surface, 56px header, content, 80px footer | The outer surface uses `--shadow-5`. Default behavior is non-modal. Size is exactly S 480px, M 640px, or L 800px; every size supports both White and Gray surfaces. White surface uses the existing gray Input/Search/Select/Textarea variants; Gray surface uses the existing white variants. Header uses Title_S, 8px top and 24px horizontal padding, a left title, and a right Ghost Icon Button. Content padding is X 24px and Y 0px. Two-column form grids own the 16px `--gap-form-field` row/column gap; same-row fields align title and control starts with no inherited vertical sibling margin. Footer vertically centers existing 40px Secondary and Primary Buttons aligned right. The modal supplies layout only; it must not define child-control styles. Modal mode is an explicit behavioral variant rather than a size or color token. |
| Snackbar | 48px compact live feedback | Uses white `--color-surface`, `--color-text`, and `--shadow-1` on its outer surface. It is non-blocking and short-lived. A distinct Toast has no shadow. |

## Form Composition

| Component | Anatomy | Required behavior |
|---|---|---|
| Form Field / Field | Title, control, optional description and error | Title and control stack vertically. The title uses Body_M (14px / 20px / Regular 400) with primary text color, and title-to-control uses `--gap-field-label` (8px). Adjacent fields use `--gap-form-field` (16px). In a multi-column grid, the grid owns the same 16px row and column gap; same-row fields reset sibling vertical margins and align title and control starts. Labels are programmatically associated; errors use `aria-invalid` and nearby recovery copy. |
| Label | Text bound to a control | Clicking focuses or toggles the control; required/optional status is explicit. |
| Checkbox, Radio, Switch | 20px choice control and visible label | Selection-control labels use Body_M (14px / 20px / Regular 400), primary text color, and the 8px `--gap-choice-label`; this compact exception does not change the Body_L rule for 40px Select, Combobox, or Selection Dropdown controls. |
| Search | Optional scope selector, leading search icon, value, optional clear control, advanced-search action | 40px horizontal control. Root gap binds `$space/0` (0px); local spacing comes from segment padding. Value and placeholder use Body_L. |
| Input / Tag Entry | One Input variant with a left label and a flexible underlined editor slot; selected values use removable Chips | This is one shared variant for white and gray contexts, selected with `surface=white|gray`, not two components. The label is Body_L / secondary text; the hint is Body_L / tertiary text; entered text is Body_L / primary text. The outer surface, label, and Chips have no hover treatment or enlarged hover hit area. Hover feedback is limited to the editor underline, changing from `--color-border` to `--color-icon` (primary icon color) without an outer fill, border, or layout shift. Free text stays editable until a suggestion is chosen. Enter opens a filtered listbox; arrows move the active suggestion; Enter or pointer choice commits it as a removable tag; Escape closes without committing. Reuse the Dropdown Menu panel and item visual styles, including its `shadow-2` panel, while preserving combobox/listbox ARIA semantics and `option` roles; this is not a command menu. Reuse the same variant on both surfaces. |
| Combobox | 40px field trigger, value, 16px semantic disclosure icon, search field, popup listbox, options | Trigger, search-field value, and visible options use Body_L (16px / 22px / Regular 400), matching every text-input and standard menu control; its disclosure icon rotates 180° when open. Text filters options; arrows move active option; Enter commits and updates `aria-selected`; Escape or outside click closes. |
| Native Select | Label, native select, 16px disclosure icon | Prefer for small stable option sets when platform-native menus are desirable. The disclosure icon is inset from the right by `--padding-select-x`; trailing content padding reserves the icon, gap, and right inset. |
| Slider | Label, range input, value output | Arrow keys adjust; Home/End reach limits; visible value and min/max semantics are present. |
| Toggle | Toggle button | Uses `aria-pressed`; icon-only variants require an accessible name. |
| Input OTP | Segmented numeric inputs | Auto-advance, Backspace recovery, paste support, and a complete group label. |
| Kbd | Keyboard token | Presentation only; shortcut also appears in accessible text or control label. |

## Loading, Data, And Dates

| Component | Anatomy | Required behavior |
|---|---|---|
| Skeleton | Shape placeholders | Mirrors final geometry; hidden from accessibility; reduced motion disables shimmer. |
| Spinner | Animated indicator | Has accessible loading text when standalone; reduced motion preserves status without rotation. |
| Chart | Plot, axes/labels, legend, data summary | Uses chart tokens, direct labels or legend, and a text alternative; color is never the only differentiator. |
| Calendar | Header, grid, day buttons | Arrow keys move dates, PageUp/Down changes month, selected/today states are distinct. |
| Date Picker | Field trigger with 16px `field/date` Calendar icon, custom calendar popover, month controls, 6×7 day grid, Ghost Clear/Today actions | Client UI uses the tokenized custom popover rather than the browser-native picker. The field icon stays static when the popover opens. Arrow keys move by day/week; Escape closes and returns focus; picked dates commit to the field; selected, today, adjacent-month, Hover, Pressed, and Focus states remain distinct. |
| Time Picker | Field trigger with 16px `field/time` Clock icon, custom white time popover, transparent hour/minute listboxes, Ghost Clear/Now actions, Primary Confirm action | Client UI uses a 24-hour tokenized popover. The list columns have no neutral fill. Selected hour/minute options use Ghost styling: brand text on a transparent resting background; Hover, Pressed, and Focus add only their respective state feedback. The Clock icon stays static when open. Up/Down and Home/End move and select options; Confirm commits, Escape discards the draft, and every close path returns focus to the trigger. Default minute step is 5 minutes. |

## Specialized Content And Layout

| Component | Anatomy | Required behavior |
|---|---|---|
| Aspect Ratio | Ratio-preserving container | Maintains media geometry without layout shift. |
| Attachment | File item, type/status metadata, trailing action menu | Uses the neutral-dark.5 surface; the trailing menu trigger uses a 20px `navigation/chevron-down` icon and opens Preview and Download actions. |
| Carousel | Viewport, slides, previous/next, optional indicators | Buttons are labelled; focus is not moved automatically; auto-play is off by default. |
| Bubble | Incoming/outgoing content bubble | Sender and order are explicit; color and alignment are supporting cues only. |
| Typography | Type specimen and semantic roles | Display, title, subtitle, body, label, and caption map directly to typography tokens. |
