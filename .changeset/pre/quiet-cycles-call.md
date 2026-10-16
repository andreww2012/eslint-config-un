---
'eslint-config-un': patch
---

format: `format/{prettier,dprint}` sub-configs (with the `plugins` option) now skip the files their formatter cannot format instead of reporting an error, like `format/oxfmt` already did