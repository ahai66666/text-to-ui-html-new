### Secondary Pane

- Appears only when users repeatedly select an item before viewing or editing detail.
- Usually fixed or bounded width.
- Has its own title, search, filter, sort, and view controls when needed. Page-global creation does not belong here.
- Uses a divider between itself and Main Detail.
- In Pattern B, applies 16px left/right, 8px top, and 0px bottom padding exactly once on its direct scrolling wrapper. Do not add `--padding-list` around a List already hosted inside this inset; rows fill the available inset width and keep only their component-owned internal padding.

