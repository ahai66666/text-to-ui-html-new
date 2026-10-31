## Style and behavior plans

### Executable HTML business composites

First query the shared registry and existing project business components. Reuse a matching component through supported parameters/slots and its original CSS. Do not regenerate an existing component. Only when no suitable component exists, record registryQueries, reviewedCandidates and missingCapability in a page-composite recipe, then create an independent business module and stylesheet.

The model may write normal business markup, data and event logic inside a
declared page-composite host. Use `page-bindings.json.pageModules`:

```json
{"pageModules":[{"compositionId":"message-list","source":"./page-components/message-list/index.js","stylesheet":"./page-components/message-list/styles.css"}]}
```

The source path is relative to the binding file. The group must be covered by a
page-composite recipe. Export `mount(host, { renderComponent })`; return a
cleanup function for listeners/subscriptions. The generated entry mounts it
after rendering the Pattern. main.js imports styles/index.css once; neither the generated entry nor business modules import CSS. Put the new business component's own CSS in its declared stylesheet; styles/page-composition.css only arranges page-level groups. Use canonical Tokens and no @import in either authored stylesheet. Each page-composite recipe requires a matching pageModules module and stylesheet. Scripts assemble canonical component and Pattern styles through the uniform entry.

Use the supplied `renderComponent` for every button, field, attachment,
and other functional controls. Custom business rows may arrange semantic HTML
and registered controls. Put click and keyboard behavior in this module and
share business state through a normal imported store. Escape user/data text.
Only change descendants of `host`; do not query or replace Pattern regions,
insert navigation/toolbars into the shell, or import another shell stylesheet.
The scaffold owns main.js; do not patch generated files or bundle output.

The page shell always supplies the Titlebar through the registered Pattern
scene. A page module never creates a Titlebar and never chooses its pane
geometry; the binding in `global-title-layer` chooses only the approved
`medium`/`large`/`xlarge` size (default `large`). `small` is a standalone
Secondary Page variant and is not valid for a Pattern page. This keeps every
page on the same Titlebar contract while allowing the page surface to select
the appropriate size.

When the host is a group inside `patternShell.navigation.slots`, the restriction
is even tighter: the module is a business-content slot, not a navigation shell.
It must not render a Titlebar, the global primary action, a level-one Primary
Navigation Item, a handwritten `role="button"`, or a brand/rail/shell wrapper.
Those responsibilities stay in `global-title-layer`, `global-primary-action`,
and `primary-navigation-bottom`. This keeps the generated DOM at the same
depth as Pattern Runtime Renderer and prevents a second background, inset, or
apparent fourth column. The generator rejects these shell-owned markers before
it writes any page artifact.

The same boundary applies to a page module hosted in Pattern B's `main-detail`
group: do not add a pane-local Titlebar, `.detail-toolbar`, or handwritten
window controls. Put pane-global mail/editor actions in the registered
`main-detail-title` Titlebar binding; the module owns only the detail scroll
body. The generator rejects these markers as well, so a second action row
cannot overlap the Runtime Titlebar or create a false fourth column.

Do not author native `button`, `input`, `select`, `textarea`, `svg`, or Pattern
data attributes in a page module. Do not query `document`; query only the
provided `host`. `validate-page-composite-boundaries.mjs` enforces this before
generation and before Fast Preview.

Design one representative row/card before repeating it: choose reading order,
primary and secondary fields, truncation, spacing using existing Tokens, and
default/selected states at the actual pane width. This is a design decision,
not a new mandatory report. A declared recipe alone does not implement it.

This module API currently supports HTML. The HTML page uses its
composition tree; these callbacks belong to the HTML component runtime.

