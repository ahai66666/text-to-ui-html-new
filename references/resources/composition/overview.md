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

