---
'eslint-config-un': patch
---

vitest: Disabled autofixes for [`vitest/prefer-lowercase-title`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-lowercase-title.md) and `vitest/require-import-vi-mock` rules because they are not safe:

- In the first case, automatic test case rename might be undesirable.
- In the second case, the rule may remove the import statements and cause runtime/TypeScript errors.
