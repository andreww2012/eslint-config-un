---
'eslint-config-un': minor
---

unicorn: updated [`eslint-plugin-unicorn` from v77.0.0 to v78.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v77.0.0...v78.0.0):

- 🟢 enabled the following new rules:
  - [`unicorn/no-repeated-call-wrappers`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-repeated-call-wrappers.md)
  - [`unicorn/no-unnecessary-default-arguments`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unnecessary-default-arguments.md) (added it to the `noStylisticRules` config)
- New ⚙️ `soml`, `toml` and `yaml` sub-configs apply the rules supporting [SOML](https://soml.sh), TOML and YAML to the respective files, ✅ enabled if the config of the same name is enabled