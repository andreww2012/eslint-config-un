---
"eslint-config-un": patch
---

jest, unusedImports, vitest: the `ts/*` rules these configs replace, like [`ts/unbound-method`](https://typescript-eslint.io/rules/unbound-method) and [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars), are now actually turned off, and `ts/*` rules in their `overridesAny` take effect
