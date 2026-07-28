---
'eslint-config-un': minor
---

mocha: updated [`eslint-plugin-mocha` from v11.3.0 to v12.0.1](https://github.com/lo1tuma/eslint-plugin-mocha/compare/11.3.0...eslint-plugin-mocha%4012.0.1):

- 🔄 `mocha/no-return-and-callback` was renamed to [`mocha/no-return-and-done`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-return-and-done.md)
- 🔄 `mocha/no-setup-in-describe` was renamed to [`mocha/no-setup-in-suite`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-setup-in-suite.md)
- 🔄 `mocha/no-hooks-for-single-case` was renamed to [`mocha/no-hooks-for-single-child`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-hooks-for-single-child.md)
- 🔄 `mocha/no-global-tests` was renamed to [`mocha/no-top-level-tests`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-top-level-tests.md)
- 🔄 `mocha/no-top-level-hooks` was renamed to [`mocha/no-root-hooks`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-root-hooks.md)
- ❌ `mocha/no-sibling-hooks` rule was removed
- 🟢 enabled the following rules:
  - [`mocha/consistent-structure`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/consistent-structure.md) (also added it to the `noStylisticRules` config)
  - [`mocha/no-async-and-done`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-async-and-done.md)
  - [`mocha/no-async-in-sync-tests`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-async-in-sync-tests.md)
  - [`mocha/no-code-after-done`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-code-after-done.md)
  - [`mocha/no-conditional-tests`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-conditional-tests.md)
  - [`mocha/no-done-twice`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-done-twice.md)
- 🔴 not enabled the following rules:
  - [`mocha/limit-retries`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/limit-retries.md) rule
  - [`mocha/limit-slow`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/limit-slow.md) rule
  - [`mocha/limit-timeout`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/limit-timeout.md) rule
  - [`mocha/no-nested-suites`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-nested-suites.md) rule