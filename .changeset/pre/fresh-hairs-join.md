---
'eslint-config-un': minor
---

solid: updated [`eslint-plugin-solid` from v0.14.5 to v0.17.0](https://github.com/solidjs-community/eslint-plugin-solid/compare/v0.14.5...v0.17.0):

- Added the `settings` option, which only accepts the `svelte-js` package `version`. If not specified, it falls back to the detected version. Previous version-dependent rules now use the version resolved from either this settings option or the detected `solid-js` package version (as before)
- 🟢 enabled the following rules if the resolved Svelte major version is at least 2:
  - [`solid/no-accessor-as-prop`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-accessor-as-prop.md)
  - [`solid/no-browser-globals-in-server-function`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-browser-globals-in-server-function.md)
  - [`solid/no-invalid-server-capture`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-invalid-server-capture.md)
  - [`solid/no-module-scope-reactive-primitive`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-module-scope-reactive-primitive.md)
  - [`solid/no-restated-default-options`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-restated-default-options.md)
  - [`solid/no-single-arg-create-effect`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/no-single-arg-create-effect.md)
  - [`solid/prefer-onSettled-for-side-effects`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/prefer-onSettled-for-side-effects.md)
  - [`solid/prefer-structured-class`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/prefer-structured-class.md)
  - [`solid/removed-api`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/removed-api.md)
  - [`solid/require-async-server-function`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/require-async-server-function.md)
  - [`solid/valid-use-server`](https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/valid-use-server.md)