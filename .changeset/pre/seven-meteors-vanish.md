---
"eslint-config-un": minor
---

unicorn: `enforcePrefixForBooleanNames` option now supports all the [`unicorn/consistent-boolean-name`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-boolean-name.md) rule option fields with enhanced types and smart defaults. For example, it now sets some [`wrappers`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-boolean-name.md#wrappers) to support some popular Vue's and other libraries' classes/interfaces that variables with boolean semantics might be typed as, like Vue's `Ref`s