---
'eslint-config-un': minor
---

<!-- cspell:ignore zipkeyed -->

es: updated [`eslint-plugin-es-x` from v9.6.0 to v9.7.0](https://github.com/eslint-community/eslint-plugin-es-x/compare/v9.6.0...v9.7.0):

- ❓ enabled conditionally the following rules:
  - [`es/no-atomics-pause`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-atomics-pause.html) rule
  - [`es/no-iterator-zip`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-iterator-zip.html) rule
  - [`es/no-iterator-zipkeyed`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-iterator-zipkeyed.html) rule
- The following ES features were moved to `2027` category:
  - `asyncDisposableStack`
  - `datePrototypeToTemporalInstant`
  - `disposableStack`
  - `suppressedError`
  - `symbolAsyncDispose`
  - `symbolDispose`
  - `temporal`
  - `using`