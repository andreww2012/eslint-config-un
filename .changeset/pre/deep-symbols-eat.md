---
'eslint-config-un': patch
---

Fixed a bug occurring when you set `linterOptions*` config with only the `ignores` option, which implicitly set the value to `off` or `false` and disabled the linter option for all files except listed in that option, which wrongly reflects the intention. Instead, this option is renamed to `files` for such configurations