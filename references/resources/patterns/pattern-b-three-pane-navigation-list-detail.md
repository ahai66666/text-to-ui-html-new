### Pattern B: Three-Pane Navigation + List + Detail

Observed in Notepad and applicable to mail, contacts, tasks, file lists, and management tools.

```text
┌──────────────┬─────────────────┬────────────────────┐
│ Brand        │ Search          │ Detail ops .... win │
│ New          │                 │                     │
│ Primary Nav  │ List context    │ Detail / Editor    │
│              │ Secondary List  │                    │
│              │                 │                    │
└──────────────┴─────────────────┴────────────────────┘
```

- Primary Navigation defines the high-level information space.
- Secondary Pane shows items, records, folders, conversations, or documents. Its scrolling content wrapper places both the standalone Search frame and the List Card state envelope 16px from each pane edge through `--layout-secondary-list-card-inset-x`. The title, toolbar/meta copy, list states, and List Card content align to the nested 24px `--layout-secondary-content-axis-x`.
- Main Detail remains the largest flexible region. Its default scrolling content wrapper owns 24px left/right, 16px top, and 0px bottom through the directional Main Detail padding tokens.
- Selection in the Secondary Pane updates Main Detail without replacing the entire shell.
- Compose the Secondary List Pane in this order: standalone Search in the transparent Titlebar segment, one scrolling inset owner, List title + action row, optional meta row, then the List collection. Search occupies the complete Secondary Pane Titlebar row at the 16px surface axis; never place the title or an adjacent action button in that row. The first content row is 40px high through `--height-list-heading`, uses `title-s` on the left, and places the related Ghost operation group on the right. Count or auxiliary context moves to the optional meta row rather than taking the title action position. Empty, loading, and error states replace the collection but remain inside the same scrolling inset owner.
- The Renderer-owned scrolling inset owner applies 16px horizontally, 8px at the top, and 0px at the bottom. Each List Card state background fills the available width inside that 16px surface inset. Each row then applies `--layout-secondary-list-card-padding-x` (8px), so row content lands at 24px. The title/action row, meta row, and list states use the same nested 8px alignment inset; Search in the Titlebar uses the 16px surface axis.
- The List collection is page-owned content inside the Renderer body, not a new Pattern or an automatic `List Item` mapping. Give every card a stable content-slot ID and explicit sub-slots such as `leading`, `content`, `title`, and `description`; card types may vary by business object while preserving the same pane envelope and row axes.
- Apply the vertical-axis alignment principle by edge type: standalone Search and List Card state backgrounds share the 16px surface axis; title, toolbar/meta copy, empty/loading/error content, and List Card content share the 24px content axis. Selected, Hover, and Pressed must not resize either axis.
- The top-left of Main Detail is its pane-global operation slot aligned with the Main Detail boundary. Put operations affecting the complete current detail/editor workspace there, but keep page-global creation in the Primary Navigation Shell. Keep card-, field-, section-, selection-, and inline-scoped actions next to their targets. Do not repeat the list or page title there.
- In the component-gallery documentation preview for this List-focused Pattern, keep the Secondary List Pane realistic and interactive while rendering Primary Navigation and Main Detail as quiet neutral skeleton context. Preserve their true widths, surfaces, insets, and dividers. This focus treatment is documentation-only; generated product screens render real content in every required pane.

