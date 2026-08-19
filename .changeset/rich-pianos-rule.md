---
'eslint-config-un': patch
---

markdown, mdx: the following rules are now disabled in embedded code blocks:

- [`require-await`](https://eslint.org/docs/latest/rules/require-await)
- [`node/no-top-level-await`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md)
- sonarjs/no-clear-text-protocols
- [`unicorn/consistent-function-scoping`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-function-scoping.md)