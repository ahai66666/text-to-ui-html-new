## Pattern B assembly decisions

For `pattern-b-three-pane`:

- primary navigation is the application/folder context;
- secondary list is the browse, search, filter, and selection context;
- main detail is the selected object's reading or editing context;
- search belongs in the secondary title segment;
- detail-wide actions belong in `main-detail-actions`;
- list and detail body content enters the renderer-owned scroll bodies;
- secondary list uses a 16px surface envelope, an 8px vertical scroll-body
  start inset, and a nested 24px readable-content axis;
- main detail uses a symmetric 24px readable-content axis, 16px top, and 0px
  bottom inset;
- the Pattern owns these values. Page CSS may define gaps and internal
  business grouping inside a declared content group, but may not add a second
  pane inset or move a slot into another layer.

The machine-readable source for these decisions is
`assets/design-system/pattern-contracts.json`; its `geometry` block is part of
the Pattern digest and is consumed by layout generation and runtime evidence.

