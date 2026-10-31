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
