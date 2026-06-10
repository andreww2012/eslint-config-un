---
'eslint-config-un': minor
---

react: updated [`eslint-plugin-react-hooks` from v7.0.1 to v7.1.1](https://github.com/facebook/react/blob/1ddff43c41147b880c22eb363e07aade5a71c5d9/packages/eslint-plugin-react-hooks/CHANGELOG.md):

- ❓ enabled conditionally `react-hooks/exhaustive-effect-dependencies` and `react-hooks/memo-dependencies` rules in ⚙️ `hooks` sub-config
- ❌ `react-hooks/automatic-effect-dependencies` and `react-hooks/fire` rule were removed
- ⚠️ `react-hooks/component-hook-factories` rule was disabled because got deprecated