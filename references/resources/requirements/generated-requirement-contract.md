## 6. Generated Requirement Contract

Create a compact internal or project-level requirement contract before HTML generation:

```markdown
# Requirement Contract

## Original Request

## Known Facts
- Product:
- Users:
- Scenario:
- Required functions:
- Existing sources:
- Explicit constraints:

## Proposed Solution
- Confirmation status: pending / confirmed
- Design goal:
- Page structure (tree):
  ```text
  ├── Root screen or shell
  │   ├── Primary region
  │   └── Secondary region
  └── Overlay or child flow
  ```
- Key interactions and states:
- Technology choice:
- Design canvas: `1728 × 1152px` by default; approved override:
- Assumptions and open questions:

## Tool Task Brief

### Context
- Product/tool:
- Primary user:
- Usage scenario:
- Frequency and time pressure:
- Existing sources:

### Task Model
- Primary tool type:
- Secondary tool type:
- Main work object:
- Primary task:
- Start state:
- Primary workflow:
- Success result:
- Failure and recovery:
- Permissions or risks:
- State that must be preserved:

### Tool Experience Profile
- Efficiency:
- Density:
- Guidance:
- Assurance:
- Expression:
- Motion posture:
- Material deviations from baseline:

### Information Model
- Primary information:
- Secondary information:
- Object states:
- Main actions:
- Batch actions:
- Global / page / pane / object / selection / field action scopes:

### Initial Page Structure
- Navigation:
- Primary workspace:
- Secondary pane:
- Detail or inspector:
- Toolbar and action placement:
- Required overlays:
- Required UI states:

## Design Decisions
- Selected shell pattern:
- Selection rationale:
- Views and regions:
- Applied HarmonyOS baseline:
- Project exceptions and rationale:
- Core components:
- Component reuse classification: registered / contract-based / custom, with
  registry evidence for every custom exception:
- Required states:

## Interaction Scope
- Must work:
- May be simulated:
- Loading/empty/error/success coverage:

## Model Inference
- Inferred content and sample data:
- Inferred secondary functions:
- Confirmed facts:
- Assumptions:
- Open risks:

## Deliverables And Acceptance
- Selected workflow:
- Workflow selection source: explicit / preferred default
- Initial HTML draft and structural checkpoint, if `html-first`:
- First visible HTML review status: pending / changes-requested / direction-approved
- Direction approval evidence:
- Design strategy file, if required:
- Final frontend views:
- HTML handoff and accepted dependency digest:
- Verification scope:
- Exact final artifact component-reuse verification and runtime evidence:
- Release validation status: blocked-until-direction-approval / in-progress / passed
- Final visible review:
- Primary acceptance flow:
```

Keep this contract concise. It is a tool-task decision record, not a long product requirements document. Platform constants remain authoritative in the layout and interaction references; do not copy their full numeric rules into every contract.

