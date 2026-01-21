---
'eslint-config-un': patch
---

unicorn: disabled autofix for [`prefer-string-raw`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-string-raw.md) because changing a string literal to `String.raw` expression may lead to type errors
