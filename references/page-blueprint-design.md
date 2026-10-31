# Page Blueprint Design Contract

`page-blueprint.json` is the model's page-design decision, not a list of
components. It must be complete before `page-bindings.json` is written. The
model first decides how the user completes a job, then the component resolver
finds the smallest registered capabilities that can realize that design.

## Required decisions

The blueprint must contain:

- `user`, `workObject`, `primaryJob`, `successCriteria`, and
  `recoveryPaths`;
- the selected Pattern and all of its regions in canonical order;
- `design.readingOrder`, `design.informationPriority`, a responsibility for
  every region, and a density choice for every region;
- `contentGroups` with stable IDs, region, order, priority, purpose, and the
  data entities they show;
- `dataEntities` with the fields the page actually reads or changes;
- `design.relationships` connecting shared entities or groups, for example
  list selection → detail entity;
- `interactions` with trigger, state change, task outcome, and the context that
  must remain stable;
- `states` and `design.stateMatrix` covering default, selected, empty,
  loading, error, success, or disabled states that matter to the task.

The validator rejects a blueprint that only names three regions or merely
lists components. A page can have a different set of states or actions, but it
must explain the chosen set and include a recovery path for a failed or empty
task.

## Design before assembly

Use this order for every new page:

1. Identify the user, work object, primary task, start state, success state,
   and recovery path.
2. Assign one purpose and one reading priority to each Pattern region.
3. Define the data relationship between groups. Lists and details that show
   the same object must share a stable selection key; counts, filters, and
   selected content must not drift apart.
4. Design one representative list row/card/detail module at the actual Pattern
   width. Decide reading order, primary field, secondary metadata, truncation,
   selected state, and action placement before repeating it.
5. Resolve registered components by semantic context. Existing functional
   components fill slots; a page-owned composite is allowed only for a
   specialized business surface whose missing capability is recorded.
6. Bind the result to the Pattern skeleton and implement the declared
   behavior. Do not use a validation pass to decide the page hierarchy.

Do not start with “include these components”. If the request is component-led,
translate it into a business purpose and information hierarchy first. A
component that has no declared job, group, slot, or behavior is not placed in
the page.

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

## Minimal shape

```json
{
  "schemaVersion": 1,
  "workObject": "message and its related schedule",
  "pattern": { "id": "pattern-b-three-pane" },
  "design": {
    "readingOrder": ["primary-navigation", "secondary-list", "main-detail"],
    "informationPriority": ["message-list", "message-detail"],
    "regionResponsibilities": [],
    "contentDensity": {
      "primary-navigation": "compact",
      "secondary-list": "comfortable",
      "main-detail": "comfortable"
    },
    "primaryActionIds": ["select-message"],
    "secondaryActionIds": [],
    "relationships": [{ "from": "message-list", "to": "message-detail", "kind": "selection" }],
    "stateMatrix": []
  }
}
```

The empty arrays above are only a shape example; a real blueprint must fill
them with the decisions required by the validator.
