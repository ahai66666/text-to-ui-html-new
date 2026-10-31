# HarmonyOS Desktop Interaction Specification

Use this reference after requirement analysis and before HTML generation. It defines the approved interaction baseline for HarmonyOS PC desktop demonstrations.

## 1. Scope And Source Levels

Huawei's public design documentation is continuously updated and does not label every individual rule as HarmonyOS 5.0-only. This specification therefore separates three authority levels:

```text
OFFICIAL  Huawei explicitly documents the principle or platform capability.
PROJECT   Approved project rule inferred from HarmonyOS desktop conventions.
DEMO      Requirement for the interactive frontend demonstration.
```

Do not describe PROJECT or DEMO rules as verbatim Huawei requirements.

Official references checked for this baseline:

- [HarmonyOS Design](https://developer.huawei.com/consumer/cn/design)
- [HarmonyOS Design Introduction](https://developer.huawei.com/consumer/cn/design/devstart/)
- [HarmonyOS Application Experience Design](https://developer.huawei.com/consumer/cn/app/planning)
- [HarmonyOS PC Application Development](https://developer.huawei.com/consumer/cn/multidevice/pc/get-started/)
- [HarmonyOS Multi-device Best Practices](https://developer.huawei.com/consumer/cn/best-practices/multidevice/)

## 2. Official Platform Principles

- **OFFICIAL:** Support multimodal input appropriate to the device, including mouse, touchpad, and keyboard on HarmonyOS PC.
- **OFFICIAL:** Keep interaction consistent with the current state and users' familiar input habits.
- **OFFICIAL:** Account for free-window, full-screen, split-screen, floating-window, multi-task, and window-drag scenarios where applicable.
- **OFFICIAL:** Preserve layout quality and task continuity across supported window modes and sizes.
- **OFFICIAL:** Use responsive and adaptive behavior to reorganize content rather than merely stretching it.
- **OFFICIAL:** Use motion to explain state transitions, guide the next action, and reduce discomfort during waiting.
- **OFFICIAL:** Consider sound feedback when it improves information delivery.
- **OFFICIAL:** Include accessibility needs in interaction design.
- **OFFICIAL:** Prefer HarmonyOS system components, window patterns, resources, and platform capabilities when they apply.

## 3. Pointer And Mouse

- **PROJECT:** Every pointer-interactive control has a visible Hover response.
- **PROJECT:** Primary click selects, activates, or performs the primary action according to context.
- **PROJECT:** Double-click is reserved for opening file-like, document-like, or list items. It must not be the only discoverable entry point.
- **PROJECT:** Right-click opens a context menu related to the current object or selection.
- **PROJECT:** The wheel scrolls the region currently under the pointer when that region is independently scrollable.
- **PROJECT:** Drag is used only for meaningful movement, reordering, resizing, selection, or transfer.
- **PROJECT:** Drag targets and valid drop locations provide visible feedback.

## 4. Keyboard And Focus

- **PROJECT:** `Tab` moves to the next interactive element.
- **PROJECT:** `Shift + Tab` moves to the previous interactive element.
- **PROJECT:** `Enter` performs the current primary action or activates the focused item.
- **PROJECT:** `Space` activates buttons and toggles checkbox, switch, and similar controls where appropriate.
- **PROJECT:** `Escape` closes the topmost menu, popover, dialog, or cancellable transient state.
- **PROJECT:** Arrow keys navigate within menus, radio groups, tabs, trees, grids, and list-like composite controls.
- **PROJECT:** Every keyboard-reachable element has a visible Focus state, except Input and Search use their approved focus background and text caret without a border or outer focus outline.
- **PROJECT:** Focus order follows the visual reading and task order.
- **PROJECT:** Opening a modal moves focus into it; closing it restores focus to the initiating control.

## 5. Common Shortcuts

### Date Picker

- **PROJECT:** The date field is a button with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`; client surfaces do not expose the browser-native date popup.
- **PROJECT:** Opening the field moves focus to the selected date, otherwise today, otherwise the first visible date.
- **PROJECT:** Left/Right moves one day and Up/Down moves one week. Crossing a month boundary updates the visible month.
- **PROJECT:** Escape closes without changing the selected value and returns focus to the field trigger. Picking a date, Today, or Clear commits the value, closes the popover, and returns focus.
- **PROJECT:** The popover renders a complete 6×7 grid so geometry is stable between months. Adjacent-month dates are muted; selected and today states are visually distinct.

### Time Picker

- **PROJECT:** Use a custom client popover with separate hour and minute listboxes; do not expose the browser-native time popup.
- **PROJECT:** Use 24-hour display by default and a 5-minute step unless the product requires minute-level precision.
- **PROJECT:** Selected Time Picker options use Ghost styling: brand text on a transparent resting background. Hover, Pressed, and Focus use only their matching state feedback; do not use a solid brand Selected fill.
- **PROJECT:** Up/Down moves and selects the adjacent option; Home/End reaches the first or last option in the focused list.
- **PROJECT:** Keep hour/minute changes as a draft until Confirm. Escape or outside click discards the draft; Confirm, Now, and Clear commit and return focus to the field trigger.

Support only shortcuts relevant to the current product:

| Shortcut | Default meaning |
|---|---|
| `Ctrl + A` | Select all in the active scope |
| `Ctrl + C` | Copy |
| `Ctrl + X` | Cut |
| `Ctrl + V` | Paste |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + F` | Search within the active context |
| `Ctrl + S` | Save when the product has editable work |
| `Delete` | Delete the current selection |
| `F2` | Rename in file/item management contexts only |

- **PROJECT:** Do not implement shortcuts whose meaning conflicts with the product context.
- **PROJECT:** Important shortcut actions also require visible UI entry points.
- **DEMO:** Implement the shortcuts included in the requirement contract and test them in the browser.

## 6. Navigation And Selection

- **PROJECT:** Primary Navigation changes the high-level functional space.
- **PROJECT:** In a two-level Primary Navigation Shell, bottom-left icon-only first-level navigation changes the high-level functional space; the Sidebar above it exposes the second-level routes for that space. This is the client's only first-level menu and it uses pinned Lucide Regular semantic aliases, with no Filled exception. Unselected first-level icons use the tertiary icon color; Selected uses the brand foreground without a background fill. Hover changes only the background feedback and preserves the icon color.
- **PROJECT:** The second-level Sidebar may contain one or more collapsible menu groups. Activating a group heading toggles only that group's route list, updates `aria-expanded`, and preserves the current route selection while collapsed.
- **PROJECT:** First-level and second-level navigation preserve independent Selected states. Switching the first level updates the second-level context without presenting both levels as one flat list.
- **PROJECT:** The Primary Navigation collapse control reduces the shell navigation column from 240px to 64px, hides the Brand Logo/name and route labels, preserves selection, and reveals the expand control in the former Logo position. Collapse/expand controls expose `aria-expanded` and `aria-controls`, support pointer plus Enter/Space activation, and transfer focus to the visible counterpart.
- **PROJECT:** In a three-pane shell, Secondary Pane selection updates Main Detail without replacing the entire shell.
- **PROJECT:** Secondary Page has two forms. The continuation form replaces only the owning Main pane while preserving the application shell and parent route selection; its leading group is a Ghost Back Icon Button immediately left of the pane-aligned `Titlebar_L` title (for example, `项目设置`), and Back restores the parent view, scroll/filter/selection state, and focus to the opening control. The new-page form opens an independent vertical page with standalone `Titlebar S` (40px) at the top and task content below; it does not retain the parent Sidebar or pane layout. Do not add a continuation child title as another Sidebar route.
- **PROJECT:** An unspecified Icon Button uses the Ghost variant: transparent at rest, state-layer background on Hover and Pressed, and no persistent fill. Secondary Icon Button is explicit rather than default.
- **PROJECT:** Secondary List row Selected, Hover, and Pressed backgrounds keep the fixed 16px pane inset and may extend 8px beyond the shared 24px content axis on both sides. State changes never move row content or resize the selection envelope.
- **PROJECT:** Every Main Detail pane-global action is placed in the Titlebar `main-detail-actions` slot of the Global Title Layer. The slot accepts 0..n `ghost` Buttons in exactly two modes: `icon` and `icon-text-ghost`. In a three-pane shell it is the default home for all operations scoped to the complete third pane. The group begins 16px after the Main Detail divider and is ordered by task priority. Actions scoped to a card, field, section, selected object, or inline content remain next to that target; application-wide actions not owned by Main Detail and window controls remain at the far right.
- **PROJECT:** Main Detail business actions use an explicit uniform-mode overflow contract. Every business action in one group is either `icon` or `icon-text-ghost`; mixing the two modes is forbidden. A final `Icon Button/Ghost/Default` with semantic alias `action/more` is the sole icon-only exception and is always kept as the overflow trigger. With `actionOverflow.strategy = "collapse-to-more"`, the renderer measures the available Titlebar width and moves only non-fitting business actions into the More menu in their original order, preserving the group's chosen mode. The More trigger, system actions, and window controls are never removed. Static design output shows the visible actions plus the More trigger, not an open menu.
- **PROJECT:** Search exposes two independent, optional, configurable query-builder slots: `scope-selector` and `advanced-search`. Enable either slot according to the product need; they may also coexist. Configure `scope-selector` with `scopeOptions`, `scope` / `defaultScope`, `scopeLabel`, and `onScopeChange` / `update:scope`; it appears before the search icon, uses a native Select, and defaults to the first supplied option. Configure `advanced-search` with `advancedSearch`, `advancedSearchLabel`, and `onAdvancedSearch`; it is a trailing small Ghost text button with the semantic secondary text Token `color.text-muted`, defaults to `高级`, and opens the advanced-search layer. When both are present, the stable order is `scope-selector`, `leading`, `value`, `clear`, then `advanced-search`.
- **PROJECT:** Selected items maintain a stable Selected state.
- **PROJECT:** Preserve reasonable navigation, selection, filter, scroll, and draft state when users move between related views.
- **PROJECT:** Multi-select uses visible checkboxes or familiar `Ctrl`/`Shift` selection behavior when appropriate.
- **PROJECT:** Back, close, and navigation actions must not silently discard unsaved work.
- **PROJECT:** In an HTML demonstration without a host navigation stack, `Escape` may provide a documented recovery path from the Secondary Page to its parent, but the visible Back button remains the primary control.
- **DEMO:** At least one complete primary navigation and selection flow must work end to end.

## 7. Window And Resize Behavior

- **OFFICIAL:** HarmonyOS PC supports free-window, full-screen, split-screen, floating-window, drag, and multi-task scenarios where applicable.
- **PROJECT:** The project baseline supports a minimum window size of `1100 × 720px`.
- **PROJECT:** Primary Navigation and Secondary Pane keep their approved widths unless a specific collapse rule is defined.
- **PROJECT:** Main Detail fills the remaining width.
- **PROJECT:** The Global Title Layer and window controls remain stable while content regions scroll.
- **PROJECT:** Resizing must not reset selection, user input, task progress, or unsaved drafts.
- **PROJECT:** Preserve primary actions and task-critical information before secondary content when space becomes constrained.
- **DEMO:** Verify the default `1728 × 1152px` viewport and minimum `1100 × 720px` viewport.

HTML demonstrations may visually simulate window controls. They must not claim to control the host browser window unless that capability is actually implemented.

## 8. Overlay Selection

Use the lightest overlay that supports the task:

| Pattern | Use |
|---|---|
| Tooltip | Explain an unfamiliar icon or concise control meaning |
| Popover | Small contextual information or a short local task |
| Dropdown Menu | A compact set of commands or options |
| Dialog | A short fixed-width decision or focused flow such as destructive confirmation, update guidance, download progress, or a warning |
| Semi-modal | A more complex form or workflow that needs a larger S/M/L surface; use non-modal by default and opt into modal behavior only when background interaction must stop |
| Side Panel | Auxiliary task or properties that should remain beside Main Content |
| Toast / Snackbar | Non-blocking result or short-lived status feedback |

- **PROJECT:** Do not use Dialog for ordinary navigation or low-risk acknowledgement.
- **PROJECT:** Destructive confirmation identifies the affected object or scope.
- **PROJECT:** Dismissal via `Escape`, close control, and outside click follows the safety needs of the task; destructive or incomplete tasks must not be dismissed accidentally.
- **PROJECT:** Dialog is fixed at 400px, has a centered title and no top-right close control. Semi-modal has independent S 480px, M 640px, and L 800px size variants, each supporting either White or Gray surface; it has a left-aligned title and a right Ghost close control. White surface uses gray form components, while Gray surface uses white form components.
- **PROJECT:** Non-modal is the default Semi-modal behavior: no overlay, no background lock, and `aria-modal="false"`. Modal mode uses the overlay, background inertness, scroll lock, focus constraint, and `aria-modal="true"`. This behavior choice is not represented as a design token.
- **PROJECT:** Wide-screen selection and adjustment tasks may use a side modal/panel instead of stretching a bottom sheet across the window.

## 9. Forms And Validation

- **PROJECT:** Use the approved client text hierarchy: Body_L (16px / 20px / Regular 400) for visible primary content and standard 40px controls; Body_M (14px / 16px / Regular 400) for secondary copy and Checkbox, Radio, or Switch labels; Body_S (12px / 14px / Regular 400) for references, helpers, status labels, and supporting prompts; Caption_M (10px / 12px / Regular 400) only for extremely small auxiliary notes. Tabs and 28px Small Buttons also use Body_M. `Caption_L` is deprecated.

- **PROJECT:** Table headers use muted Body_M (14px / 16px / Regular 400). Table data cells use Body_L (16px / 20px / Regular 400) with Regular 400 weight; neither is bold by default. Status and helper text use Body_S.

- **PROJECT:** Card titles use Title_S (20px / 28px / Bold 700). Card body content keeps its component-specific Body or Caption role.

- **PROJECT:** A standard Form Field stacks title above the content control. The title uses Body_M (14px / 20px / Regular 400) and the primary text color; title-to-control spacing is the 8px `--gap-field-label` token. Adjacent fields, including row and column gaps in a multi-column form, use the 16px `--gap-form-field` token.
- **PROJECT:** Text entered or displayed inside Input, Search, Textarea, field Select/Combobox, Date Picker, Time Picker, and Input OTP always uses Body_L (16px / 22px / Regular 400). Popup menu options and helper text retain their own component typography.
- **PROJECT:** Allow users to type without disruptive validation on every keystroke unless immediate validation is necessary.
- **PROJECT:** Run complete validation on blur or submit according to field semantics.
- **PROJECT:** Place field errors near the affected control and explain how to resolve them.
- **PROJECT:** On failed submit, move focus to the first invalid field when practical.
- **PROJECT:** Prevent duplicate submission while a request is in progress.
- **PROJECT:** Disabled controls are visually disabled and cannot be activated.
- **PROJECT:** Success produces clear visual feedback and the expected next state.
- **DEMO:** Demonstrate at least one valid and one invalid path for forms central to the primary workflow.

## 10. State Feedback

Consider these states for every important component or workflow:

```text
Default
Hover
Pressed
Focus
Selected
Loading
Empty
Error
Success
Disabled
```

- **PROJECT:** Include only states relevant to the component, but never omit a state required by the workflow.
- **PROJECT:** Feedback should appear close to the action or affected content.
- **PROJECT:** A single-line Alert / announcement is 40px high and uses `Status Icon + Detail + Text Action + Close`. Its left padding is 8px, right padding is 12px, and the gap between the 20px circular status icon and `subtitle-s` detail is 8px. Detail text always uses the primary text color `--color-text`; only the status icon uses the semantic status foreground. Text action reuses the Small Ghost Button component, while close uses the primary icon color `--color-icon`; together they form one aligned trailing group. Close dismisses only that announcement, while the text action performs the named recovery, details, or undo path.
- **PROJECT:** Show progress or stage information for longer tasks when progress is meaningful.
- **PROJECT:** Preserve user input when recoverable errors occur.
- **DEMO:** Interactive states must be reachable, not only drawn as static examples.

## 11. Undo And Destructive Actions

- **PROJECT:** Prefer immediate action plus Undo for safely reversible operations.
- **PROJECT:** Confirm irreversible or high-impact operations before execution.
- **PROJECT:** Batch destructive actions show the number and scope of affected items.
- **PROJECT:** Closing unsaved content offers Save, Discard, and Cancel when each choice is meaningful.
- **PROJECT:** Do not use a success message as a substitute for Undo when recovery is expected.

## 12. Motion, Sound, And Accessibility

- **OFFICIAL:** Motion supports guidance, transition continuity, and waiting feedback.
- **PROJECT:** Motion must explain causality and hierarchy, not decorate every interaction.
- **PROJECT:** Respect reduced-motion preferences when the frontend environment exposes them.
- **OFFICIAL:** Sound may provide interaction feedback and improve information delivery.
- **PROJECT:** Do not rely on sound alone; pair it with visual feedback.
- **OFFICIAL:** Accessibility needs are part of the experience baseline.
- **PROJECT:** Use semantic controls, accessible names, keyboard reachability, visible focus, sufficient contrast, and state announcements where available.

## 13. Interactive Frontend Demonstration

The demonstration does not require a production backend, but it must implement the agreed experience:

- Navigation and selection.
- Pointer Hover, Pressed, and Focus behavior.
- Required keyboard operation and shortcuts.
- Form entry and validation where applicable.
- Menus, popovers, dialogs, and panels used by the primary workflow.
- Loading, empty, error, success, and disabled paths relevant to the task.
- Window resizing at approved viewports.
- Confirmation or Undo for important destructive actions.

Simulated data and delayed responses are acceptable when documented in the requirement contract. Visually accurate but inert controls are incomplete.

## 14. Per-Interaction Record

For each key interaction, define:

```markdown
## Interaction Name
- User goal:
- Trigger:
- Preconditions:
- State transition:
- Visual feedback:
- Keyboard equivalent:
- Success result:
- Error result:
- Undo or recovery:
- Persistence across navigation/resize:
- HTML component and DOM representation:
- Frontend implementation:
- Test steps:
```

Keep the record concise and focus on interactions that materially affect the demonstration.

## 15. Interaction QA Gate

Before delivery:

- Exercise the primary workflow from start to success.
- Exercise one relevant error or recovery path.
- Verify mouse/pointer feedback.
- Verify keyboard focus order and relevant shortcuts.
- Verify overlay focus and dismissal behavior.
- Verify state preservation across navigation and resizing.
- Verify at `1728 × 1152px` and `1100 × 720px`.
- Confirm rendered HTML states and frontend behavior describe the accepted interaction model.
