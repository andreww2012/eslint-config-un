---
"eslint-config-un": minor
---

unicorn: `enforcePrefixForBooleanNames` option now allows the `cannot` prefix and no longer allows `do` by default, so functions like `doWork()` are not reported by [`unicorn/consistent-boolean-name`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-boolean-name.md) rule as non-booleans