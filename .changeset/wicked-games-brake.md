---
'eslint-config-un': minor
---

css: `customSyntax` in the function form now receives `defaultSyntax` property in its first argument, containing the default CSS syntax used in `@eslint/css`. It is coming from `@eslint/css-tree` package so if it cannot be resolved, you will be prompted to install it if you use this function form.
