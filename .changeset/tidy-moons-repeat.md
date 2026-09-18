---
"eslint-config-un": minor
---

[**BREAKING**] vue, svelte: `reportUnusedDisableDirectives` option now takes a severity instead of a boolean, and `svelte` config got the same option. Unless set, both inherit the severity of the `linterOptionsReportUnusedDisableDirectives` root option, so [`vue/comment-directive`](https://eslint.vuejs.org/rules/comment-directive.html) and [`svelte/comment-directive`](https://sveltejs.github.io/eslint-plugin-svelte/rules/comment-directive) now report unused disable directives as warnings by default instead of errors