---
"eslint-config-un": minor
---

Added `plugins.<pluginName>.replacements` option and `defineRuleReplacements` helper, which replace the implementation of any rule of a built-in plugin while keeping its name and typing its options after the new implementation:

- unicorn: replaced the implementations of [`unicorn/no-array-reverse`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-array-reverse.md), [`unicorn/no-array-sort`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-array-sort.md) and [`unicorn/no-array-splice`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-array-splice.md) rules by default with the `un` rules of the same names, which no longer ask to copy new arrays that nothing else uses and report such copies instead
- `useImportIntegrity` now loads `import-integrity-lint` only when the `import` plugin is used
