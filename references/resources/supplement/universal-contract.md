## Universal Contract

- Minimum pointer target is 32px for compact inline controls and 40px for primary desktop controls.
- Every interactive component exposes Default, Hover, Focus, Pressed or Selected, and Disabled states when applicable.
- Composite controls use roving focus or native focus order and never trap focus unless they are modal.
- Overlays close with Escape when the task permits dismissal and restore focus to the trigger. Dialog does not dismiss on outside click. Only modal behavior variants use an overlay, make the background inert, lock background scrolling, and trap focus.
- Loading, Empty, Error, and Success are workflow states, not decorative variants.
- HTML uses semantic elements, canonical component identities and reusable classes.

