---
'eslint-config-un': minor
---

sonar: updated [`eslint-plugin-sonarjs` from v4.2.0 to v4.2.1](https://github.com/SonarSource/SonarJS/blob/6b11c6ee96a415548f9e754f6764a0b3c30aa45f/packages/analysis/src/jsts/rules/CHANGELOG.md#2026-09-15-version-421):

- The following rules were 🟢 enabled:
  - `sonar/avoid-mutating-nested-properties-of-shallow-clones`
  - `sonar/no-debounce-throttle-in-render`
  - `sonar/no-mutate-reactive-state-in-updated-hook`
  - `sonar/no-vue-class-component`
  - `sonar/prefer-native-axios-alternative`
  - `sonar/prefer-native-jquery-alternative`
- ❓ enabled `sonar/no-vue-mixins` rule if `vue` package is installed
- The following rules were enabled ❓ if `testsRules` option is set to `true`:
  - `sonar/composite-assertions`
  - `sonar/no-duplicate-parameterized-test-case`
  - `sonar/no-empty-parameterized-test-dataset`
  - `sonar/prefer-cypress-should`
  - `sonar/synchronous-exception-assertions`
- The following rules were 🔴 not enabled because they overlap with rules from other configs:
  - `sonar/no-networkidle-wait` <!-- cspell:disable-line -->
  - `sonar/testing-library-prefer-query-by-disappearance`
  - `sonar/testing-library-query-assertion`
  - `sonar/vitest-mock-at-module-scope`