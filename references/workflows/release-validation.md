# Release Validation

Enter this mode only after the user approves the visible direction.

## Required sequence

1. Freeze the approved requirement, layout, and component-source decisions. Preserve the dynamic page/component structure and verify components/component-manifest.json and styles/style-manifest.json. Preserve main.js as the single styles/index.css import.
2. Complete required states, accessibility, resizing, error recovery, icons, Tokens, and visual fidelity.
3. Verify the accepted HTML artifact and dependency evidence. After the required checks pass, generate html-handoff.json. Canvas import is a separate skill invocation requested by the user.
4. Run the Context Packet's release commands, complete artifact stamping and delivery checks, and fix all failures.
5. Reopen the exact final artifact at the target viewport and show the user the final validated page.

Release validation never substitutes for the early browser review. Both checkpoints are required for Web delivery.
