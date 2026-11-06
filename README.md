# text-to-ui-html-new 0.1.1

Independent HarmonyOS PC HTML consumer. The existing text-to-ui-html skill is unchanged.

## Install and use

Unzip `text-to-ui-html-new-0.1.1.zip` under your model tool's skill directory. Keep the `text-to-ui-html-new/` folder. Requires Node.js 20+ and no npm install. Give the model SKILL.md, not the entire directory.

```sh
node scripts/consumer.mjs find "button"
node scripts/consumer.mjs describe button --context page-primary-action
node scripts/discover-page.mjs --task "设置"
node scripts/page.mjs generate --project /path/to/page-project
```

The project contains a user-owned page-input.json. Read references/consumer-input.md for its format. Open `out/<page-id>/index.html` directly. Deliver its complete folder, including external runtime/app.js, styles/app.css, optional assets/, and src/ modules. It mounts the same component and Pattern implementations dynamically using classic scripts, without Vite, npm install or a server. Rebuilding uses Node.js 20+ and this skill. See references/offline-delivery.md. Single-file HTML remains an explicit `--format single-file` option.

Optional examples ZIP includes four Pattern inputs and their complete offline preview folders. Copy an example folder outside the skill before editing. Optional preview ZIP overlays the consumer directory: copy its contents into the matching skill directory, then `node scripts/preview-components.mjs`. Preview uses a local server; delivered page HTML does not.

## Boundaries

All 49 canonical component IDs are discoverable; original component maturity is unchanged. Semantic fixed parameters are injected and cannot be overridden. Arbitrary component CSS overrides are not exposed. Business callbacks and unsupported behaviors require declared business modules. No backend services or persisted account data are provided.

The portable linker supports the static ESM subset used by the component runtime. Cycles, mutable exports, dynamic imports, import.meta, runtime local fetch and workers fail explicitly. Image resources use explicit src/image options or static HTML attributes; arbitrary runtime-computed file paths are outside portable output. Remote service integration is outside the offline prototype scope.

## Maintenance

The source snapshot, implementation notes, measurements and browser checks live in maintenance/. Build the consumer catalog with `node scripts/build-consumer.mjs`; pack with `node scripts/pack-consumer.mjs`. Source branches and releases are independent from the old skill.

## Long tasks and small context windows

For complex pages, read references/stepwise-workflow.md. Use scripts/work-plan.mjs to keep confirmed structure and shared contracts in project files, build an early working preview, complete one business module at a time, and resume with only current inputs and fresh component interfaces. Simple revisions retain the short generation path. Progress notes are recorded observations, not automatic proof of business correctness.

## Business capability gaps

Use scripts/business-module.mjs init to extend an existing content group with local state and handlers; preserve canonical controls and Pattern structure. Do not create a second full HTML implementation. The scaffold does not provide AI inference or network access. Run scripts/page.mjs entry to find the one official preview and detect stale output. See references/business-extension.md for local task state, cancellation, migration of existing handwritten pages and offline service boundaries.
