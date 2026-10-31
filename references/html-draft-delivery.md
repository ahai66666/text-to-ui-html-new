# HTML Draft Delivery Gate

The HTML-first draft is the first user-visible checkpoint. It is not a
temporary file that can remain hidden while Pixso is being generated.

## Required order

1. Write the draft to the approved delivery directory, normally
   `<workspace>/outputs/<slug>/index.html` (or the user-configured output root).
   The draft uses dynamic rendering from the start: index.html is an empty host, components/ is separate, and page/mount modules are external. Styles live in styles/ and load once through main.js; model-authored CSS is styles/page-composition.css. Keep asset and module references relative to the project.
2. Run `node scripts/verify-html-artifact.mjs <absolute-html-path>` and fix
   every missing local asset before browser verification.
3. Open its HTTP preview URL, await #app.__tuiReady, in the browser at the declared
   desktop viewport, exercise the primary path, and capture a screenshot.
4. Report the clickable HTML path and the browser URL before starting any
   Pixso operation. The user must be able to inspect the draft while Pixso is
   still pending.
5. Continue to Pixso only after the draft checkpoint is visible. If Pixso is
   unavailable or slow, deliver the verified draft and report Pixso as a
   separate pending stage; never hide or delay the HTML artifact behind Pixso.

## Delivery record

The generation record must contain `draftHtmlPath`, `draftBrowserUrl`,
`draftViewport`, `draftVerification`, and `pixsoStatus`. The final response
must include the draft path even when a later Pixso stage fails or is paused.
