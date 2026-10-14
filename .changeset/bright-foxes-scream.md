---
"eslint-config-un": patch
---

zod: updated [`eslint-plugin-zod` from v5.0.0 to v5.1.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod@5.0.0...eslint-plugin-zod@5.1.0), [`eslint-plugin-zod-mini` from v2.0.0 to v2.1.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod-mini@2.0.0...eslint-plugin-zod-mini@2.1.0) and [`eslint-plugin-zod-core` from v2.0.0 to v2.1.0](https://github.com/marcalexiei/eslint-zod/compare/eslint-plugin-zod-core@2.0.0...eslint-plugin-zod-core@2.1.0):

- ⚙️ `core` sub-config: [`zod-core/consistent-import`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/docs/rules/consistent-import.md) rule now enforces namespace import if `enforceConsistentImport` option of the parent config is `'named'`, since the rule no longer supports `named` syntax