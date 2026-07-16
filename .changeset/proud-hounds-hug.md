---
'eslint-config-un': minor
---

<!-- cspell:ignore outerhtml -->

angular: updated [`@angular-eslint/*` from v22.0.0 to v22.1.0](https://github.com/angular-eslint/angular-eslint/compare/v22.0.0...v22.1.0):

- 🟢 enabled the following rules:
  - [`angular/inject-at-top`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/inject-at-top.md)
  - [`angular-template/no-outerhtml`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-outerhtml.md)
  - [`angular-template/require-switch-default`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/require-switch-default.md)
- ❓ enabled [`angular/prefer-service-decorator`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-service-decorator.md) rule when the resolved Angular version is at least 22 and added this rule to the `noStylisticRules` config