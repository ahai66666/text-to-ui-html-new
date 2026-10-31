# New skill maintenance

The installed text-to-ui-html snapshot is the initial upstream, recorded by semantic source version and file hashes in origin.json. This project is independent after the copy. Never read or modify the old installation during normal builds.

Canonical inputs: packages/component-contracts/src/components/, references/components/component-selection-rules.json, Pattern contracts and implementation modules. consumer/catalog.json and consumer/coverage.json are built artifacts. Default values/types are documented only from inspected literal destructuring defaults; unknown types remain unasserted. Callback and arbitrary style parameters are explicitly not exposed in the JSON consumer.

Build order after canonical changes:

```sh
node scripts/build-consumer.mjs
node scripts/build-resource-index.mjs --repo .
node scripts/build-skill-catalog-index.mjs
node scripts/build-navigation-index.mjs --repo . --skill-root .
node --test tests/*.test.mjs
node scripts/pack-consumer.mjs
```

Runtime title-slot composition lives in Pattern Runtime; generators provide values only. Empty consumed slots retain cardinality without repeating controls. Text-only content recipes cannot contain component or custom UI nodes.

The consumer pack excludes gallery code, duplicate Token maps and compatibility modules. Compact JSON is applied before rebuilding machine hashes. It retains normative fragments required by the reused pipeline; removing them without changing its loading contract is unsafe. The remaining pipeline therefore still has some maintenance-named index dependencies. It is not a completely new generator.

Acorn 8.16.0 is vendored under MIT; see vendor/ACORN-LICENSE. It parses supported ESM for portable linking, not regex import rewriting. The linker rejects cycles and mutable exports instead of approximating live-binding semantics. Browser verification is a small implementation check, not a new acceptance workflow.

Optional browser check: provide TUI_PLAYWRIGHT (installed playwright-core package directory), and optionally TUI_CHROME (browser executable), then run maintenance/check-browser.mjs from this project. This command opens file:// outputs without starting an HTTP server.

Resource policy: only explicit runtime references belong in default output; dynamic source resources need declared src options. Previously public resource IDs are versioned. Any removal must be a recorded compatibility change, not indefinite retention of old examples.
