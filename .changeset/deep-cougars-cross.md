---
"eslint-config-un": minor
---

un: added `un/consistent-empty-string-check` rule, off by default, which reports `=== ''` and `!== ''` comparisons of strings that `.length === 0` and `.length > 0` can replace without a change in behavior, or the other way around with the `empty-string` option
