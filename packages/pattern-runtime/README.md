# `@text-to-ui/pattern-runtime`

The callable web Pattern boundary. It resolves a canonical Pattern Contract,
owns the shell geometry, and accepts page content through declared slots.

```js
import registry from "../../skill-support/assets/design-system/pattern-contracts.json";
import { createPatternRuntime } from "@text-to-ui/pattern-runtime";

const runtime = createPatternRuntime({
  registry,
  patternId: "pattern-b-three-pane",
  mode: "runtime",
  slots: {
    "global-title-layer": "<strong>任务</strong>",
    "primary-navigation-shell": "<nav>导航</nav>",
    "main-detail-actions": "<button>更多</button>"
  }
});

document.querySelector("#app").innerHTML = runtime.render();
```

Use `skeleton` for a design preview. Use `runtime` for a page: required slots
are enforced, and page code cannot replace the declared pane order or geometry.
Pass `regionContent` for page-owned body content that is not a registered slot.
For an existing approved preview, `runtime.decorate(root)` adds the same
contract metadata without replacing its visual markup.

Secondary Page compositions use the same callable boundary without pretending
to be a fifth canonical Pattern Contract. `layout` selects the page frame, not
how it is opened: `continuation` keeps the primary shell and replaces its
right/Main content; `new-page` renders a standalone page that a button may open
as a pop-up. The page host owns presentation, parent-state retention, and
return/focus behavior; a pop-up new page is still not a Dialog.

```js
import { createSecondaryPageRuntime } from "@text-to-ui/pattern-runtime";
import { renderHtmlComponent } from "@text-to-ui/components-html";

const runtime = createSecondaryPageRuntime({
  layout: "new-page", // or "continuation"
  mode: "runtime",
  slots: {
    titlebar: renderHtmlComponent("titlebar", { label: "项目设置", size: "small", layout: "standalone", segmentRole: "global" }),
    content: "<main>设置内容</main>"
  }
});
document.querySelector("#app").innerHTML = runtime.render();
```
