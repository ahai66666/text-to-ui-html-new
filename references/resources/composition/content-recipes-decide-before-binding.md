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

