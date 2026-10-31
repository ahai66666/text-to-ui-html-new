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

