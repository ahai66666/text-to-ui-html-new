## 2. Three Decision Layers

### Hard Constraints

Never change these without explicit user approval:

- Target platform: HarmonyOS PC desktop application.
- Required output for the recorded workflow: HTML-first refinement, visual-first, or direct HTML. Use HTML-first refinement when the user does not explicitly select another mode.
- Approved design-system tokens and component rules.
- Approved layout rules and window dimensions.
- Default generation canvas: HarmonyOS PC desktop `1728 × 1152px` for HTML reference viewports, screenshots, and final visual comparison. A different desktop size requires explicit approval and must be recorded in the requirement contract.
- Explicitly required screens, functions, content, and interactions.
- Explicitly forbidden styles, content, technologies, or behaviors.
- Existing project design truth with higher authority than the bundled baseline.

### Soft Preferences

Honor these by default, but adjust when usability or consistency requires it:

- Style and brand keywords.
- Reference products.
- Information density.
- Preferred shell or pane count.
- Motion strength.
- Content volume.
- Preferred HTML page style when no existing design reference determines it.

Record the reason when a soft preference is adjusted.

### Model Decisions

Infer these when the user has not specified them:

- Information hierarchy.
- Primary and optional secondary tool type.
- Work-object model and action scope.
- Simplest suitable shell pattern.
- Component composition.
- Secondary actions.
- Realistic labels, copy, and demonstration data.
- Loading, empty, error, success, disabled, selected, and hover states.
- Navigation relationships.
- Which low-risk interactions can be simulated in the demonstration.

Component composition is constrained by the canonical registry. Existing
registered HTML components are mandatory. A page-owned implementation is a
documented exception for a missing or genuinely product-specific capability,
not an alternate styling path for a registered component.

