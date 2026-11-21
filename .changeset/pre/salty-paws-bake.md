---
"eslint-config-un": minor
---

unicorn: updated [`eslint-plugin-unicorn` from v79.0.0 to v80.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v79.0.0...v80.0.0):

- 🟢 enabled [`unicorn/prefer-options-parameter`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-options-parameter.md) rule
- 🟢 enabled [`unicorn/require-spread-parentheses`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/require-spread-parentheses.md) rule and added it to the `noStylisticRules` config
- 🔴 disabled [`unicorn/no-async-promise-finally`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-async-promise-finally.md) rule, which is no longer in the upstream presets, as it also reports async cleanup that handles its own errors
- 🔴 not enabled [`unicorn/prefer-regexp-exec`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-regexp-exec.md) rule, like the rules of the same name in the `regexp`, `sonar` and `ts` configs
- [`unicorn/no-unnecessary-nested-ternary`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unnecessary-nested-ternary.md) rule now optionally uses type information, so it is marked as such