---
"eslint-config-un": patch
---

noStylisticRules: the config now also disables the following naming rules, as renaming what they report doesn't change the behavior:

- [`eslint-react/naming-convention-context-name`](https://eslint-react.xyz/docs/rules/naming-convention-context-name)
- [`eslint-react/naming-convention-id-name`](https://eslint-react.xyz/docs/rules/naming-convention-id-name)
- [`eslint-react/naming-convention-ref-name`](https://eslint-react.xyz/docs/rules/naming-convention-ref-name)
- [`eslint-react/no-unnecessary-use-prefix`](https://eslint-react.xyz/docs/rules/no-unnecessary-use-prefix)
- [`unicorn/name-replacements`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/name-replacements.md)
- [`unicorn/no-non-function-verb-prefix`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-non-function-verb-prefix.md)
- [`zod/consistent-schema-var-name`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/consistent-schema-var-name.md)
- [`zod-mini/consistent-schema-var-name`](https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/consistent-schema-var-name.md)
