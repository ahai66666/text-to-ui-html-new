# Tool Design Intelligence

Use this reference after workflow selection and before choosing a HarmonyOS shell, visual tokens, or components. It converts a short request into a task model for a desktop tool. It is not a marketing brief and must not turn normal text-to-ui work into a long product-consulting exercise.

## Contents

1. Tool Discovery
2. Tool Types
3. Tool Experience Profile
4. Module Strategy
5. Structure Selection
6. Tool Task Brief

## 1. Tool Discovery

Inspect available context before asking questions:

1. latest user request and earlier decisions in the conversation
2. existing routes, pages, code, components, tokens, and global styles
3. Pixso pages, variables, components, screenshots, and prior outputs
4. product, brand, legal, accessibility, and engineering constraints

Infer low-risk details. Ask at most three high-impact questions in one round, and only when the answer would materially change the tool structure, primary workflow, risk behavior, or delivery scope.

Prioritize missing information in this order:

1. **User and job**: primary user, most important task, frequency, and time pressure.
2. **Work object**: the file, order, content item, device, dataset, configuration, or other object being viewed or changed.
3. **Workflow and result**: start state, main steps, success result, and context that must be preserved.
4. **Risk and recovery**: deletion, publishing, approval, permissions, privacy, irreversible actions, failure feedback, and recovery.
5. **Existing authority**: product behavior, design system, codebase, or platform rules that must be preserved.

Do not ask the user to describe tokens, components, or layout patterns. Translate their work language into design decisions.

## 2. Tool Types

Choose exactly one primary type. Add one secondary type only when a distinct supporting posture materially affects the layout.

| Tool type | Typical work |
|---|---|
| `manage` | Create, view, edit, delete, permission, and batch-manage business objects |
| `process` | Resolve orders, approvals, tasks, queues, exceptions, and repeated work items |
| `monitor-analyze` | Observe state, metrics, trends, anomalies, and drill-down evidence |
| `configure` | Set up a system, account, device, workflow, or object |
| `create-edit` | Create or edit documents, media, structured content, layouts, or configurations |
| `browse-organize` | Search, browse, classify, move, and organize files or content |
| `inspect-troubleshoot` | Inspect properties, history, logs, errors, relationships, and dependencies |
| `command-automate` | Run commands, scripts, batch operations, and expert workflows |

Classification rules:

- Classify from the primary job, not from visual resemblance.
- Treat an operations workbench as `manage`, `process`, or `monitor-analyze`; do not give it a marketing composition.
- A content or campaign tool may use richer expression inside preview, media, or promotional modules. Its publishing, permissions, filters, tables, and analytics remain tool-like.
- Select the HarmonyOS shell only after the work object, workflow, and primary tool type are stable.

## 3. Tool Experience Profile

Use a 1–5 scale. Start from the type baseline, then adapt to the actual user, frequency, risk, content, and approved design system.

| Tool type | Efficiency | Density | Guidance | Assurance | Expression | Motion posture |
|---|---:|---:|---:|---:|---:|---|
| `manage` | 5 | 5 | 2 | 5 | 2 | feedback |
| `process` | 5 | 5 | 3 | 5 | 2 | state-change |
| `monitor-analyze` | 4 | 5 | 2 | 5 | 2 | data-change |
| `configure` | 3 | 3 | 4 | 5 | 2 | feedback |
| `create-edit` | 5 | 4 | 2 | 4 | 3 | continuity |
| `browse-organize` | 4 | 4 | 2 | 4 | 3 | navigation |
| `inspect-troubleshoot` | 5 | 5 | 2 | 5 | 1 | feedback |
| `command-automate` | 5 | 5 | 1 | 5 | 1 | immediate-feedback |

Adjustment rules:

- Frequent or time-sensitive work: raise efficiency and density; reduce explanatory copy and decorative treatment.
- New, infrequent, or complex work: raise guidance.
- Destructive, publishing, permission, financial, privacy, and irreversible work: set assurance to 5.
- Editing, media, preview, and content-expression regions may raise expression.
- Data, filters, tables, logs, permissions, and dangerous actions never lower assurance to match a decorative page style.
- Motion must explain feedback, state change, spatial relationship, or workflow continuity.
- When changing a baseline dimension by more than one point, record the evidence in the Tool Task Brief.

## 4. Module Strategy

Apply the page profile by module responsibility. Do not treat the profile as a global visual filter.

### Shell and navigation

- Keep location, switching, resizing, and hierarchy stable.
- Use low decoration and preserve platform behavior.
- Do not restyle the complete shell because one content module needs stronger expression.

### Search, filters, and toolbars

- Keep placement and action scope stable.
- Expose frequent actions; move infrequent actions into menus.
- Avoid decorative motion.

### Lists, tables, trees, and queues

- Favor density, scanning, selection clarity, and operational precision.
- Preserve filters, sorting, scroll position, and selection across related actions.
- Cover loading, empty, error, selected, processing, and partial-success states when relevant.

### Editors, canvases, and previews

- Prioritize the work object.
- Give the toolbar, canvas/editor, layers, and inspector distinct responsibilities.
- Allow stronger content expression without reducing target clarity or state recognition.
- Use motion for object continuity and editing feedback.

### Detail and inspector

- Show object identity, state, properties, history, relationships, and object-scoped actions.
- Do not duplicate list information unless it supports a decision or action.

### Configuration and forms

- Group by task and dependency rather than by arbitrary card count.
- Distinguish immediate, saved, deferred, and restart-required changes.
- Cover validation, unsaved changes, failure, and recovery.

### Analysis and monitoring

- Prioritize exceptions, change, evidence, and actionable information.
- Do not default to four KPI cards.
- Do not invent metrics or charts without a decision or action they support.

### Content and campaign modules

- Allow imagery, brand color, previews, and restrained motion within the content-expression region.
- Keep publishing, approval, asset lists, permissions, and analytics under tool rules.

### Guidance, help, and empty states

- Explain the current state and next useful action.
- Brand expression may increase modestly.
- Do not invent capabilities, claims, or data.

## 5. Structure Selection

Derive structure from the work object and workflow:

```text
Single configuration task
→ navigation + grouped configuration content

Repeated object processing
→ navigation + list or queue + detail

Content creation or professional editing
→ navigation + toolbar + canvas/editor + inspector

Browsing and organization
→ navigation + search/filter + grid/list + preview

Monitoring and analysis
→ state overview + exceptions/trends + drill-down objects

Command and automation
→ command entry + workspace + log/result + inspector
```

Choose the simplest HarmonyOS shell that completes the primary task. Never add panes merely to look like a desktop application.

## 6. Tool Task Brief

Show this compact, non-blocking brief before Pixso or HTML generation. If the user does not correct it, continue.

```markdown
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
- Main workflow:
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

### Assumptions
- Confirmed facts:
- Inferred decisions:
- Open risks:
```

For a simple single view, include this inside the Requirement Contract. For multi-view, reusable, extension, or redesign work, also save it as `design-strategy.md`.
