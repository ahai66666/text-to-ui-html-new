## Design before assembly

Use this order for every new page:

1. Identify the user, work object, primary task, start state, success state,
   and recovery path.
2. Assign one purpose and one reading priority to each Pattern region.
3. Define the data relationship between groups. Lists and details that show
   the same object must share a stable selection key; counts, filters, and
   selected content must not drift apart.
4. Design one representative list row/card/detail module at the actual Pattern
   width. Decide reading order, primary field, secondary metadata, truncation,
   selected state, and action placement before repeating it.
5. Resolve registered components by semantic context. Existing functional
   components fill slots; a page-owned composite is allowed only for a
   specialized business surface whose missing capability is recorded.
6. Bind the result to the Pattern skeleton and implement the declared
   behavior. Do not use a validation pass to decide the page hierarchy.

Do not start with “include these components”. If the request is component-led,
translate it into a business purpose and information hierarchy first. A
component that has no declared job, group, slot, or behavior is not placed in
the page.

