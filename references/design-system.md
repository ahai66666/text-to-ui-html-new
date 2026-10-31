# Design System and design.md

Use this reference whenever the user wants repeatable UI quality, multiple pages, a project rather than a one-off screen, or asks whether component/style libraries are needed.

## Contents

1. Why This Step Matters
2. Tool Context
3. Design-System State
4. Style Library
5. Component Library
6. design.md
7. Reuse Rules
8. Authority Domains

## Why This Step Matters

High-fidelity output is more controllable when Pixso and HTML are both constrained by the same foundations:

- Product understanding defines what the page should emphasize.
- Style library defines visual language.
- Component library defines reusable UI behavior and states.
- `design.md` preserves decisions so future pages do not drift.

For one-off experiments, keep this lightweight. For reusable products, make it explicit.

## Tool Context

Before designing, summarize:

- Product: what it is.
- Users: who uses it.
- Primary tool type and work object.
- Primary goal: what work the page must make fast, clear, and safe.
- Main action: inspect, manage, process, configure, create, edit, browse, organize, command, or analyze.
- Experience profile: efficiency, density, guidance, assurance, expression, and motion posture.
- Information priority: what must be seen, decided, and acted on first.

Read `tool-design-intelligence.md` before choosing a visual direction. The design system implements the tool strategy; it does not replace task analysis.

## Design-System State

Classify the available project system before creating new visual rules:

- `authoritative`: approved, coherent Pixso variables/components, project tokens, and reusable components exist.
- `partial`: useful foundations exist but important categories or mappings are missing.
- `conflicted`: approved-looking sources disagree or local pages have material drift.
- `absent`: no reliable project system exists.

Actions:

- authoritative → validate and reuse
- partial → reuse the stable foundation and document a minimal project extension
- conflicted → inventory the conflict, resolve it by authority domain, and record the selected source
- absent → extend the bundled HarmonyOS baseline with the smallest project-specific layer

This state gate is a reasoning step in the current workflow. Do not claim automated extraction, token clustering, or PR auditing unless a task actually provides and runs those tools.

## Style Library

Define or reuse:

- Color tokens: background, surface, text, muted text, border, primary, success, warning, danger.
- Typography: font family, display, heading, body, label, caption.
- Spacing scale: common gaps and padding.
- Radius scale: input, card, modal, pill.
- Shadows/elevation: use the shared Tokens for the nine standard overlay surfaces in `assets/design-system/design.md` §4.6; other contexts normally have no shadow.
- Icon style.
- Motion/interaction feel if relevant.

## Component Library

Define only components the project needs:

- Button: Primary, Secondary, Ghost, and Danger in standard 40px and small 28px sizes. Disabled is a state supported by every variant, not a standalone variant.
- Icon + Text Button: 40px only, with Primary, Secondary, and Ghost. Primary and Secondary reuse Button colors; Ghost text and icon use `neutral-dark-90`; icon size defaults to `--icon-size-md`.
- Icon Button: 40px square and Ghost by default. An unspecified Icon Button has a transparent resting background, `neutral-dark-90` icon content, and state-layer feedback; Secondary is an explicit filled variant only. Icons default to `--icon-size-md`; both variants support Disabled.
- Input: default, focused, error, disabled.
- Select/checkbox/toggle when needed.
- Card/panel.
- Navigation.
- Table/list item.
- Chart/data card.
- Modal/toast if relevant.

In Pixso, use linked instances for every registered component. A missing
component remains a library gap and must not be replaced by a visually similar
Frame in a dual-output page. In HTML, bind the same logical component ID through
the page specification and reusable markup/classes.

## design.md

Create or update `design.md` when:

- The user wants more than one page.
- The output may be extended later.
- The user asks for style consistency.
- There is no existing design system.
- A Pixso mockup is converted into HTML and future pages should match it.

Recommended structure:

```markdown
# Design System

## Product Context
- Product:
- Users:
- Primary workflow:
- Tone:

## Visual Direction
- Style keywords:
- Layout principles:
- Do:
- Avoid:

## Tokens
### Colors
### Typography
### Spacing
### Radius
### Shadows

## Components
### Buttons
### Inputs
### Cards
### Navigation
### Data Display

## Responsive Rules

## Implementation Notes
```

## Reuse Rules

- Inspect the bundled baseline under `assets/design-system/` before designing or coding.
- Use `assets/design-system/core-color-token-table.md` as the complete baseline Pixso color scope. Bind directly to its current approved core variables and do not create duplicate semantic color variables.
- Use `assets/design-system/dual-output-token-map.json` as the renderer bridge.
  Copy exact source Token → CSS custom property → Pixso Variable mappings into
  `page-spec.json`; equal resolved values are not a valid mapping.
- Keep semantic color roles as Web aliases and resolve them to core Pixso
  variables. For layered semantics, bind one core variable per paint layer.
- If `design.md` exists, read it before designing or coding.
- If Pixso has an existing component/style library, inspect and reuse it first.
- If source code has tokens or CSS variables, prefer them over invented colors.
- If source code has Tailwind config, use it as a token source and mirror important values in `design.md`.
- If the requested page conflicts with the existing design system, mention the conflict and make a conservative choice.

## Authority Domains

Resolve conflicts within the relevant domain. Do not use one global list to let a visual baseline override an explicit product requirement.

### Product and workflow

```text
1. Explicit current user requirement
2. Approved product requirements and business rules
3. Existing product behavior
4. Recorded model inference
```

### Visual system

```text
1. Approved project Pixso library and variables
2. Approved project design.md and tokens
3. Existing project component code and global styles
4. Bundled assets/design-system baseline
5. Model-created project extension
```

### Platform behavior

```text
1. Applicable HarmonyOS platform requirements
2. Approved project platform rules
3. Bundled HarmonyOS baseline
4. General desktop conventions
```

### Technical implementation

```text
1. Existing project stack and conventions
2. User-specified implementation requirement
3. text-to-ui recommended strategy
4. Registered HTML component defaults
```

The bundled baseline is mandatory when no higher-authority project visual or platform system exists. Pixso and frontend code must resolve to the same semantic tokens and component-state rules.
