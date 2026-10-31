# HTML Layout Routing

Choose the Pattern from the user's task before component binding or page code.

- Navigation to content, a dashboard, settings, or a content hub: Pattern A.
- Repeated list to detail, including mail, contacts, tasks, and records: Pattern B.
- Command-heavy tool or canvas workspace: Pattern C.
- Add an inspector to Pattern B or C only when contextual inspection is needed: Pattern D.

Use only the canonical IDs: `pattern-a-two-pane`, `pattern-b-three-pane`, `pattern-c-tool-workspace`, and `pattern-d-inspector`. Resolve the selected Pattern through `assets/design-system/pattern-contracts.json`. Unknown tasks require an explicit Pattern and capability list; do not infer a layout from component inventory.

The Pattern Runtime owns the Global Title Layer, pane order, insets, scroll regions, resize behavior, minimum window, dividers, and declared action slots. Components fill those slots; page content does not recreate the shell.

Pattern B uses one shared title row. Search belongs in `secondary-list-title`; final-pane actions belong in the registered Titlebar's `main-detail-actions` slot. The primary pane owns its 8px top rhythm, the secondary list owns 16px horizontal / 8px top / 0px bottom inset, and Main Detail owns 24px horizontal / 16px top / 0px bottom inset. Do not add a second page wrapper inset.

For Pattern previews and generated pages, use `@text-to-ui/pattern-runtime`. Read `references/harmonyos-layout-patterns.md` and `references/components/titlebar-segments.md` for exact geometry and slots.
