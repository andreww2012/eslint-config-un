---
'eslint-config-un': minor
---

[`meta.languages` rule property](https://eslint.org/docs/latest/extend/languages) is now removed after plugin loading because [it causes difficult problems with shared configs](https://github.com/eslint/eslint/issues/20999)

Additionally, `eslint-plugin-unicorn` rules targeting specific languages are now only available in the new corresponding sub-configs:

- `anyLanguage` (enabled by default)
- `css` (enabled if `css` config is enabled)
- `html` (enabled if `html` config is enabled)
- `json` (enabled if `json` or `json` config is enabled)
- `markdown` (enabled if any of the `markdown*` configs are enabled)