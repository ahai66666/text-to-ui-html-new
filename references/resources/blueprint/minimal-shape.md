## Minimal shape

```json
{
  "schemaVersion": 1,
  "workObject": "message and its related schedule",
  "pattern": { "id": "pattern-b-three-pane" },
  "design": {
    "readingOrder": ["primary-navigation", "secondary-list", "main-detail"],
    "informationPriority": ["message-list", "message-detail"],
    "regionResponsibilities": [],
    "contentDensity": {
      "primary-navigation": "compact",
      "secondary-list": "comfortable",
      "main-detail": "comfortable"
    },
    "primaryActionIds": ["select-message"],
    "secondaryActionIds": [],
    "relationships": [{ "from": "message-list", "to": "message-detail", "kind": "selection" }],
    "stateMatrix": []
  }
}
```

The empty arrays above are only a shape example; a real blueprint must fill
them with the decisions required by the validator.
