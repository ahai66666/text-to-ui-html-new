# Adaptive Requirement Specification

Use this reference at the start of every text-to-ui run. The goal is not to force the user to complete a form. The skill should understand the request, inspect available materials, ask only high-impact questions, infer the rest, and record its assumptions.

## Contents

1. Intake Principle
2. Three Decision Layers
3. Adaptive Question Policy
4. User Input Guidance
5. Proposed Solution Confirmation
6. Generated Requirement Contract
7. Fixed HarmonyOS Defaults
8. Anti-Patterns

## 1. Intake Principle

```text
User supplies facts, goals, preferences, and corrections.
The design system supplies hard constraints.
The model supplies tool-task reasoning, information architecture, interaction coverage, and sensible defaults.
```

Do not read a fixed questionnaire aloud. Generate questions from the uncertainty of the current task.

For new pages, record the task brief in the blueprint and proceed to the first
working preview. A build request authorizes this work. Ask only for a missing
decision that materially changes the primary task or Pattern. HTML handoff follows acceptance; canvas import belongs to a separate skill. This reference adds no approval gate.

The only shortcut is an exact micro revision to an already approved page or
component that cannot change hierarchy, workflow, permissions, action scope, or
layout Pattern. Restate that change contract, apply it, and return to the same
preview review loop. If any of those boundaries change, restart this intake gate.

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

## 3. Adaptive Question Policy

Before asking anything:

1. Read the latest user request.
2. Inspect supplied screenshots, Pixso document/top-level Frame references, code, design files, and assets.
3. Record the workflow requested by the user, or default to `html-first` and state that non-blocking assumption.
4. Apply known platform and design-system defaults.
5. Read `tool-design-intelligence.md` and classify the likely user, work object, primary task, tool type, workflow, risk, and state-preservation needs.
6. Identify only uncertainties that would materially change the tool structure, workflow, risk behavior, or delivery scope.

Ask 1–3 concise questions in one round when useful. Ask fewer when possible and default to one round. Do not ask for information already present in the conversation or project files.

High-value question areas:

- Who performs the work, how often, and under what time pressure?
- What is the main work object and what must the user do to it?
- What starts the workflow, what counts as success, and what context must remain stable?
- Which failure, recovery, destructive, publishing, privacy, or permission behaviors materially affect the design?
- Is there existing product behavior, code, Pixso, or a design system with higher authority?

Ask a blocking question only when different answers would create substantially different products, workflows, permissions, sensitive-data behavior, or delivery scope. Otherwise continue with reasonable assumptions.

After questions or safe inference, record the task brief in the blueprint and
continue generation. Briefly state consequential assumptions. Incorporate user
corrections without restarting a confirmation loop.

## 4. User Input Guidance

A single sentence is sufficient. The user may improve control by supplying any of:

```text
Product and target users
Primary task
Main work object
Usage frequency and time pressure
Required screens/functions
Interactions that must work
Important failure, recovery, permission, or irreversible behavior
Existing design/code/assets
References and style preferences
Forbidden content or behavior
Demonstration scope
```

Do not require the user to translate their idea into design-system language.

## 5. First preview planning

Use this optional brief when explaining a material design choice:

```markdown
## Proposed Solution
- Design goal:
- Page structure (tree):
  ```text
  ├── 登录
  ├── 注册
  └── 找回密码
  ```
- Key interactions and states:
- Technology/output:
- Assumptions:
- Open questions:
- Assumptions requiring a user decision, if any:
```

Rules:

- Ask at most three high-impact questions in the same message; infer low-risk details.
- Continue automatically when the request provides enough information.
- Only a specific unresolved user decision pauses dependent work.

Read the selected Pattern and relevant component interfaces before composing
the page. Save planning decisions alongside the project, then generate it.

The proposal must also expose the task model: primary user, work object, start
state, success state, failure/recovery path, and state that must be preserved.
This is the part that prevents the Skill from jumping directly from a one-line
request to a generic page.

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

## 7. Fixed HarmonyOS Defaults From Native References

Unless the current workflow requires otherwise:

- Use a `1728 × 1152px` HarmonyOS PC desktop canvas for HTML reference viewports, screenshots, and final comparison. If another desktop size is approved, record it in the requirement contract and use it consistently across the HTML runtime and every QA checkpoint.
- Start with a persistent left navigation and a flexible Main region for a full application.
- Use the two-pane shell for browsing, dashboards, settings, stores, media, and content hubs.
- Add a fixed `360px` Secondary Pane for repeated list-to-detail workflows.
- Apply 16px on all four sides of the Secondary Pane scrolling content wrapper; do not add a second outer List inset.
- Let the right Main/Detail/Editor region fill all remaining width.
- Default Main Content and Main Detail to 24px left/right, 16px top, and 0px bottom on their direct scrolling wrapper. Use `edge-aligned` only when the requirement contract explicitly names a canvas, grid, media, map, or file surface that must reach the pane boundary; keep readable content inside the same directional safe area.
- Use the tool-workspace shell when tabs, address/search, command toolbar, and canvas/data view are central to the task.
- Add a separate Inspector only when contextual properties are necessary; do not add it as decoration.
- Use a `64px` non-dialog Global Title Layer.
- Keep the Titlebar component transparent and match each shell segment to the surface of the pane below it. Do not add a horizontal divider below the Primary Navigation or Secondary Pane title segment.
- Put app icon and product name in the top-left Brand Anchor.
- Put every page-global Primary action in the Primary Navigation Shell between Brand Anchor and Sidebar navigation. Use one 40px-high icon + text Primary Button. The Primary Navigation owns a 16px horizontal inset and the action slot adds `--space-3` (8px) horizontal inner padding, aligning the button with the Brand Anchor / Logo's 24px content axis. Keep 8px from Brand Anchor / Titlebar to the button and 12px from the button to the first Sidebar navigation component, using the dedicated action-slot tokens rather than changing whole-navigation or menu gaps. Do not add another page-global Primary elsewhere. In collapsed navigation, keep it as a 40px icon-only Primary Button with an accessible name and Tooltip, and preserve the dedicated compensation that centers it in the 64px rail. Place Secondary, Ghost, Icon, and local buttons elsewhere according to scope.
- Put page title, search, tabs, or view actions in the title context area as the workflow requires.
- Pin application actions and window controls to the top-right, preserving a draggable region.
- Allow Primary Navigation, Secondary Pane, Main Content, and Inspector to scroll independently when needed.
- Keep the system taskbar, launcher, tray, clock, and desktop search outside the application output.
- Treat immersive image, weather, media, and promotional backgrounds as product-specific visual directions, not universal shell defaults.

These defaults come from the bundled native screenshot references. Use `harmonyos-layout-patterns.md` for pattern selection and inspect relevant screenshots only when additional evidence is needed.

## 8. Anti-Patterns

- Do not ask every possible question before making progress.
- Do not expose the full template to the user unless they request it.
- Do not invent a conflicting visual language when approved sources exist.
- Do not use a three- or four-pane shell when a two-pane workflow is sufficient.
- Do not mistake missing detail for permission to ignore critical interactions.
- Do not hide model assumptions; record the ones that materially affect output.
- Do not classify an operations workbench as a marketing or campaign surface.
- Do not apply one global expression level to every module.
