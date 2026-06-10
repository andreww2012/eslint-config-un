---
'eslint-config-un': minor
---

ts: updated [`typescript-eslint` from v8.52.0 to v8.53.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.52.0...v8.53.0):

- 🟢 enabled [`ts/strict-void-return`](https://typescript-eslint.io/rules/strict-void-return) rule
- Added a new option, `extraVariableTypesToRemove`, to control which special variable types should be subject to removal by [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars).
  The default value is `{imports: true}`.
  The passed value gets merged with the default value.
