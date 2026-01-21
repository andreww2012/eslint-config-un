---
'eslint-config-un': patch
---

[**BREAKING**] yaml: updated [`eslint-plugin-yml` from v1.19.1 to v3.0.0](https://github.com/ota-meshi/eslint-plugin-yml/compare/v1.19.1...v3.0.0):

- The plugin now provides `yaml` ESLint language are therefore does not require specifying `parser` (but instead you should now specify `language: '<plugin prefix (defaults to yaml)>/yaml'`). Thus, `yaml-eslint-parser` dependency has been removed.
