# Page Contract and Artifact Provenance

Use this reference for every reusable page, dual-output task, or generated page
that must obey product-specific rules beyond the bundled visual baseline.

## Why this contract exists

Natural-language requirements are useful for reasoning but are not a sufficient
delivery gate. The page specification must turn important product rules into
declarative checks that can fail before HTML or Pixso is handed off.

The contract has three parts:

- `must`: selectors, content, attributes, and states that must be present;
- `mustNot`: content or selectors that are forbidden;
- `acceptance`: required states, interactions, and artifacts for the current
  demonstration.

All checks use `mode: "block-on-failure"`. A visually plausible page is not
complete when a blocking check fails.

## Contract shape

```json
{
  "constraintContract": {
    "schemaVersion": 1,
    "mode": "block-on-failure",
    "source": "requirement-contract.md",
    "must": [
      {
        "id": "shell.primary-navigation",
        "description": "The primary navigation exists once.",
        "scope": "rendered-markup",
        "assertion": {
          "kind": "selector-count",
          "selector": "[data-component='primary-nav']",
          "min": 1,
          "max": 1
        }
      }
    ],
    "mustNot": [
      {
        "id": "content.no-avatar-block",
        "description": "Account and sender content must not use avatar blocks.",
        "scope": "rendered-markup",
        "assertion": {
          "kind": "pattern-present",
          "patterns": ["data-component=\"avatar\"", "class=\"avatar"]
        }
      }
    ],
    "acceptance": {
      "requiredStates": [],
      "requiredInteractions": [],
      "requiredArtifacts": [
        {"id": "page-spec", "kind": "page-spec"},
        {"id": "final-html", "kind": "html"}
      ]
    }
  }
}
```

For `mustNot`, a matching selector, text, or pattern is a failure. Literal
`patterns` are case-insensitive; use `regexPatterns` only when a literal match
cannot express the rule. Selectors are intentionally limited to simple CSS
selectors (`tag`, `.class`, `#id`, and attribute selectors) so the validator
does not pretend to be a browser engine.

Supported scopes:

- `source`: the complete HTML source, including runtime scripts;
- `rendered-markup`: markup after scripts, styles, comments, and the hidden icon
  sprite are removed;
- `runtime-source`: JavaScript inside `<script>` blocks;
- `visible-text`: visible text extracted from rendered markup.

## Provenance

Every page spec uses a canonical SHA-256 hash of the page spec with its own
`provenance` field removed:

```json
{
  "provenance": {
    "runId": "coremail-mail-workbench-v3-20260806T170148Z",
    "hashAlgorithm": "sha256",
    "pageSpecSha256": "<64 lowercase hex characters>"
  }
}
```

`runId` and `pageSpecSha256` must also be written to the final HTML metadata,
delivery record, reuse plan, Pixso audit, and run manifest. The manifest records
the exact files and their file hashes. A mismatch means the artifact belongs to
another generation run and must not be delivered.

Stamp a page and its artifacts with:

```bash
node scripts/stamp-page-contract.mjs \
  --page-spec /absolute/path/to/page-spec.json \
  --run-id <project>-<timestamp> \
  --manifest /absolute/path/to/run-manifest.json \
  --artifact html=/absolute/path/to/index.html \
  --artifact delivery-record=/absolute/path/to/delivery-record.json \
  --artifact reuse-plan=/absolute/path/to/registered-reuse-plan.json \
  --artifact pixso-audit=/absolute/path/to/pixso-binding-audit.json
```

Validate the page contract and artifact set with:

```bash
node scripts/validate-page-contract.mjs \
  --page-spec /absolute/path/to/page-spec.json \
  --html /absolute/path/to/index.html \
  --manifest /absolute/path/to/run-manifest.json \
  --delivery-record /absolute/path/to/delivery-record.json \
  --reuse-plan /absolute/path/to/registered-reuse-plan.json \
  --pixso-audit /absolute/path/to/pixso-binding-audit.json
```

Run the validator after page-spec validation and before final delivery. In
strict structured reuse it also checks that the reuse plan agrees with the
selected strategy; in fast visual import it prevents an old strict plan from
being attached to the new page.

