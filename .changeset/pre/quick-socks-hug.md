---
'eslint-config-un': patch
---

[**BREAKING**] toml: updated [`eslint-plugin-toml` from v0.13.1 to v1.0.0](https://github.com/ota-meshi/eslint-plugin-toml/compare/v0.13.1...v1.0.0):

- The plugin now provides `toml` ESLint language are therefore does not require specifying `parser` (but instead you should now specify `language: '<plugin prefix (defaults to toml)>/toml'`).
  Thus, `toml-eslint-parser` dependency has been removed.
