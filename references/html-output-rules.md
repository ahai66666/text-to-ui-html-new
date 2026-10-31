# HTML Output Rules

Use this reference before implementing final HTML/CSS.

## Output

- Every HTML deliverable, including early previews, uses dynamic rendering with separate page and component modules. index.html is an empty #app host with an external ES module. Follow the new-page route; the page imports components/index.js.
- Use semantic HTML and real interactive controls.
- Target HarmonyOS PC windows and approved desktop sizes. Do not add mobile behavior unless the platform contract changes.
- Render edge-to-edge in the browser viewport. Keep `html`, `body`, and `#app` free of outer margin, padding, max-width, decorative border, radius, or shadow.
- Use registered HTML components and canonical Tokens. Do not copy a Pixso capture board or preview backdrop into the page.
- Resolve icons through `assets/icons/icon-aliases.json`. Use `scripts/export-icon-sprite.mjs` for registered SVG symbols; do not draw approximate paths.
- Keep the browser artifact and Pixso import artifact separate. Before `code_to_design`, prepare the Pixso copy with `scripts/prepare-pixso-html.mjs`.
- Keep CSS under styles/: main.js imports styles/index.css once. Scripts own index.css, base.css and style-manifest.json; the model owns styles/page-composition.css without @import. Keep canonical shared CSS in components/_runtime/ and verify its manifest instead of copying rules into the page.
- Page CSS styles declared business groups only. Do not override component internals or Pattern-owned shell geometry.

## Token and component contract

For reusable or dual-output work, copy exact mappings from `assets/design-system/dual-output-token-map.json` into `page-spec.json`. Use canonical CSS variables directly; never replace them with resolved values copied from Pixso or computed browser styles.

Avoid hardcoded visible colors and fixed design metrics. SVG icons inherit semantic color through `currentColor`; filters do not count as Token bindings. A project-specific exception must be documented in its design rule.

## Delivery

Default to `<workspace>/outputs/` or the user-configured output root. Use descriptive kebab-case filenames and avoid overwriting existing user files. Keep product UI free of implementation instructions.

## Browser review

Check the first viewport, page density, text fit at approved desktop sizes, and the primary workflow. Exercise relevant hover, focus, error, disabled, selected, loading, modal, and menu states. If browser inspection was not performed, say so.
