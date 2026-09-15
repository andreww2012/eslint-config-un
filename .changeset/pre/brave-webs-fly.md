---
'eslint-config-un': patch
---

`typeInfoRules.allowDefaultProject` and `typeInfoRules.parserOptions` are now merged instead of being mutually exclusive. Previously, specifying both silently discarded `parserOptions`