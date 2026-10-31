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

