---
'eslint-config-un': minor
---

zod: updated [`eslint-plugin-zod` from v3.8.0 to v3.11.0](https://github.com/marcalexiei/eslint-plugin-zod/compare/v3.8.0...v3.11.0):

- `schemaSuffix` option was renamed to `schemaVariableName` and now supports specifying schema prefix, following the ⚠️ deprecation of `require-schema-suffix` rule in favor of a new [`consistent-schema-var-name`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/consistent-schema-var-name.md) rule
- Enabled the following rules if the resolved zod major version is >=4:
  - [`no-number-schema-with-finite`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-number-schema-with-finite.md)
  - [`no-number-schema-with-is-int`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-number-schema-with-is-int.md)
  - [`no-number-schema-with-is-finite`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-number-schema-with-is-finite.md)
  - [`no-number-schema-with-safe`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-number-schema-with-safe.md)
  - [`no-number-schema-with-step`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-number-schema-with-step.md)
