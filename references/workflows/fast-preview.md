# Fast Preview

Every preview follows the dynamic component workflow in references/routes/new-page.md.

1. Resolve Workflow → Task → Pattern and produce a page brief with --brief-out.
2. Read the brief and relevant individual contracts; write Blueprint, content recipes, component bindings, behavior/style plans and styles/page-composition.css using Tokens.
3. Run generate-compliant-page.mjs. It validates inputs, prepares selected local components, copies shared dependencies, prepares styles/index.css and base.css, generates page/mount modules and records evidence.
4. Install/build with the available environment, open the HTTP preview, and await #app.__tuiReady.
5. Inspect Pattern geometry, component evidence, primary interaction, overlays and keyboard recovery. Show the same preview for feedback.

Required outputs include an empty-host index.html, components/component-manifest.json, generated-page.js, generated-entry.js, styles/index.css, styles/base.css, styles/page-composition.css, styles/style-manifest.json, component-usage.json and html-page-manifest.json. Full Context Packets and material receipts remain machine inputs.

Generation or build success is not browser evidence. Provisional components stay provisional. Formal release follows workflows/release-validation.md after direction approval.
