# Visual QA

Use this checklist before calling a UI design or HTML output complete.

## Pixso QA

- Take a screenshot of the target frame when possible.
- Check all text blocks for overlap, clipping, excessive wrapping, and unreadable font fallback.
- Check buttons and form fields: labels fit, icons align, controls look clickable.
- Check spacing hierarchy: page margins, card padding, section gaps, title/body relationship.
- Check visual hierarchy: primary action is obvious; secondary content is quieter.
- Check palette: avoid a flat one-color look unless explicitly requested.
- Check contrast for body text and interactive controls.
- Check the default `1728 × 1152px` desktop frame and any approved alternate window sizes.
- If screenshot reveals a problem, fix it and screenshot again.

## HTML QA

- Open or render the HTML when browser tooling is available.
- Test at `1728 × 1152px` and any approved alternate desktop window sizes.
- Exercise the primary workflow and relevant hover, focus, error, disabled, selected, menu, and modal states.
- Confirm input/button text stays inside controls.
- Confirm visual effects do not hide content.
- Confirm the HTTP preview loads its external page/component modules and canonical styles; await #app.__tuiReady and inspect the dynamically rendered page.

## Common Fixes

- Text overlaps: fix content composition or a supported canonical typography role; preserve registered component internals.
- Button label clips: use supported content/width behavior and approved size; repair shared source for an internal defect.
- Alternate desktop window feels cramped: preserve task hierarchy, adapt pane widths, and collapse only approved secondary regions.
- Pixso font fallback breaks sizing: switch to a stable font available in the environment or adjust text boxes manually.
- HTML diverges from Pixso: match macro layout first, then typography, then decorative details.
