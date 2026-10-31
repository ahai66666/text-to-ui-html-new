# Micro revision route

Use only when the user names an existing approved artifact/component and one
exact change that cannot alter page hierarchy, workflow, permissions, or action
scope.

Preserve dynamic module and stylesheet boundaries (main.js → styles/index.css → canonical CSS and styles/page-composition.css): change page inputs and regenerate for a page change; use component maintenance for shared component changes. Converting a static screen into this structure belongs to new-page.

Restate a one-sentence change contract, inspect only the affected implementation
and its exact component/layout reference, apply the narrow change, rerun the
nearest validation, and return to the same HTML browser review gate.

If the change affects structure, content model, navigation, primary actions,
permissions, responsive Pattern, or multiple independent regions, switch to
`new-page` and run Gate 0.

## Inherit and finish
Use `resolve-context.mjs --inherit-context <existing-context.json> --workflow-route micro-revision --discover` to retain Task and Pattern while refreshing canonical source hashes. The old context is an identity reference, not fresh browser evidence. Preserve the original project and recorded generation route; verify the scope of the requested change before proceeding.
Query only intake → bindings → styling → validation as needed. A text-only change can proceed directly to validation. Reuse existing project components; regenerate managed files with the original generator entry when inputs change. Structural changes must switch to new-page. Record affected browser checks and update the handoff after accepted changes; failed checks invalidate the previous acceptance evidence.
