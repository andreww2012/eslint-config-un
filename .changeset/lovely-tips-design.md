---
'eslint-config-un': minor
---

zod: updated [`eslint-plugin-zod` from v3.12.0 to v4.5.2](https://github.com/marcalexiei/eslint-zod/compare/v3.12.0...eslint-plugin-zod%404.5.2):

- ❓ enabled the following rules if the resolved zod major version is >=4:
  - [`no-native-enum`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-native-enum.md)
  - [`no-promise-schema`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-promise-schema.md)
  - [`no-schema-with-is-nullable`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-schema-with-is-nullable.md)
  - [`no-schema-with-is-optional`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-schema-with-is-optional.md)
  - [`prefer-loose-object`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-loose-object.md)
  - [`prefer-strict-object`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-strict-object.md)
  - [`prefer-top-level-string-formats`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-top-level-string-formats.md)
- ❌ `no-string-schema-with-uuid` rule was removed
