# Tool Design Reasoning QA

Run this audit after the initial composition exists and before visual-polish QA. It evaluates whether the tool design is correct for the work, not whether pixels merely look polished.

## Scoring

Score each applicable dimension:

```text
0 = pass
1 = minor issue
2 = structural issue
```

| Dimension | Question |
|---|---|
| Wrong User Context | Does the screen fit the actual user, expertise, frequency, and work environment? |
| Wrong Tool Type | Does the composition support the classified primary job? |
| Wrong Work Object | Is the main object and its identity, state, and relationships clear? |
| Workflow Break | Can the primary workflow reach success? |
| Action Scope Confusion | Are global, page, pane, object, selection, and field actions placed in the correct scope? |
| State Preservation Failure | Are filters, sorting, scroll, selection, edits, and context preserved when required? |
| Module/Profile Mismatch | Does each module follow its responsibility rather than a global visual style? |
| Density Mismatch | Does information density fit task frequency and decision needs? |
| Decoration Over Task | Does visual treatment compete with scanning, input, or action clarity? |
| Missing Failure or Recovery | Are important error, partial-success, retry, undo, and recovery paths represented? |
| Unsupported Data or Capability | Did the design invent metrics, permissions, claims, or product behavior? |
| Design-System Drift | Did the screen introduce unapproved tokens, components, states, or interaction behavior? |

## Blockers

Do not proceed to delivery while any blocker remains:

- the primary task cannot be completed
- the primary tool type or work object is materially wrong
- a destructive or irreversible action lacks confirmation, consequence visibility, or recovery where recovery is possible
- a frequent workflow loses required filters, scroll, selection, or edit state
- module expression reduces data legibility or operational precision
- the design relies on unsupported capabilities, metrics, permissions, or claims

## Repair Routing

- Wrong context, type, object, or workflow: return to Tool Discovery and restructure the page.
- Action scope or state preservation: change interaction and region ownership.
- Module/profile or density mismatch: change module composition, not only colors.
- Decoration over task: remove decoration and rebuild hierarchy with typography, spacing, alignment, and grouping.
- Missing failure or recovery: add the state and the user path back to useful work.
- Unsupported content: remove it or label safe sample data explicitly.
- Design-system drift: resolve through approved tokens, components, and documented project overrides.

After repair, score again. Structural scores must be zero before visual QA. Record the remaining minor issues and total score in the Requirement Contract or `design-strategy.md`.

## Completion Threshold

- all blockers: zero
- structural issues: zero
- total score: 4 or lower

Then run the separate visual and interaction QA references.

