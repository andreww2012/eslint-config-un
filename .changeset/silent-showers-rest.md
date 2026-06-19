---
'eslint-config-un': minor
---

sonar: updated [`eslint-plugin-sonarjs` from v4.0.3 to v4.1.0](https://github.com/SonarSource/SonarJS/blob/e3f182e1a9e4a3590cc834da492cf5cf74844f90/packages/analysis/src/jsts/rules/CHANGELOG.md#2026-06-18-version-410):

- The following rules were enabled ❓ if `testsRules` option is set to `true`:
  - `sonarjs/async-test-assertions`
  - `sonarjs/hooks-before-test-cases`
  - `sonarjs/hooks-before-test-cases`
  - `sonarjs/no-duplicate-test-title`
  - `sonarjs/no-empty-test-title`
  - `sonarjs/no-forced-browser-interaction`
  - `sonarjs/no-incompatible-assertion-types`
  - `sonarjs/no-trivial-assertions`
  - `sonarjs/prefer-specific-assertions`
- The following rules were ⚠️ disabled because got deprecated:
  - `sonarjs/confidential-information-logging`
  - `sonarjs/frame-ancestors`
  - `sonarjs/hidden-files`
  - `sonarjs/no-intrusive-permissions`
  - `sonarjs/no-ip-forward`
  - `sonarjs/no-mixed-content`
  - `sonarjs/os-command`
- The following rules were 🟢 enabled:
  - `sonarjs/no-floating-point-equality`
  - `sonarjs/super-linear-regex`