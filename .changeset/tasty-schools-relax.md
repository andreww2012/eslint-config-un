---
"eslint-config-un": minor
---

un: added `un/consistent-nullish-comparison` rule, off by default, which reports comparisons with `null` and `undefined` that `== null` and `!= null` can replace without a change in behavior, or the other way round when set to `'strict'`