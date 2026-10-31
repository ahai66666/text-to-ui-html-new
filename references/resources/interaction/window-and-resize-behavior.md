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

