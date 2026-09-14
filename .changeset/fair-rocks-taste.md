---
'eslint-config-un': minor
---

zod:

- updated [`eslint-plugin-zod` from v4.9.0 to v4.13.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod@4.9.0...eslint-plugin-zod@4.13.0):
  - 🟢 enabled the following rules:
    - [`zod/prefer-map-set-size-over-min-max`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-map-set-size-over-min-max.md) and added it to the `noStylisticRules` config
    - [`zod/prefer-string-length-over-min-max`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-string-length-over-min-max.md) and added it to the `noStylisticRules` config
    - [`zod/prefer-validate`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/prefer-validate.md) (only if detected zod version is >=4.6)
  - added a new option `schemaCompiler`, controlling the following rules:
    - [`zod/no-dynamic-schema-value`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-dynamic-schema-value.md), enabled if set to `'zodCompilerPackage'` (the default if `zod-compiler` package is installed)
    - [`zod/no-function-scoped-schema`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/no-function-scoped-schema.md), enabled if set to `'zodCompileBuiltIn'`
- updated [`eslint-plugin-zod-mini` from v1.6.0 to v1.10.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod-mini@1.6.0...eslint-plugin-zod-mini@1.10.0):
  - 🟢 enabled the following rules:
    - [`zod-mini/no-native-enum`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/no-native-enum.md) (only if detected zod version is >=4)
    - [`zod-mini/no-promise-schema`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/no-promise-schema.md) (only if detected zod version is >=4)
    - [`zod-mini/prefer-map-set-size-over-min-max`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/prefer-map-set-size-over-min-max.md) and added it to the `noStylisticRules` config
    - [`zod-mini/prefer-string-length-over-min-max`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/prefer-string-length-over-min-max.md) and added it to the `noStylisticRules` config
    - [`zod-mini/prefer-validate`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/prefer-validate.md) (only if detected zod version is >=4.6)
  - added a new option `schemaCompiler` to the `mini` sub-config (inherits the parent config value by default), controlling the following rules:
    - [`zod-mini/no-dynamic-schema-value`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/no-dynamic-schema-value.md), enabled if set to `'zodCompilerPackage'`
    - [`zod-mini/no-function-scoped-schema`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/no-function-scoped-schema.md), enabled if set to `'zodCompileBuiltIn'`
- updated [`eslint-plugin-zod-core` from v1.0.9 to v1.1.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod-core@1.0.9...eslint-plugin-zod-core@1.1.0) and 🟢 enabled [`zod-core/prefer-validate`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/docs/rules/prefer-validate.md) rule (only if detected zod version is >=4.6)
