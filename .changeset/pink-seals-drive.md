---
'eslint-config-un': minor
---

vitest: updated [`@vitest/eslint-plugin` from v1.6.1 to v1.6.6](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.6.1...v1.6.6):

- Set [`expectAssertions: true`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-conditional-expect.md#expectassertions) for [`vitest/no-conditional-expect`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-conditional-expect.md) rule
- Set [`fixable: false`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-import-in-mock.md#options) for [`vitest/prefer-import-in-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-import-in-mock.md) rule and do not disable autofix globally
- 🟢 enabled [`vitest/prefer-mock-return-shorthand`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-mock-return-shorthand.md) rule and added it to `noStylistic` config
- 🔴 not enabled [`vitest/require-test-timeout`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-test-timeout.md) rule
