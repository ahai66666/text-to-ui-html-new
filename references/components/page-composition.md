# Page composition contract

HTML page generation uses the same `composition.regions` tree to
preserve model-authored information architecture without allowing component
internals to be redrawn.

Each Pattern region contains a tree of:

- `group`: a page-owned semantic wrapper. Allowed tags are `div`, `section`,
  `header`, `nav`, `article`, `aside`, and `footer`. It may declare `id`,
  `className`, `ariaLabel`, and nested `children`.
- `component`: a reference to one `componentBindings[].id`. The generator emits
  the registered HTML component factory call; raw component markup is forbidden.
- `text`: static page content with an allowed semantic text tag. Text is escaped.

Every registered binding must appear exactly once in the composition tree. The
binding may still declare `expectedRuntimeCount` when one semantic collection
renders repeated registered instances. Composition wrappers may arrange and
size component hosts, but page CSS must not override protected component
internals.

When a region contains repeated Accordion instances, give the wrapper the
canonical `tui-disclosure-group` class. Its parent-owned Grid gap is
`--space-5` (16px) between Accordion instances. Do not add margins to each
Accordion or change `.tui-disclosure`'s internal trigger-to-content gap.

This is a hard source rule: if a requested control or surface exists in the
canonical HTML component registry, the composition must reference
that binding and let the adapter render it. A page-owned wrapper is not a
replacement component. A page composite is valid only for the capability that
the registry does not provide, and its custom source must keep using
`renderComponent` for every registered control and icon.

The Pattern renderer also owns the direct region geometry. A composition group
inherits the region's scroll-body inset and content axis; it is not a second
pane shell. If a group needs a card envelope, the group must distinguish its
own surface from the inherited pane inset and keep its content axis stable in
default, selected, empty, and error states.

## Content recipes: decide before binding

`page-content-recipes.json` makes each Blueprint content group choose its
implementation source before code generation:

- `registered-composition` names the exact registered binding IDs used by the
  group. Use it whenever those components provide the requested capability.
- `page-composite` is allowed only for a specialized business surface absent
  from the component library. It records fields, states, registry queries,
  rejected candidates, Token roles, and whether it remains page-owned or is a
  candidate for library promotion.

A page composite may arrange registered components; it must not redraw a
registered component just because its default visual shape is inconvenient.
Repeated business rows require their data entity, distinct local records, and a
shared selection key when they drive another Pattern region. The recipe maps to
one composition group, so generic components cannot be silently substituted
for a missing business-row design after generation begins.

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

Every page binding file includes two pre-generation plans:

- `stylePlan.schemaVersion: 1` with one record for every `group` node. Each
  record declares the owning region, at least one canonical Token role, and
  `componentBoundary: "preserve"`; if the group has a class name, the record
  declares the identical class name. The plan is the allowed page-owned styling
  scope, not a post-generation CSS audit. The actual page CSS must reference
  canonical CSS variables from `packages/tokens/src` (or the installed Token
  package) for colors, typography, spacing, radii, shadows, and dimensions.
  `tokenRoles` records intent; it never authorizes a literal value. Local CSS
  aliases must resolve to canonical variables, and the generator rejects raw
  color literals, raw px/rem/em/pt metrics, unknown Token names, and fallback
  literals such as `var(--color-text, #fff)` before writing output. Only
  `layout-contract.json.cssStructuralParameters` can document an intentional
  structural exception.
- `behaviorPlan.schemaVersion: 1` with declared interactions. Every interaction
  has an id, a supported kind (`component-native`, `toggle-hidden`,
  `set-selected`, `filter-collection`, `open-overlay`, `close-overlay`, or
  `open-secondary-page`) and
  trigger binding IDs. A binding that uses `behaviorId` must be one of that
  interaction's triggers. `open-secondary-page` requires
  `secondaryPage.layout: "continuation" | "new-page"`: `continuation` keeps the
  primary shell and replaces the owning right/Main content; `new-page` opens a
  standalone Secondary Page Runtime, which may be presented as a button-triggered
  pop-up page. “Pop-up” is not a Dialog classification. The generated entry
  dispatches its behavior; the page module owns the page host, Back/close, state
  preservation, and focus restoration. Use `open-overlay` for actual transient
  Dialog/overlay content, not for a Secondary Page just because it is opened
  above the parent.

The generator embeds both plans in every generated HTML module and emits behavior
hosts for bound components. The generated HTML entry dispatches a
`text-to-ui:behavior` event to the page controller, so page-owned behavior is
connected through the declared plan rather than invented ad hoc in page code.


- Reuse first: query shared and existing project components. Existing component DOM/CSS is referenced unchanged through supported options/slots. Only missing business capability permits a page-composite; declare an independent pageModules source and stylesheet. Each standard control inside it still uses renderComponent.
## Pattern-owned navigation shells

When a Pattern Context Packet selects `patternMode.navigation: "two-level"`,
the model must not author `composition.regions.primary-navigation`. Instead it
must provide `patternShell.navigation` with `mode: "two-level"` and these
slot-owned trees:

- `global-title-layer` and `global-primary-action`: top area;
- `secondary-navigation-content`: the middle, independently scrollable second
  level navigation;
- `primary-navigation-bottom`: icon-only first-level navigation, pinned to the
  bottom edge.

The renderer owns slot order and layout. A `primary-navigation-shell` binding
must use `primary-navigation-bottom`; a `secondary-navigation` binding must
use `secondary-navigation-content`. The generator rejects any other placement
before it writes a page artifact.
When multiple first-level items share a behavior group in
`primary-navigation-bottom`, use `tag: "nav"` and include
`tui-primary-navigation-items` in its `className`. Do not define a vertical
layout for this group in page CSS; the registered container and Pattern
Runtime own the horizontal distribution.

`global-primary-action` owns the primary action's only horizontal inset. Its
`navigation-top` wrapper is structural and carries no additional padding, even
though it retains legacy `data-pattern-shell-slot` metadata. Do not wrap the
action in a second padded container; a full-width primary action must have the
same width in the Pattern Runtime Renderer and in generated page output.

Static `pattern-shell.css` is retained only for legacy static Pattern markup.
It is scoped below a non-Runtime Pattern root and must not style a
`.tui-pattern-runtime` subtree. Runtime panes, slots, and scroll bodies own
their `border-box` model explicitly, so generated pages cannot depend on a
host application's global CSS reset for their geometry.

### Stroke ownership

The Pattern renderer owns the structural divider edges. It reads each region's
`dividerEdges` and paints only those edges with the canonical
`--layout-navigation-divider-width` Token (`0.5px`) and `--color-border`.
The same visual rule applies when a pane boundary becomes draggable: keep one
visible 0.5px stroke on the boundary, and place a wider transparent hit target
over it for pointer and keyboard interaction. Dragging must not change the
stroke width or create a second divider. The Pattern Runtime owns both the
separator and hit target; a page must not draw or position its own resizer.
Page-owned groups inherit the pane surface and inset; they must not add a
rectangle border, outline, or shadow around a Pattern root, pane, title layer,
Titlebar, or slot wrapper. This prevents a divider from becoming a visibly
thick double outline. Use a registered component when a business control or
card needs its own border; do not reproduce its frame in page CSS.

`outline` is valid only for a `:focus-visible` interaction state owned by the
component and must use the focus-ring Token. A persistent outline, a `1px` or
`2px` page-owned shell stroke, or a page CSS rule that replaces a declared
divider fails the pre-generation boundary check.

Business-page `Sidebar Item/Default` bindings must also provide explicit
`options.items` or `options.groups`. The HTML adapter's labels/counts are
gallery-only specimen defaults; they are intentionally rejected for a page so
demo data cannot leak into product navigation.

For Pattern B the renderer also owns the 64px title segments and pane scroll
bodies. Search binds explicitly to `secondary-list-title`; Runtime gives it
one `space/5` inline inset, full available width, and vertical centering. The
detail segment binds exactly one final `Titlebar/Default` to
`main-detail-title`; its business actions are nested in the Titlebar's
`main-detail-actions` component slot, followed by the component-owned window
controls. Separate page-level action buttons in the Pattern title slot are
invalid. Business groups render inside the scroll bodies with the Pattern's
insets. Do not add a second toolbar, search header, pane padding, or nested pane
scroll to compensate for the shell. Compose content at the supplied 360px list
width.

When `patternMode.navigation` is `"two-level"`, the navigation shell's
`global-title-layer` is intentionally stricter than a normal composition slot:
it is a flat array containing one direct `Titlebar/Default` for the
primary-navigation segment. A page `header`, brand wrapper, collapse button, or
any sibling component in that slot is invalid and is rejected before output.
The renderer owns the segment surface, so page CSS must not paint a second
background on the Titlebar. In the secondary-list title segment, Search is the
only allowed component; put scope/filter/list actions below it or inside their
declared component slot.
