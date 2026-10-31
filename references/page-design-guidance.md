# Design decisions before assembly

Read this once before writing a new page blueprint. Keep the accepted Token
system and component appearance; do not select another palette, font, or style.
This guidance informs model judgment, not a keyword-driven page template.

## Start with the task, not the inventory

Decide what the user must recognize, compare, select, and act on. Give each
region a business responsibility and a default useful state. A list, selected
object, detail title and available actions must refer to the same data object.
The component list is an implementation lookup, not the page's content outline.

Resolve design context with `resolve-context.mjs --discover` before the
blueprint. Read its selected Pattern geometry, supported component inputs and
canonical icon aliases. Discovery is not a confirmed generation context.
After designing the blueprint, resolve `--auto --blueprint` to compile.

## Design at the real content width

Use the Pattern's existing inset; never add the pane padding again. Estimate
the representative row/card at the actual content width, with realistic long
content. For a narrow mailbox list, stack sender/time, subject, summary, then
optional status metadata. Do not allocate a separate grid column to every
field. Use truncation for scanning text, wrapping for reading text, and allow
content groups to shrink (`min-width: 0`) inside their declared scope.

In a detail view, identify the selected object first, then its primary content,
then related objects such as attachments and calendar events. A meeting card
must not displace the email subject merely because it is a library component.
For settings, group fields by user intent and place help next to the affected
field. For tools, make status and the next useful action discoverable without
making every field equally prominent.

## Visual alignment and grouping

Within each page-owned content group, give related headings, rows, fields, and
actions a shared visual axis. Align text by a consistent leading edge or
baseline; judge icon-and-text alignment by how it looks at the rendered size,
not only by their bounding boxes. Keep labels, help, status, and actions near
the content they describe or change so they read as one group. Use consistent
Token-based gaps between peers; if an element looks stranded in empty space,
adjust the group's composition or spacing rather than adding an isolated
offset. Deliberate whitespace may separate different priorities, but must not
break a relationship the user needs to understand. Pattern insets and
registered component internals remain owned by their renderers.

## Reuse controls; design missing business composites

Use registered buttons, inputs, selection controls, navigation and attachment
controls through their renderer. A custom email summary or business card may
combine business typography and existing controls inside its own host. Query
the missing composite once and record the missing capability; do not repeat
the same search for every instance. Do not reuse unrelated gallery specimen
copy, replace icons with Unicode symbols, or invent semantic icon aliases.
Use supported props for labels and state; slots are not arbitrary new props.

## One deliberate first preview

Before code, decide the information hierarchy, representative custom row,
selection relationship and primary task path in the existing blueprint and
content recipes. Do not create another mandatory design report. Generate
bindings from the current context, keep the generated mount entry, and run
renderer preflight before output. Build and inspect the exact running artifact
once; fix a reported defect at its owning input, not with parallel handwritten
HTML. At the actual content width, check that related elements share a clear
visual axis and that no label or action is left isolated. Re-run only the
checks invalidated by a fix. Browser evidence remains necessary for mounting
and interaction; style comparison is not a default gate.

Only explicitly user-approved registered pages may inform future design.
Generated test pages never become historical references automatically.
