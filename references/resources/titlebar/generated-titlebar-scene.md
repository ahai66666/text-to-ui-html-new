## Generated Titlebar Scene

For every canonical Pattern page, page generation resolves the binding data
through `assets/design-system/titlebar-scene-contracts.json` and commits a
sibling `titlebar-scene.json`. It is the inspectable source of the rendered
title layer, not an optional preview file.

<!-- tui-scope {"patterns":["pattern-b-three-pane"]} -->
Pattern B's three segments are fixed
as follows:

- Primary navigation: one pane-aligned `Titlebar/Default`, transparent over the
  Runtime-owned navigation surface, with no window controls.
- Secondary list: zero or one registered Search component, vertically centered
  in the shared title height with one `space/5` inline inset.
- Main detail: one final `Titlebar/Default`; nested business actions have one
  uniform mode and collapse to More, followed by the component-owned
  minimize/maximize/close group of 40px Ghost Icon Buttons with 24px icons.

<!-- /tui-scope -->

The page author supplies only product copy and action objects. A separate
title-row wrapper, direct Pattern action binding, mixed business-action modes,
or a page-owned window control is a scene mismatch and stops compilation.

<!-- tui-scope {"contexts":["global-titlebar","main-detail-titlebar","titlebar-main-detail-actions"],"patterns":["pattern-b-three-pane"]} -->
```js
import { createTitlebarSegments, renderHtmlComponent } from '@text-to-ui/components-html';
const segments = createTitlebarSegments(resolvedPattern, {
  'primary-navigation': { slots: { logo: { src: './logo.svg', alt: '产品' }, label: '项目空间' } },
  'main-detail': { slots: { 'main-detail-actions': [
    { id: 'reply', label: '回复', icon: 'action/reply', buttonType: 'icon-text-ghost' }
  ] } }
});
for (const { region, ...options } of segments) {
  // Pass the markup to the corresponding existing Pattern title segment.
  titleSegmentContent[region] = renderHtmlComponent('titlebar', options);
}
```
<!-- /tui-scope -->


HTML callers bind the existing `data-action` events; these are web-window requests, not browser permission to close or minimize the native application.

For generated `page-bindings.json`, put values on the binding's `slots`, not
both `options.slots` and `slots`. The generator forwards this content to the registered HTML implementation. Declare the semantic context for the segment
as usual; slots do not authorize moving the segment or using a handwritten
button. Preserve the main-detail action restrictions in source-resolution.md.

<!-- tui-scope {"contexts":["global-titlebar","main-detail-titlebar","titlebar-main-detail-actions"],"patterns":["pattern-b-three-pane"]} -->
When individual Titlebar actions have separate Behavior Plan outcomes, map
their stable action ids with `actionBehaviors` on the same Titlebar binding:

```json
{
  "id": "detail-titlebar",
  "logicalName": "Titlebar/Default",
  "semanticContext": "main-detail-titlebar",
  "region": "main-detail",
  "slot": "main-detail-title",
  "options": { "layout": "three-column", "segmentRole": "main-detail" },
  "slots": {
    "main-detail-actions": [
      { "id": "reply", "label": "回复", "icon": "action/reply", "buttonType": "icon-text-ghost" }
    ]
  },
  "actionBehaviors": { "reply": "reply-message" }
}
```
<!-- /tui-scope -->
