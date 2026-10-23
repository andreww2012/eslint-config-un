---
"eslint-config-un": minor
---

css: updated [`eslint-cssicorn` from v0.2.0 to v0.3.0](https://github.com/sindresorhus/eslint-cssicorn/compare/v0.2.0...v0.3.0) and in ⚙️ `css/unicorn` sub-config:

- 🟢 enabled the following new rules:
  - [`cssicorn/no-overridden-animation-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-overridden-animation-properties.md)
  - [`cssicorn/no-unknown-type-selectors`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-unknown-type-selectors.md)
  - [`cssicorn/prefer-longhand-overrides`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-longhand-overrides.md)
- ❓ enabled [`cssicorn/prefer-subgrid`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-subgrid.md) rule unless the `baselineAvailability` root option is set to a year before 2023
- ❓ enabled [`cssicorn/consistent-custom-property-fallbacks`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-custom-property-fallbacks.md) rule for the custom properties from the `customProperties` option, if it's not empty
- Added a new option `knownElementNames` that lists the element names (strings or regular expressions) [`cssicorn/no-unknown-type-selectors`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-unknown-type-selectors.md) rule allows
