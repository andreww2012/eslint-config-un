---
"eslint-config-un": minor
---

unicorn: updated [`eslint-plugin-unicorn` from v78.0.0 to v79.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v78.0.0...v79.0.0):

- [`unicorn/no-top-level-side-effects`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-top-level-side-effects.md) now only reports mutations of globals, not unknown calls
- Re-enabled autofix for the following rules, since their fixes that could break code are now safe or offered as suggestions:
  - [`unicorn/consistent-existence-index-check`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-existence-index-check.md)
  - [`unicorn/no-useless-spread`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-spread.md)
  - [`unicorn/prefer-modern-dom-apis`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-modern-dom-apis.md)
  - [`unicorn/prefer-modern-math-apis`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-modern-math-apis.md)
  - [`unicorn/prefer-string-raw`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-string-raw.md)
