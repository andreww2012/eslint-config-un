---
'eslint-config-un': minor
---

solid: updated [`eslint-plugin-solid` from v0.18.1 to v0.19.0](https://github.com/solidjs-community/eslint-plugin-solid/compare/v0.18.1...v0.19.0):

- 🟢 enabled the following rules:
  - [`solid/no-unassigned-vars`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-unassigned-vars.md), which replaces the core [`no-unassigned-vars`](https://eslint.org/docs/latest/rules/no-unassigned-vars) rule and takes its severity from the `js` config
  - [`solid/validate-jsx-nesting`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/validate-jsx-nesting.md)
- 🟢 enabled [`solid/action-yield-after-await`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/action-yield-after-await.md) if the resolved Solid major version is at least 2
