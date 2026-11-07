---
"eslint-config-un": patch
---

mocha: [`prefer-arrow-callback`](https://eslint.org/docs/latest/rules/prefer-arrow-callback) rule no longer reports and autofixes Mocha callbacks, which [`mocha/no-mocha-arrows`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/no-mocha-arrows.md) rule requires to be functions
