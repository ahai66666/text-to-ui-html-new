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

