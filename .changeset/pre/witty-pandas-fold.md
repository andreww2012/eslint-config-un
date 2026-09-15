---
'eslint-config-un': patch
---

[**BREAKING**] yaml: removed `doNotMergeIgnoresWithDefault` in favor of the function form of `ignores`, which replaces the default ignore list: `ignores: () => ['**/my-glob']`. Also removed `ignoresAdditional`, which never had any effect