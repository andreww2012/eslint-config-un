---
"eslint-config-un": minor
---

vitest: added options to list custom test helpers:

- `additionalSuiteFunctions`, for functions that group tests, like `describe`. [`vitest/require-hook`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-hook.md) allows calling them outside of hooks
- `additionalTestFunctions`, for functions that define a single test, like `it`. [`vitest/expect-expect`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/expect-expect.md), [`vitest/no-standalone-expect`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-standalone-expect.md) and [`vitest/require-hook`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-hook.md) treat them as tests
