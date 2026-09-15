---
'eslint-config-un': minor
---

sonar:

- [**BREAKING**] `sonar/test-check-exception` rule is now only enabled if `testsRules` option is set to `true`
- Added typing for the plugin's `detectedModuleType` shared setting
- 🔴 `sonar/code-eval` rule is now explicitly not enabled (previously was ignored as it was deemed deprecated in the plugin changelog, but it is still not)