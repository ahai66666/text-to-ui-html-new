# Skill maintenance

Maintain this text-to-ui-html repository. Edit thematic resource sources and rebuild resources, catalog, navigation in that order. Test changes, regenerate the delivery manifest, and pack a runtime ZIP. Snapshots retain their publisher and hashes; the Pixso consumer must not hand-edit shared data. Development commands operate only in this repository. Layout screenshots, tests and history are excluded from runtime delivery.

Use `query-resources.mjs --workflow skill-maintenance --stage intake`, then validation. This workflow does not require a page Context Packet, Task, Pattern or Blueprint. Query individual normative resources with --resource only when needed. Validation commands rebuild and check the skill itself; no page generator is suggested.
