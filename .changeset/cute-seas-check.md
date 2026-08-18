---
"eslint-config-un": minor
---

`files` and `ignores` Config options now support the function form, which receives the patterns the option would be resolved to if it was not passed. This form can be useful for configs like `import/allowDefaultExport`, where you may want to add your `files` to allow the `export default` in, not to override the default list