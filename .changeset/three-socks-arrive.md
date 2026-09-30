---
"eslint-config-un": minor
---

sonar: updated [`eslint-plugin-sonarjs` from v4.2.1 to v4.2.2](https://github.com/SonarSource/SonarJS/blob/27cf8a4bb72c7d84042299357fdee4548cd8d0ca/packages/analysis/src/jsts/rules/CHANGELOG.md#2026-09-28-version-422):

- 🟢 enabled `sonar/no-vue-mixins` rule regardless of whether `vue` package is installed, since the rule itself now only reports in projects depending on Vue 3+