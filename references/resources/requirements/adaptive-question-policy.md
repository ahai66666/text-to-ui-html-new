## 3. Adaptive Question Policy

Before asking anything:

1. Read the latest user request.
2. Inspect supplied screenshots, Pixso document/top-level Frame references, code, design files, and assets.
3. Record the workflow requested by the user, or default to `html-first` and state that non-blocking assumption.
4. Apply known platform and design-system defaults.
5. Read `tool-design-intelligence.md` and classify the likely user, work object, primary task, tool type, workflow, risk, and state-preservation needs.
6. Identify only uncertainties that would materially change the tool structure, workflow, risk behavior, or delivery scope.

Ask 1–3 concise questions in one round when useful. Ask fewer when possible and default to one round. Do not ask for information already present in the conversation or project files.

High-value question areas:

- Who performs the work, how often, and under what time pressure?
- What is the main work object and what must the user do to it?
- What starts the workflow, what counts as success, and what context must remain stable?
- Which failure, recovery, destructive, publishing, privacy, or permission behaviors materially affect the design?
- Is there existing product behavior, code, Pixso, or a design system with higher authority?

Ask a blocking question only when different answers would create substantially different products, workflows, permissions, sensitive-data behavior, or delivery scope. Otherwise continue with reasonable assumptions.

After questions or safe inference, record the task brief in the blueprint and
continue generation. Briefly state consequential assumptions. Incorporate user
corrections without restarting a confirmation loop.

